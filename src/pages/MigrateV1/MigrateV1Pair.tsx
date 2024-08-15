import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { LiquidityEventName, LiquiditySource } from '@uniswap/analytics-events'
import { CurrencyAmount, Fraction, Percent, Price, Token } from '@vnaysn/jediswap-sdk-core'
import { FeeAmount, Pool, Position, priceToClosestTick, TickMath } from '@vnaysn/jediswap-sdk-v3'
import { useWeb3React } from '@web3-react/core'
import { sendAnalyticsEvent, useTrace } from 'analytics'
import Badge, { BadgeVariant } from 'components/Badge'
import { ButtonConfirmed } from 'components/Button'
import { BlueCard, DarkGrayCard, LightCard, YellowCard } from 'components/Card'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import FeeSelector from 'components/FeeSelector'
import RangeSelector from 'components/RangeSelector'
import RateToggle from 'components/RateToggle'
import SettingsTab from 'components/Settings'
import { Dots } from 'components/swap/styled'
import { V2Unsupported } from 'components/V2Unsupported'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
import { PoolState, usePool } from 'hooks/usePools'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useV2LiquidityTokenPermit } from 'hooks/useV2LiquidityTokenPermit'
import JSBI from 'jsbi'
import { NEVER_RELOAD } from 'lib/hooks/multicall'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, ArrowDown } from 'react-feather'
import { Navigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useAppDispatch } from 'state/hooks'
import { Bound, resetMintState } from 'state/mint/v3/actions'
import {
  useRangeHopCallbacks,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useTheme } from 'styled-components'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { unwrappedToken } from 'utils/unwrappedToken'

import { AutoColumn } from '../../components/Column'
import FormattedCurrencyAmount from '../../components/FormattedCurrencyAmount'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import { useCurrency, useToken } from '../../hooks/Tokens'
import { usePairContract, useRouterContract } from '../../hooks/useContractV2'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useTotalSupply } from '../../hooks/useTotalSupply'
import { useTokenBalance } from '../../state/connection/hooks'
import { TransactionType } from '../../state/transactions/types'
import { BackArrowLink, ExternalLink, ThemedText } from '../../theme/components'
import { isAddress } from '../../utils'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { BodyWrapper } from '../AppBody'
import { useAccountDetails } from 'hooks/starknet-react'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useMultipleContractSingleData, useSingleCallResult } from 'state/multicall/hooks'
import { cairo, Call, CallData, Contract } from 'starknet'
import { useV2Pair } from 'hooks/useV2Pairs'
import JediswapPairABI from 'constants/abis/Pair.json'
import { Pair } from '@vnaysn/jediswap-sdk-v2'
import { useContractWrite } from '@starknet-react/core'
import { useApprovalCall } from 'hooks/useApproveCall'
import { toI32 } from 'utils/toI32'
import { DynamicSection, StyledInput } from 'pages/AddLiquidity/styled'
import HoverInlineText from 'components/HoverInlineText'
import { ZERO_PERCENT } from 'constants/misc'

const ZERO = JSBI.BigInt(0)

const DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE = new Percent(75, 10_000)

function EmptyState({ message }: { message: ReactNode }) {
  return (
    <AutoColumn style={{ minHeight: 200, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText.DeprecatedBody>{message}</ThemedText.DeprecatedBody>
    </AutoColumn>
  )
}

function LiquidityInfo({
  token0Amount,
  token1Amount,
}: {
  token0Amount: CurrencyAmount<Token>
  token1Amount: CurrencyAmount<Token>
}) {
  const currency0 = unwrappedToken(token0Amount.currency)
  const currency1 = unwrappedToken(token1Amount.currency)

  return (
    <AutoColumn gap="sm">
      <RowBetween>
        <RowFixed>
          <CurrencyLogo size="20px" style={{ marginRight: '8px' }} currency={currency0} />
          <Text fontSize={16} fontWeight={535}>
            {currency0.symbol}
          </Text>
        </RowFixed>
        <Text fontSize={16} fontWeight={535}>
          <FormattedCurrencyAmount currencyAmount={token0Amount} />
        </Text>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <CurrencyLogo size="20px" style={{ marginRight: '8px' }} currency={currency1} />
          <Text fontSize={16} fontWeight={535}>
            {currency1.symbol}
          </Text>
        </RowFixed>

        <Text fontSize={16} fontWeight={535}>
          <FormattedCurrencyAmount currencyAmount={token1Amount} />
        </Text>
      </RowBetween>
    </AutoColumn>
  )
}

function V2PairMigration({
  pair,
  pairContract,
  pairBalance,
  totalSupply,
  reserve0,
  reserve1,
  token0,
  token1,
}: {
  pair: Pair
  pairContract: Contract
  pairBalance: CurrencyAmount<Token>
  totalSupply: CurrencyAmount<Token>
  reserve0: any
  reserve1: any
  token0: Token
  token1: Token
}) {
  const { chainId, address: account } = useAccountDetails()
  const router = useRouterContract()
  const theme = useTheme()
  const deadline = useTransactionDeadline() // custom from users settings
  const blockTimestamp = useCurrentBlockTimestamp()
  // const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE) // custom from users

  const [mintCallData, setMintCallData] = useState<Call[]>([])

  const { writeAsync, data: txData } = useContractWrite({
    calls: mintCallData,
  })

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  const baseCurrency = currency0
  const quoteCurrency = currency1

  // this is just getLiquidityValue with the fee off, but for the passed pair
  const token0Value = useMemo(
    () => pair.getLiquidityValue(pair.token0, totalSupply, pairBalance, false),
    [token0, pairBalance, reserve0, totalSupply]
  )
  const token1Value = useMemo(
    () => pair.getLiquidityValue(pair.token1, totalSupply, pairBalance, false),
    [token1, pairBalance, reserve1, totalSupply]
  )

  const allowedSlippageForRemoving = useUserSlippageToleranceWithDefault(DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE)

  const token0ValueWithSlippage = token0Value.multiply(new Percent(1).subtract(allowedSlippageForRemoving))
  const token1ValueWithSlippage = token1Value.multiply(new Percent(1).subtract(allowedSlippageForRemoving))

  // set up v3 pool
  const [feeAmount, setFeeAmount] = useState(FeeAmount.MEDIUM)
  const [poolState, pool] = usePool(token0, token1, feeAmount)

  const noLiquidity = poolState === PoolState.NOT_EXISTS

  // get spot prices + price difference
  const v2SpotPrice = useMemo(() => new Price(token0, token1, reserve0, reserve1), [token0, token1, reserve0, reserve1])
  // const v3SpotPrice = poolState === PoolState.EXISTS ? pool?.token0Price : undefined

  // let priceDifferenceFraction: Fraction | undefined =
  //   v2SpotPrice && v3SpotPrice ? v3SpotPrice.divide(v2SpotPrice).subtract(1).multiply(100) : undefined
  // if (priceDifferenceFraction?.lessThan(ZERO)) {
  //   priceDifferenceFraction = priceDifferenceFraction.multiply(-1)
  // }

  // the following is a small hack to get access to price range data/input handlers
  const [baseToken, setBaseToken] = useState(token0)
  const {
    ticks,
    pricesAtTicks,
    invertPrice,
    invalidRange,
    outOfRange,
    ticksAtLimit,
    price,
    position: position2,
  } = useV3DerivedMintInfo(token0, token1, feeAmount, baseToken)
  // console.log('price!!!', price?.toSignificant(), price)

  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE
  )

  // console.log(ticks, pricesAtTicks, invertPrice, invalidRange, outOfRange, ticksAtLimit, 'skdndkfndk')

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
    baseToken,
    baseToken.equals(token0) ? token1 : token0,
    feeAmount,
    tickLower,
    tickUpper
  )

  const { onLeftRangeInput, onRightRangeInput, onStartPriceInput } = useV3MintActionHandlers(noLiquidity)
  const { independentField, typedValue, startPriceTypedValue } = useV3MintState()

  // the v3 tick is either the pool's tickCurrent, or the tick closest to the v2 spot price
  // const tick = pool?.tickCurrent ?? priceToClosestTick(v2SpotPrice)
  const tick = pool?.tickCurrent ?? (price ? priceToClosestTick(price) : undefined)
  // console.log('tick', tick)
  // the price is either the current v3 price, or the price at the tick
  const sqrtPrice = pool?.sqrtRatioX96 ?? (tick !== undefined ? TickMath.getSqrtRatioAtTick(tick) : undefined)
  // const sqrtPrice = tick ? TickMath.getSqrtRatioAtTick(tick) : undefined
  const position =
    typeof tickLower === 'number' && typeof tickUpper === 'number' && !invalidRange && sqrtPrice && tick !== undefined
      ? Position.fromAmounts({
          pool: pool ?? new Pool(token0, token1, feeAmount, sqrtPrice, 0, tick, []),
          tickLower,
          tickUpper,
          amount0: token0Value.quotient,
          amount1: token1Value.quotient,
          useFullPrecision: true, // we want full precision for the theoretical position
        })
      : undefined

  // console.log('sqrtPrice_migrate', sqrtPrice?.toString(), 'tick_migrate', tick, 'price', price?.toSignificant())
  const { amount0: v3Amount0Min, amount1: v3Amount1Min } = useMemo(
    () => (position ? position.mintAmountsWithSlippage(allowedSlippage) : { amount0: undefined, amount1: undefined }),
    [position, allowedSlippage]
  )

  const refund0 = useMemo(
    () =>
      position && CurrencyAmount.fromRawAmount(token0, JSBI.subtract(token0Value.quotient, position.amount0.quotient)),
    [token0Value, position, token0]
  )
  const refund1 = useMemo(
    () =>
      position && CurrencyAmount.fromRawAmount(token1, JSBI.subtract(token1Value.quotient, position.amount1.quotient)),
    [token1Value, position, token1]
  )

  const [confirmingMigration, setConfirmingMigration] = useState<boolean>(false)
  const [pendingMigrationHash, setPendingMigrationHash] = useState<string | null>(null)

  const isMigrationPending = useIsTransactionPending(pendingMigrationHash ?? undefined)

  const { amount0: amount0Desired, amount1: amount1Desired } = position?.mintAmounts || {}

  const networkSupportsV2 = useNetworkSupportsV2()

  useEffect(() => {
    if (mintCallData) {
      writeAsync()
        .then((response) => {
          // setAttemptingTxn(false)
          if (response?.transaction_hash) {
            // setTxHash(response.transaction_hash)
          }
        })
        .catch((err) => {
          console.log(err?.message)
          setConfirmingMigration(false)
          // setAttemptingTxn(false)
        })
    }
  }, [mintCallData])

  const percentToRemove: Percent = new Percent('100', '100')
  const liquidityAmount = CurrencyAmount.fromRawAmount(
    pairBalance.currency,
    percentToRemove.multiply(pairBalance.raw).quotient
  )

  const approvalLiqCallback = useApprovalCall(liquidityAmount, router?.address)
  const routerAddress: string = NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID]
  const approvalACallback = useApprovalCall(CurrencyAmount.fromRawAmount(currency0, amount0Desired || 0), routerAddress)
  const approvalBCallback = useApprovalCall(CurrencyAmount.fromRawAmount(currency1, amount1Desired || 0), routerAddress)

  const migrate = async () => {
    if (
      !router ||
      !account ||
      !deadline ||
      !blockTimestamp ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      !v3Amount0Min ||
      !v3Amount1Min ||
      !chainId ||
      !position
    )
      return

    const removeLiquidityArgs = {
      tokenA: token0.address,
      tokenB: token1.address,
      liquidity: cairo.uint256(liquidityAmount.raw.toString()),
      amountAMin: cairo.uint256(token0ValueWithSlippage.quotient.toString()),
      amountBMin: cairo.uint256(token1ValueWithSlippage.quotient.toString()),
      to: account,
      deadline: deadline.toHexString(),
    }

    const removeLiquidityCalldata = CallData.compile(removeLiquidityArgs)

    const calls = {
      contractAddress: router.address,
      entrypoint: 'remove_liquidity',
      calldata: removeLiquidityCalldata,
    }

    const callData = []
    if (noLiquidity) {
      //create and initialize pool
      const initializeData = {
        token0: position.pool.token0.address,
        token1: position.pool.token1.address,
        fee: position.pool.fee,
        sqrt_price_X96: cairo.uint256(position?.pool?.sqrtRatioX96.toString()),
      }

      // console.log('position?.pool?.sqrtRatioX96.toString()', position?.pool?.sqrtRatioX96.toString())
      const initializeCallData = CallData.compile(initializeData)
      const icalls = {
        contractAddress: routerAddress,
        entrypoint: 'create_and_initialize_pool',
        calldata: initializeCallData,
      }
      callData.push(icalls)
    }
    const approval = approvalLiqCallback()
    const approvalA = approvalACallback()
    const approvalB = approvalBCallback()
    if (approval) {
      callData.push(approval)
    }
    callData.push(calls)
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    if (approvalA && JSBI.GT(amount0Desired, 0)) {
      callData.push(approvalA)
    }
    if (approvalB && JSBI.GT(amount1Desired, 0)) {
      callData.push(approvalB)
    }

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(allowedSlippage)
    const amount0Min = minimumAmounts.amount0
    const amount1Min = minimumAmounts.amount1

    const mintData = {
      token0: position.pool.token0.address,
      token1: position.pool.token1.address,
      fee: position.pool.fee,
      tick_lower: toI32(position.tickLower),
      tick_upper: toI32(position.tickUpper),
      amount0Desired: cairo.uint256(amount0Desired.toString()),
      amount1Desired: cairo.uint256(amount1Desired.toString()),
      amount0_min: cairo.uint256(amount0Min.toString()),
      amount1_min: cairo.uint256(amount1Min.toString()),
      recipient: account,
      deadline: cairo.felt(deadline.toString()),
    }
    console.log('mintData', mintData)
    const mintCallData = CallData.compile(mintData)
    const mcalls = {
      contractAddress: routerAddress,
      entrypoint: 'mint',
      calldata: mintCallData,
    }

    callData.push(mcalls)

    setMintCallData(callData)

    setConfirmingMigration(true)
  }

  const isSuccessfullyMigrated = !!pendingMigrationHash && JSBI.equal(pairBalance.quotient, ZERO)
  // if (!networkSupportsV2) return <V2Unsupported />

  return (
    <AutoColumn gap="20px">
      <ThemedText.DeprecatedBody my={9} style={{ fontWeight: 485 }}>
        <Trans>This tool will safely migrate your V1 liquidity to V2. The process is completely trustless.</Trans>
      </ThemedText.DeprecatedBody>

      <LightCard>
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed style={{ marginLeft: '8px' }}>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={false} size={20} />
              <ThemedText.DeprecatedMediumHeader style={{ marginLeft: '8px' }}>
                <Trans>
                  {currency0.symbol}/{currency1.symbol} LP Tokens
                </Trans>
              </ThemedText.DeprecatedMediumHeader>
            </RowFixed>
            <Badge variant={BadgeVariant.WARNING}>V1</Badge>
          </RowBetween>
          <LiquidityInfo token0Amount={token0Value} token1Amount={token1Value} />
        </AutoColumn>
      </LightCard>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ArrowDown size={24} />
      </div>

      <LightCard>
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed style={{ marginLeft: '8px' }}>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={false} size={20} />
              <ThemedText.DeprecatedMediumHeader style={{ marginLeft: '8px' }}>
                <Trans>
                  {currency0.symbol}/{currency1.symbol} LP NFT
                </Trans>
              </ThemedText.DeprecatedMediumHeader>
            </RowFixed>
            <Badge variant={BadgeVariant.PRIMARY}>V2</Badge>
          </RowBetween>

          <FeeSelector feeAmount={feeAmount} handleFeePoolSelect={setFeeAmount} />
          <DynamicSection gap="md" disabled={!feeAmount}>
            {!noLiquidity ? (
              <>
                {Boolean(price && baseCurrency && quoteCurrency) && (
                  <AutoColumn gap="2px" style={{ marginTop: '0.5rem' }}>
                    <Trans>
                      <ThemedText.DeprecatedMain fontWeight={535} fontSize={12} color="text1">
                        Current price:
                      </ThemedText.DeprecatedMain>
                      <ThemedText.DeprecatedBody fontWeight={535} fontSize={20} color="text1">
                        {price && (
                          <HoverInlineText
                            maxCharacters={20}
                            text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                          />
                        )}
                      </ThemedText.DeprecatedBody>
                      {baseCurrency && (
                        <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                          {quoteCurrency?.symbol} per {baseCurrency.symbol}
                        </ThemedText.DeprecatedBody>
                      )}
                    </Trans>
                  </AutoColumn>
                )}
              </>
            ) : (
              <AutoColumn gap="md">
                {noLiquidity && (
                  <BlueCard
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '1rem 1rem',
                    }}
                  >
                    <ThemedText.DeprecatedBody fontSize={12} textAlign="left" color={theme.accent1}>
                      <Trans>
                        This pool must be initialized before you can add liquidity. To initialize, select a starting
                        price for the pool. Then, enter your liquidity price range and deposit amount. Gas fees will be
                        higher than usual due to the initialization transaction.
                      </Trans>
                    </ThemedText.DeprecatedBody>
                  </BlueCard>
                )}
                <LightCard padding="12px">
                  <StyledInput
                    className="start-price-input"
                    value={startPriceTypedValue}
                    onUserInput={onStartPriceInput}
                  />
                </LightCard>
                <RowBetween
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                  }}
                >
                  <ThemedText.DeprecatedMain>
                    <Trans>Starting {baseCurrency?.symbol} Price:</Trans>
                  </ThemedText.DeprecatedMain>
                  <ThemedText.DeprecatedMain>
                    {price ? (
                      <ThemedText.DeprecatedMain>
                        <RowFixed>
                          <HoverInlineText
                            maxCharacters={20}
                            text={invertPrice ? price?.invert()?.toSignificant(8) : price?.toSignificant(8)}
                          />{' '}
                          <span style={{ marginLeft: '4px' }}>
                            {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                          </span>
                        </RowFixed>
                      </ThemedText.DeprecatedMain>
                    ) : (
                      '-'
                    )}
                  </ThemedText.DeprecatedMain>
                </RowBetween>
              </AutoColumn>
            )}
          </DynamicSection>
          {/* {noLiquidity && (
            <BlueCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AlertCircle color={theme.neutral1} style={{ marginBottom: '12px', opacity: 0.8 }} />
              {v2SpotPrice && (
                <AutoColumn gap="sm" style={{ marginTop: '12px' }}>
                  <RowBetween>
                    <ThemedText.DeprecatedBody fontWeight={535} fontSize={14}>
                      <Trans>
                        {false ? 'SushiSwap' : 'V2'} {invertPrice ? currency1.symbol : currency0.symbol} Price:
                      </Trans>{' '}
                      {invertPrice
                        ? `${v2SpotPrice?.invert()?.toSignificant(6)} ${currency0.symbol}`
                        : `${v2SpotPrice?.toSignificant(6)} ${currency1.symbol}`}
                    </ThemedText.DeprecatedBody>
                  </RowBetween>
                </AutoColumn>
              )}
            </BlueCard>
          )} */}

          <RowBetween>
            <ThemedText.DeprecatedLabel>
              <Trans>Set price range</Trans>
            </ThemedText.DeprecatedLabel>
            <RateToggle
              currencyA={invertPrice ? currency1 : currency0}
              currencyB={invertPrice ? currency0 : currency1}
              handleRateToggle={() => {
                onLeftRangeInput('')
                onRightRangeInput('')
                setBaseToken((base) => (base.equals(token0) ? token1 : token0))
              }}
            />
          </RowBetween>

          <RangeSelector
            priceLower={priceLower}
            priceUpper={priceUpper}
            onLeftRangeInput={onLeftRangeInput}
            onRightRangeInput={onRightRangeInput}
            currencyA={invertPrice ? currency1 : currency0}
            currencyB={invertPrice ? currency0 : currency1}
            feeAmount={feeAmount}
            ticksAtLimit={ticksAtLimit}
          />

          {outOfRange ? (
            <YellowCard padding="8px 12px" $borderRadius="12px">
              <RowBetween>
                <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                  <Trans>
                    Your position will not earn fees or be used in trades until the market price moves into your range.
                  </Trans>
                </ThemedText.DeprecatedYellow>
              </RowBetween>
            </YellowCard>
          ) : null}

          {invalidRange ? (
            <YellowCard padding="8px 12px" $borderRadius="12px">
              <RowBetween>
                <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                  <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                </ThemedText.DeprecatedYellow>
              </RowBetween>
            </YellowCard>
          ) : null}

          {position ? (
            <DarkGrayCard>
              <AutoColumn gap="md">
                <LiquidityInfo token0Amount={position.amount0} token1Amount={position.amount1} />
                {/* {chainId && refund0 && refund1 ? (
                  <ThemedText.DeprecatedBlack fontSize={12}>
                    <Trans>
                      At least {formatCurrencyAmount(refund0, 4)}{' '}
                      {chainId && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(token0) ? 'ETH' : token0.symbol} and{' '}
                      {formatCurrencyAmount(refund1, 4)}{' '}
                      {chainId && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(token1) ? 'ETH' : token1.symbol} will be
                      refunded to your wallet due to selected price range.
                    </Trans>
                  </ThemedText.DeprecatedBlack>
                ) : null} */}
              </AutoColumn>
            </DarkGrayCard>
          ) : null}

          <AutoColumn gap="md">
            {/* {!isSuccessfullyMigrated && !isMigrationPending ? (
              <AutoColumn gap="md" style={{ flex: '1' }}>
                <ButtonConfirmed
                  confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                  disabled={
                    approval !== ApprovalState.NOT_APPROVED ||
                    signatureData !== null ||
                    !v3Amount0Min ||
                    !v3Amount1Min ||
                    invalidRange ||
                    confirmingMigration
                  }
                  onClick={approve}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>
                      <Trans>Approving</Trans>
                    </Dots>
                  ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                    <Trans>Allowed</Trans>
                  ) : (
                    <Trans>Allow LP token migration</Trans>
                  )}
                </ButtonConfirmed>
              </AutoColumn>
            ) : null} */}
            <AutoColumn gap="md" style={{ flex: '1' }}>
              <ButtonConfirmed
                confirmed={isSuccessfullyMigrated}
                disabled={
                  !v3Amount0Min ||
                  !v3Amount1Min ||
                  invalidRange ||
                  // approval !== ApprovalState.APPROVED ||
                  confirmingMigration ||
                  isMigrationPending ||
                  isSuccessfullyMigrated
                }
                onClick={migrate}
              >
                {isSuccessfullyMigrated ? (
                  'Success!'
                ) : isMigrationPending ? (
                  <Dots>
                    <Trans>Migrating</Trans>
                  </Dots>
                ) : (
                  <Trans>Migrate</Trans>
                )}
              </ButtonConfirmed>
            </AutoColumn>
          </AutoColumn>
        </AutoColumn>
      </LightCard>
    </AutoColumn>
  )
}

export default function MigrateV2Pair() {
  const { address } = useParams<{ address: string }>()
  // reset mint state on component mount, and as a cleanup (on unmount)
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(resetMintState())
    return () => {
      dispatch(resetMintState())
    }
  }, [dispatch])

  const { chainId, address: account } = useAccountDetails()

  // get pair contract
  const validatedAddress = isAddressValidForStarknet(address)
  const pairContract = usePairContract(validatedAddress ? validatedAddress : undefined)
  // get token addresses from pair contract
  const token0AddressCallState = useSingleCallResult(pairContract, 'token0', undefined, NEVER_RELOAD)
  const token0Address = token0AddressCallState?.result?.[0]
  const token1Address = useSingleCallResult(pairContract, 'token1', undefined, NEVER_RELOAD)?.result?.[0]
  // get tokens
  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  // get tokens
  const currency0 = useCurrency(token0Address)
  const currency1 = useCurrency(token1Address)

  const [pairState, pair] = useV2Pair(currency0, currency1)

  // // get data required for V2 pair migration
  const pairBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const results = useMultipleContractSingleData(
    [validatedAddress ? validatedAddress : undefined],
    JediswapPairABI,
    'get_reserves'
  )

  const reserves = useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves } = result
      if (!reserves) return [undefined, undefined]
      const { reserve0, reserve1 } = reserves
      return [reserve0, reserve1]
    })
  }, [results])

  const { reserve0, reserve1 } = useMemo(() => {
    return { reserve0: reserves[0][0], reserve1: reserves[0][1] }
  }, [reserves])

  // redirect for invalid url params
  if (
    !validatedAddress ||
    !pair ||
    !pairBalance ||
    !pairContract ||
    (pairContract &&
      token0AddressCallState?.valid &&
      !token0AddressCallState?.loading &&
      !token0AddressCallState?.error &&
      !token0Address) ||
    !reserve0 ||
    !reserve1
  ) {
    console.error('Invalid pair address')
    return <></>
  }

  return (
    <BodyWrapper style={{ padding: 24, maxWidth: 600 }}>
      <AutoColumn gap="16px">
        <AutoRow style={{ alignItems: 'center', justifyContent: 'space-between' }} gap="8px">
          <BackArrowLink to="/migrate/" />
          <ThemedText.DeprecatedMediumHeader>
            <Trans>Migrate V1 liquidity</Trans>
          </ThemedText.DeprecatedMediumHeader>
          <SettingsTab autoSlippage={DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE} chainId={chainId} hideRoutingSettings />
        </AutoRow>

        {!account ? (
          <ThemedText.DeprecatedLargeHeader>
            <Trans>You must connect an account.</Trans>
          </ThemedText.DeprecatedLargeHeader>
        ) : totalSupply && reserve0 && reserve1 && token0 && token1 ? (
          <V2PairMigration
            pair={pair}
            pairContract={pairContract}
            pairBalance={pairBalance}
            totalSupply={totalSupply}
            reserve0={reserve0}
            reserve1={reserve1}
            token0={token0}
            token1={token1}
          />
        ) : (
          <EmptyState message={<Trans>Loading</Trans>} />
        )}
      </AutoColumn>
    </BodyWrapper>
  )
}
