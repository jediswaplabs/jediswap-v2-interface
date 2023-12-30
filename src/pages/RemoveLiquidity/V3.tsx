import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { LiquidityEventName, LiquiditySource } from '@uniswap/analytics-events'
import { CurrencyAmount, Percent } from '@vnaysn/jediswap-sdk-core'
import { NonfungiblePositionManager, Position } from '@vnaysn/jediswap-sdk-v3'
import { useAccountDetails } from 'hooks/starknet-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'

import { sendAnalyticsEvent, useTrace } from 'analytics'
import RangeBadge from 'components/Badge/RangeBadge'
import { ButtonConfirmed, ButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Break } from 'components/earn/styled'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount'
import Loader from 'components/Icons/LoadingSpinner'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import Slider from 'components/Slider'
import Toggle from 'components/Toggle'
import { isSupportedChain } from 'constants/chains'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useV3PosFromTokenId, useV3PositionsFromTokenId } from 'hooks/useV3Positions'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { PositionPageUnsupportedContent } from 'pages/Pool/PositionPage'
import { useBurnV3ActionHandlers, useBurnV3State, useDerivedV3BurnInfo } from 'state/burn/v3/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { ThemedText } from 'theme/components'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import AppBody from '../AppBody'
import { ResponsiveHeaderText, SmallMaxButton, Wrapper } from './styled'
import { useContractWrite, useProvider } from '@starknet-react/core'
import { Call, CallData, cairo } from 'starknet'
import { NONFUNGIBLE_POOL_MANAGER_ADDRESS } from '../../constants/tokens'
import JSBI from 'jsbi'

const DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100)
const MAX_UINT128 = BigInt(2) ** BigInt(128) - BigInt(1)
// redirect invalid tokenIds
export default function RemoveLiquidityV3() {
  const { chainId, address } = useAccountDetails()
  const { tokenId } = useParams<{ tokenId: string }>()
  const location = useLocation()
  const parsedTokenId = useMemo(() => {
    try {
      return Number(tokenId)
    } catch {
      return null
    }
  }, [tokenId])

  const { positions, loading } = useV3PositionsFromTokenId([Number(tokenId ? tokenId : undefined)], address)
  const existingPositionDetails = positions && positions?.[0]
  if (parsedTokenId === null || parsedTokenId === 0) {
    return <Navigate to={{ ...location, pathname: '/pools' }} replace />
  }
  if (isSupportedChain(chainId) && (loading || existingPositionDetails)) {
    return <Remove tokenId={parsedTokenId} />
  }
  return <PositionPageUnsupportedContent />
}
function Remove({ tokenId }: { tokenId: number }) {
  const { position } = useV3PosFromTokenId(tokenId)
  const theme = useTheme()
  const { address: account, chainId } = useAccountDetails()
  const { provider } = useProvider()
  const trace = useTrace()

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false)
  const nativeCurrency = useNativeCurrency(chainId)
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  // burn state
  const { percent } = useBurnV3State()
  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  } = useDerivedV3BurnInfo(position, receiveWETH)

  const { onPercentSelect } = useBurnV3ActionHandlers()
  const removed = position?.liquidity?.eq(0)

  // boilerplate for the slider
  const [percentForSlider, onPercentSelectForSlider] = useDebouncedChangeHandler(percent, onPercentSelect)

  const deadline = '1705014714' // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE) // custom from users

  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txnHash, setTxnHash] = useState<string | undefined>()
  const [mintCallData, setMintCallData] = useState<Call[]>([])
  const { writeAsync, data: txData } = useContractWrite({
    calls: mintCallData,
  })

  useEffect(() => {
    if (mintCallData) {
      writeAsync()
        .then((response) => {
          setAttemptingTxn(false)
          if (response?.transaction_hash) {
            setTxnHash(response.transaction_hash)
          }
        })
        .catch((err) => {
          console.log(err?.message)
          setAttemptingTxn(false)
        })
    }
  }, [mintCallData])

  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const burn = useCallback(async () => {
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage
    ) {
      return
    }

    // construct a partial position with a percentage of liquidity
    const partialPosition = new Position({
      pool: positionSDK.pool,
      liquidity: liquidityPercentage.multiply(positionSDK.liquidity).quotient,
      tickLower: positionSDK.tickLower,
      tickUpper: positionSDK.tickUpper,
    })

    const { amount0: amount0Min, amount1: amount1Min } = partialPosition.burnAmountsWithSlippage(allowedSlippage)

    const decreaseLiquidityParams = {
      tokenId: cairo.uint256(tokenId),
      liquidity: BigInt(partialPosition.liquidity.toString()),
      amount0_min: cairo.uint256(amount0Min.toString()),
      amount1_min: cairo.uint256(amount1Min.toString()),
      deadline: cairo.felt(deadline.toString()),
    }
    const decreaseLiquidityCallData = CallData.compile(decreaseLiquidityParams)
    const burnPositionParams = {
      tokenId: cairo.uint256(tokenId),
    }
    const collectFeeParams = {
      tokenId: cairo.uint256(tokenId),
      recipient: account,
      amount0_max: MAX_UINT128,
      amount1_max: MAX_UINT128,
    }
    const burnCallData = CallData.compile(burnPositionParams)
    const collectFeeCallData = CallData.compile(collectFeeParams)

    const createCallObject = (entrypoint: string, calldata: any) => ({
      contractAddress: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
      entrypoint,
      calldata,
    })

    const decreaseLiquidityCall = createCallObject('decrease_liquidity', decreaseLiquidityCallData)
    const burnCall = createCallObject('burn', burnCallData)
    const collectFeeCall = createCallObject('collect', collectFeeCallData)

    // slippage-adjusted underlying amounts
    const toBurnPosition: boolean = liquidityPercentage.equalTo(JSBI.BigInt(1))
    const finalCallData = [decreaseLiquidityCall, ...(toBurnPosition ? [collectFeeCall] : [])]
    setMintCallData(finalCallData)
  }, [
    positionManager,
    liquidityValue0,
    liquidityValue1,
    deadline,
    account,
    chainId,
    positionSDK,
    liquidityPercentage,
    provider,
    tokenId,
    allowedSlippage,
    feeValue0,
    feeValue1,
    trace,
    addTransaction,
  ])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      onPercentSelectForSlider(0)
    }
    setAttemptingTxn(false)
    setTxnHash('')
  }, [onPercentSelectForSlider, txnHash])

  const pendingText = (
    <Trans>
      Removing {liquidityValue0?.toSignificant(6)} {liquidityValue0?.currency?.symbol} and{' '}
      {liquidityValue1?.toSignificant(6)} {liquidityValue1?.currency?.symbol}
    </Trans>
  )

  function modalHeader() {
    return (
      <AutoColumn gap="sm" style={{ padding: '16px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={535}>
            <Trans>Pooled {liquidityValue0?.currency?.symbol}:</Trans>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={535} marginLeft="6px">
              {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue0?.currency} />
          </RowFixed>
        </RowBetween>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={535}>
            <Trans>Pooled {liquidityValue1?.currency?.symbol}:</Trans>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={535} marginLeft="6px">
              {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue1?.currency} />
          </RowFixed>
        </RowBetween>
        {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
          <>
            <ThemedText.DeprecatedItalic fontSize={12} color={theme.neutral2} textAlign="left" padding="8px 0 0 0">
              <Trans>You will also collect fees earned from this position.</Trans>
            </ThemedText.DeprecatedItalic>
            <RowBetween>
              <Text fontSize={16} fontWeight={535}>
                <Trans>{feeValue0?.currency?.symbol} Fees Earned:</Trans>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={535} marginLeft="6px">
                  {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue0?.currency} />
              </RowFixed>
            </RowBetween>
            <RowBetween>
              <Text fontSize={16} fontWeight={535}>
                <Trans>{feeValue1?.currency?.symbol} Fees Earned:</Trans>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={535} marginLeft="6px">
                  {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue1?.currency} />
              </RowFixed>
            </RowBetween>
          </>
        ) : null}
        <ButtonPrimary mt="16px" onClick={burn}>
          <Trans>Remove</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }

  const showCollectAsWeth = false
  return (
    <AutoColumn>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txnHash ?? ''}
        reviewContent={() => (
          <ConfirmationModalContent
            title={<Trans>Remove liquidity</Trans>}
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
          />
        )}
        pendingText={pendingText}
      />
      <AppBody $maxWidth="unset">
        <AddRemoveTabs
          creating={false}
          adding={false}
          positionID={tokenId.toString()}
          autoSlippage={DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE}
        />
        <Wrapper>
          {position ? (
            <AutoColumn gap="lg">
              <RowBetween>
                <RowFixed>
                  <DoubleCurrencyLogo
                    currency0={liquidityValue0?.currency}
                    currency1={liquidityValue1?.currency}
                    size={20}
                    margin
                  />
                  <ThemedText.DeprecatedLabel ml="10px" fontSize="20px" id="remove-liquidity-tokens">
                    {`${liquidityValue0?.currency?.symbol}/${liquidityValue1?.currency?.symbol}`}
                  </ThemedText.DeprecatedLabel>
                </RowFixed>
                <RangeBadge removed={removed} inRange={!outOfRange} />
              </RowBetween>
              <LightCard>
                <AutoColumn gap="md">
                  <ThemedText.DeprecatedMain fontWeight={485}>
                    <Trans>Amount</Trans>
                  </ThemedText.DeprecatedMain>
                  <RowBetween>
                    <ResponsiveHeaderText>
                      <Trans>{percentForSlider}%</Trans>
                    </ResponsiveHeaderText>
                    <AutoRow gap="4px" justify="flex-end">
                      <SmallMaxButton onClick={() => onPercentSelect(25)} width="20%">
                        <Trans>25%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(50)} width="20%">
                        <Trans>50%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(75)} width="20%">
                        <Trans>75%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(100)} width="20%">
                        <Trans>Max</Trans>
                      </SmallMaxButton>
                    </AutoRow>
                  </RowBetween>
                  <Slider value={percentForSlider} onChange={onPercentSelectForSlider} />
                </AutoColumn>
              </LightCard>
              <LightCard>
                <AutoColumn gap="md">
                  <RowBetween>
                    <Text fontSize={16} fontWeight={535} id="remove-pooled-tokena-symbol">
                      <Trans>Pooled {liquidityValue0?.currency?.symbol}:</Trans>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={535} marginLeft="6px">
                        {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
                      </Text>
                      <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue0?.currency} />
                    </RowFixed>
                  </RowBetween>
                  <RowBetween>
                    <Text fontSize={16} fontWeight={535} id="remove-pooled-tokenb-symbol">
                      <Trans>Pooled {liquidityValue1?.currency?.symbol}:</Trans>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={535} marginLeft="6px">
                        {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
                      </Text>
                      <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={liquidityValue1?.currency} />
                    </RowFixed>
                  </RowBetween>
                  {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
                    <>
                      <Break />
                      <RowBetween>
                        <Text fontSize={16} fontWeight={535}>
                          <Trans>{feeValue0?.currency?.symbol} Fees Earned:</Trans>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={535} marginLeft="6px">
                            {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue0?.currency} />
                        </RowFixed>
                      </RowBetween>
                      <RowBetween>
                        <Text fontSize={16} fontWeight={535}>
                          <Trans>{feeValue1?.currency?.symbol} Fees Earned:</Trans>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={535} marginLeft="6px">
                            {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={feeValue1?.currency} />
                        </RowFixed>
                      </RowBetween>
                    </>
                  ) : null}
                </AutoColumn>
              </LightCard>

              {showCollectAsWeth && (
                <RowBetween>
                  <ThemedText.DeprecatedMain>
                    <Trans>Collect as {nativeWrappedSymbol}</Trans>
                  </ThemedText.DeprecatedMain>
                  <Toggle
                    id="receive-as-weth"
                    isActive={receiveWETH}
                    toggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
                  />
                </RowBetween>
              )}

              <div style={{ display: 'flex' }}>
                <AutoColumn gap="md" style={{ flex: '1' }}>
                  <ButtonConfirmed
                    confirmed={false}
                    disabled={removed || percent === 0 || !liquidityValue0}
                    onClick={() => setShowConfirm(true)}
                  >
                    {removed ? <Trans>Closed</Trans> : error ?? <Trans>Remove</Trans>}
                  </ButtonConfirmed>
                </AutoColumn>
              </div>
            </AutoColumn>
          ) : (
            <Loader />
          )}
        </Wrapper>
      </AppBody>
    </AutoColumn>
  )
}
