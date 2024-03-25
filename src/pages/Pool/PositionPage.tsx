// @ts-nocheck
import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { InterfacePageName, LiquidityEventName, LiquiditySource } from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Fraction, Percent, Price, Token } from '@vnaysn/jediswap-sdk-core'
import { NonfungiblePositionManager, Pool, Position } from '@vnaysn/jediswap-sdk-v3'
import { useAccountDetails } from 'hooks/starknet-react'
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { sendAnalyticsEvent, Trace } from 'analytics'
import Badge from 'components/Badge'
import { ButtonConfirmed, ButtonGray, ButtonPrimary, SmallButtonPrimary } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { LoadingFullscreen } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { Dots } from 'components/swap/styled'
import Toggle from 'components/Toggle'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { CHAIN_IDS_TO_NAMES, isSupportedChain } from 'constants/chains'
import { isGqlSupportedChain } from 'graphql/data/util'
import { useToken } from 'hooks/Tokens'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { PoolState, usePool, usePoolAddress } from 'hooks/usePools'
import useStablecoinPrice from 'hooks/useStablecoinPrice'
import { usePositionOwner, useStaticFeeResults, useV3PositionFees } from 'hooks/useV3PositionFees'
import { useV3PositionFromTokenId, useV3PositionsFromTokenId } from 'hooks/useV3Positions'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { Bound } from 'state/mint/v3/actions'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { ExternalLink, HideExtraSmall, HideSmall, StyledRouterLink, ThemedText } from 'theme/components'
import { currencyId } from 'utils/currencyId'
import { WrongChainError } from 'utils/errors'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { unwrappedToken } from 'utils/unwrappedToken'
import RangeBadge from '../../components/Badge/RangeBadge'
import { getPriceOrderingFromPositionForUI } from '../../components/PositionListItem'
import RateToggle from '../../components/RateToggle'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { useV3PositionTokenURI } from '../../hooks/usePositionTokenURI'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { LoadingRows } from './styled'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData, validateAndParseAddress } from 'starknet'
import { DEFAULT_CHAIN_ID, MAX_UINT128, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import TokensList from 'data/tokens-list.json'

const PositionPageButtonPrimary = styled(ButtonPrimary)`
  width: 228px;
  height: 40px;
  font-size: 16px;
  line-height: 20px;
  border-radius: 12px;
`

const PageWrapper = styled.div`
  padding: 68px 16px 16px 16px;

  min-width: 800px;
  max-width: 960px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    min-width: 100%;
    padding: 16px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    min-width: 100%;
    padding: 16px;
  }
`

const BadgeText = styled.div`
  font-weight: 535;
  font-size: 14px;
  color: ${({ theme }) => theme.neutral2};
`

// responsive text
// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <ThemedText.DeprecatedLabel {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 16px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
  text-align: center;
  margin-right: 4px;
  font-weight: 535;
`

const HoverText = styled(ThemedText.DeprecatedMain)`
  text-decoration: none;
  color: ${({ theme }) => theme.neutral2};
  :hover {
    color: ${({ theme }) => theme.neutral1};
    text-decoration: none;
  }
`

const DoubleArrow = styled.span`
  color: ${({ theme }) => theme.neutral3};
  margin: 0 1rem;
`
const ResponsiveRow = styled(RowBetween)`
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;
    width: 100%;
  }
`

const ActionButtonResponsiveRow = styled(ResponsiveRow)`
  width: 50%;
  justify-content: flex-end;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
    flex-direction: row;
    * {
      width: 100%;
    }
  }
`

const ResponsiveButtonConfirmed = styled(ButtonConfirmed)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  font-size: 16px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    width: fit-content;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: fit-content;
  }
`

const NFTGrid = styled.div`
  display: grid;
  grid-template: 'overlap';
  min-height: 400px;
`

const NFTCanvas = styled.canvas`
  grid-area: overlap;
`

const NFTImage = styled.img`
  grid-area: overlap;
  height: 400px;
  /* Ensures SVG appears on top of canvas. */
  z-index: 1;
`

import { useQuery } from 'react-query'
import { jediSwapClient } from 'apollo/client'
import { TOKENS_DATA } from 'apollo/queries'

function CurrentPriceCard({
  inverted,
  pool,
  currencyQuote,
  currencyBase,
}: {
  inverted?: boolean
  pool?: Pool | null
  currencyQuote?: Currency
  currencyBase?: Currency
}) {
  const { formatPrice } = useFormatter()

  if (!pool || !currencyQuote || !currencyBase) {
    return null
  }

  return (
    <LightCard padding="12px">
      <AutoColumn gap="sm" justify="center">
        <ExtentsText>
          <Trans>Current price</Trans>
        </ExtentsText>
        <ThemedText.DeprecatedMediumHeader textAlign="center">
          {formatPrice({ price: inverted ? pool.token1Price : pool.token0Price, type: NumberType.TokenTx })}
        </ThemedText.DeprecatedMediumHeader>
        <ExtentsText>
          <Trans>
            {currencyQuote?.symbol} per {currencyBase?.symbol}
          </Trans>
        </ExtentsText>
      </AutoColumn>
    </LightCard>
  )
}

const TokenLink = ({
  children,
  chainId,
  address,
}: PropsWithChildren<{ chainId: keyof typeof CHAIN_IDS_TO_NAMES; address: string }>) => {
  const chainName = CHAIN_IDS_TO_NAMES[chainId]
  return <StyledRouterLink to={`/tokens/${chainName}/${address}`}>{children}</StyledRouterLink>
}

const ExternalTokenLink = ({ children, chainId, address }: PropsWithChildren<{ chainId: string; address: string }>) => (
  <ExternalLink href={getExplorerLink(chainId, address, ExplorerDataType.TOKEN)}>{children}</ExternalLink>
)

function LinkedCurrency({ chainId, currency }: { chainId?: string; currency?: Currency }) {
  const address = (currency as Token)?.address

  if (typeof chainId === 'number' && address) {
    const Link = isGqlSupportedChain(chainId) ? TokenLink : ExternalTokenLink
    return (
      <Link chainId={chainId} address={address}>
        <RowFixed>
          <CurrencyLogo currency={currency} size="20px" style={{ marginRight: '0.5rem' }} />
          <ThemedText.DeprecatedMain>{currency?.symbol} ↗</ThemedText.DeprecatedMain>
        </RowFixed>
      </Link>
    )
  }

  return (
    <RowFixed>
      <CurrencyLogo currency={currency} size="20px" style={{ marginRight: '0.5rem' }} />
      <ThemedText.DeprecatedMain>{currency?.symbol}</ThemedText.DeprecatedMain>
    </RowFixed>
  )
}

function getRatio(
  lower: Price<Currency, Currency>,
  current: Price<Currency, Currency>,
  upper: Price<Currency, Currency>
) {
  try {
    if (!current.greaterThan(lower)) {
      return 100
    }
    if (!current.lessThan(upper)) {
      return 0
    }

    const a = Number.parseFloat(lower.toSignificant(15))
    const b = Number.parseFloat(upper.toSignificant(15))
    const c = Number.parseFloat(current.toSignificant(15))

    const ratio = Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100)

    if (ratio < 0 || ratio > 100) {
      throw Error('Out of range')
    }

    return ratio
  } catch {
    return undefined
  }
}

// snapshots a src img into a canvas
function getSnapshot(src: HTMLImageElement, canvas: HTMLCanvasElement, targetHeight: number) {
  const context = canvas.getContext('2d')

  if (context) {
    let { width, height } = src

    // src may be hidden and not have the target dimensions
    const ratio = width / height
    height = targetHeight
    width = Math.round(ratio * targetHeight)

    // Ensure crispness at high DPIs
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.scale(devicePixelRatio, devicePixelRatio)

    context.clearRect(0, 0, width, height)
    context.drawImage(src, 0, 0, width, height)
  }
}

function NFT({ image, height: targetHeight }: { image: string; height: number }) {
  const [animate, setAnimate] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  return (
    <NFTGrid
      onMouseEnter={() => {
        setAnimate(true)
      }}
      onMouseLeave={() => {
        // snapshot the current frame so the transition to the canvas is smooth
        if (imageRef.current && canvasRef.current) {
          getSnapshot(imageRef.current, canvasRef.current, targetHeight)
        }
        setAnimate(false)
      }}
    >
      <NFTCanvas ref={canvasRef} />
      <NFTImage
        ref={imageRef}
        src={image}
        hidden={!animate}
        onLoad={() => {
          // snapshot for the canvas
          if (imageRef.current && canvasRef.current) {
            getSnapshot(imageRef.current, canvasRef.current, targetHeight)
          }
        }}
      />
    </NFTGrid>
  )
}

const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
  invert?: boolean
}): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} => ({
  priceUpper: invert ? priceLower?.invert() : priceUpper,
  priceLower: invert ? priceUpper?.invert() : priceLower,
  quote: invert ? base : quote,
  base: invert ? quote : base,
})

export function PositionPageUnsupportedContent() {
  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <ThemedText.HeadlineLarge style={{ marginBottom: '8px' }}>
          <Trans>Position unavailable</Trans>
        </ThemedText.HeadlineLarge>
        <ThemedText.BodyPrimary style={{ marginBottom: '32px' }}>
          <Trans>To view a position, you must be connected to the network it belongs to.</Trans>
        </ThemedText.BodyPrimary>
        <PositionPageButtonPrimary as={Link} to="/pools" width="fit-content">
          <Trans>Back to Pools</Trans>
        </PositionPageButtonPrimary>
      </div>
    </PageWrapper>
  )
}

export default function PositionPage() {
  if (true) {
    return <PositionPageContent />
  }
}

const PositionLabelRow = styled(RowFixed)({
  flexWrap: 'wrap',
  gap: 8,
})

function CollectFees(props) {
  const {
    poolAddress,
    owner,
    position,
    inverted,
    showConfirm,
    setShowConfirm,
    collecting,
    collect,
    ownsNFT,
    txHash,
    isCollectPending,
    showCollectAsWeth,
    parsedTokenId,
  } = props
  const [feeValue0, feeValue1] = useStaticFeeResults(poolAddress, owner, position, showCollectAsWeth, parsedTokenId)

  const theme = useTheme()

  const feeValueUpper = inverted ? feeValue0 : feeValue1
  const feeValueLower = inverted ? feeValue1 : feeValue0

  function modalHeader() {
    return (
      <AutoColumn gap="md" style={{ marginTop: '20px' }}>
        <LightCard padding="12px 16px">
          <AutoColumn gap="md">
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={feeValueUpper?.currency} size="20px" style={{ marginRight: '0.5rem' }} />
                <ThemedText.DeprecatedMain>
                  {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4) : '-'}
                </ThemedText.DeprecatedMain>
              </RowFixed>
              <ThemedText.DeprecatedMain>{feeValueUpper?.currency?.symbol}</ThemedText.DeprecatedMain>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={feeValueLower?.currency} size="20px" style={{ marginRight: '0.5rem' }} />
                <ThemedText.DeprecatedMain>
                  {feeValueLower ? formatCurrencyAmount(feeValueLower, 4) : '-'}
                </ThemedText.DeprecatedMain>
              </RowFixed>
              <ThemedText.DeprecatedMain>{feeValueLower?.currency?.symbol}</ThemedText.DeprecatedMain>
            </RowBetween>
          </AutoColumn>
        </LightCard>
        <ThemedText.DeprecatedItalic>
          <Trans>Collecting fees will withdraw currently available fees for you.</Trans>
        </ThemedText.DeprecatedItalic>
        <ButtonPrimary data-testid="modal-collect-fees-button" onClick={collect}>
          <Trans>Collect</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={collecting}
        hash={txHash}
        reviewContent={() => (
          <ConfirmationModalContent
            title={<Trans>Claim fees</Trans>}
            onDismiss={() => setShowConfirm(false)}
            topContent={modalHeader}
          />
        )}
        pendingText={<Trans>Collecting fees</Trans>}
      />
      <DarkCard>
        <AutoColumn gap="md" style={{ width: '100%' }}>
          <AutoColumn gap="md">
            <RowBetween style={{ alignItems: 'flex-start' }}>
              <AutoColumn gap="md">
                <Label>
                  <Trans>Unclaimed fees</Trans>
                </Label>
                {/*   {fiatValueOfFees?.greaterThan(new Fraction(1, 100)) ? (
                  <ThemedText.DeprecatedLargeHeader color={theme.success} fontSize="36px" fontWeight={535}>
                    <Trans>${fiatValueOfFees.toFixed(2, { groupSeparator: ',' })}</Trans>
                  </ThemedText.DeprecatedLargeHeader>
                ) : (
                  <ThemedText.DeprecatedLargeHeader color={theme.neutral1} fontSize="36px" fontWeight={535}>
                    <Trans>$-</Trans>
                  </ThemedText.DeprecatedLargeHeader>
                )} */}
              </AutoColumn>
              {ownsNFT && (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) || !!txHash) ? (
                <ResponsiveButtonConfirmed
                  data-testid="collect-fees-button"
                  disabled={collecting || !!txHash}
                  confirmed={!!txHash && !isCollectPending}
                  width="fit-content"
                  style={{ borderRadius: '12px' }}
                  padding="4px 8px"
                  onClick={() => setShowConfirm(true)}
                >
                  {!!txHash && !isCollectPending ? (
                    <ThemedText.DeprecatedMain color={theme.neutral1}>
                      <Trans> Collected</Trans>
                    </ThemedText.DeprecatedMain>
                  ) : isCollectPending || collecting ? (
                    <ThemedText.DeprecatedMain color={theme.neutral1}>
                      {' '}
                      <Dots>
                        <Trans>Collecting</Trans>
                      </Dots>
                    </ThemedText.DeprecatedMain>
                  ) : (
                    <ThemedText.DeprecatedMain color={theme.white}>
                      <Trans>Collect fees</Trans>
                    </ThemedText.DeprecatedMain>
                  )}
                </ResponsiveButtonConfirmed>
              ) : null}
            </RowBetween>
          </AutoColumn>
          <LightCard padding="12px 16px">
            <AutoColumn gap="md">
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={feeValueUpper?.currency} size="20px" style={{ marginRight: '0.5rem' }} />
                  <ThemedText.DeprecatedMain>{feeValueUpper?.currency?.symbol}</ThemedText.DeprecatedMain>
                </RowFixed>
                <RowFixed>
                  <ThemedText.DeprecatedMain>
                    {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4) : '-'}
                  </ThemedText.DeprecatedMain>
                </RowFixed>
              </RowBetween>
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={feeValueLower?.currency} size="20px" style={{ marginRight: '0.5rem' }} />
                  <ThemedText.DeprecatedMain>{feeValueLower?.currency?.symbol}</ThemedText.DeprecatedMain>
                </RowFixed>
                <RowFixed>
                  <ThemedText.DeprecatedMain>
                    {feeValueLower ? formatCurrencyAmount(feeValueLower, 4) : '-'}
                  </ThemedText.DeprecatedMain>
                </RowFixed>
              </RowBetween>
            </AutoColumn>
          </LightCard>
          {showCollectAsWeth && (
            <AutoColumn gap="md">
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
            </AutoColumn>
          )}
        </AutoColumn>
      </DarkCard>
    </>
  )
}

function PositionPageContent() {
  const { tokenId: tokenIdFromUrl } = useParams<{ tokenId?: string }>()
  const { chainId, account, address, provider } = useAccountDetails()

  const theme = useTheme()
  const { formatTickPrice } = useFormatter()

  const parsedTokenId = parseInt(tokenIdFromUrl)

  const { loading, positions: positionDetails } = useV3PositionsFromTokenId([parsedTokenId], address)

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tick_lower: tickLower,
    tick_upper: tickUpper,
    tokenId,
  } = positionDetails?.[0] || {}

  const removed = liquidity?.eq(0)

  const metadata = useV3PositionTokenURI(parsedTokenId)

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false)
  const nativeCurrency = useNativeCurrency(chainId)
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, feeAmount)
  const position = useMemo(() => {
    if (pool && liquidity && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  const { ownerOf, isLoading, error } = usePositionOwner(parsedTokenId)

  const poolAddress = usePoolAddress(token0 ?? undefined, token1 ?? undefined, feeAmount)

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  const pricesFromPosition = getPriceOrderingFromPositionForUI(position)
  const [manuallyInverted, setManuallyInverted] = useState(false)

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })

  const inverted = token1 ? base?.equals(token1) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0

  const ratio = useMemo(
    () =>
      priceLower && pool && priceUpper
        ? getRatio(
            inverted ? priceUpper.invert() : priceLower,
            pool.token0Price,
            inverted ? priceLower.invert() : priceUpper
          )
        : undefined,
    [inverted, pool, priceLower, priceUpper]
  )

  // fees
  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, positionDetails?.tokenId, receiveWETH)

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool ? (receiveWETH ? pool.token0 : unwrappedToken(pool.token0)) : undefined
  const currency1ForFeeCollectionPurposes = pool ? (receiveWETH ? pool.token1 : unwrappedToken(pool.token1)) : undefined

  const [collecting, setCollecting] = useState<boolean>(false)
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string>('')
  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)
  const [showConfirm, setShowConfirm] = useState(false)
  const [callData, setCallData] = useState<Call[]>([])
  const { writeAsync, data: txData } = useContractWrite({
    calls: callData,
  })

  // usdc prices always in terms of tokens
  const price0 = useStablecoinPrice(token0 ?? undefined)
  const price1 = useStablecoinPrice(token1 ?? undefined)

  const fiatValueOfFees: CurrencyAmount<Currency> | null = useMemo(() => {
    if (!price0 || !price1 || !feeValue0 || !feeValue1) {
      return null
    }

    // we wrap because it doesn't matter, the quote returns a USDC amount
    const feeValue0Wrapped = feeValue0?.wrapped
    const feeValue1Wrapped = feeValue1?.wrapped

    if (!feeValue0Wrapped || !feeValue1Wrapped) {
      return null
    }

    const amount0 = price0.quote(feeValue0Wrapped)
    const amount1 = price1.quote(feeValue1Wrapped)
    return amount0.add(amount1)
  }, [price0, price1, feeValue0, feeValue1])

  const separatedFiatValueofLiquidity = useQuery({
    queryKey: [`fiat_value_0/${position?.amount0.toSignificant()}/${position?.amount0.currency.symbol}`],
    queryFn: async () => {
      const ids = []
      if (!position?.amount0 && !position?.amount1) return
      if (position?.amount0) ids.push(position?.amount0.currency.address)
      if (position?.amount1) ids.push(position?.amount1.currency.address)
      let result = await jediSwapClient.query({
        query: TOKENS_DATA({ tokenIds: ids }),
        fetchPolicy: 'cache-first',
      })

      try {
        if (result.data) {
          const tokensData = result.data.tokensData
          if (tokensData) {
            const [price0, price1] = [tokensData[0], tokensData[1]]
            return { token0usdPrice: price1?.period?.one_day?.close, token1usdPrice: price0?.period?.one_day?.close }
          }
        }
      } catch (e) {
        console.log(e)
        return { token0usdPrice: null, token1usdPrice: null }
      }
    },
  })

  const { token0usdPrice, token1usdPrice } = useMemo(() => {
    if (!separatedFiatValueofLiquidity.data) return { token0usdPrice: undefined, token1usdPrice: undefined }
    return {
      token0usdPrice: separatedFiatValueofLiquidity.data.token0usdPrice
        ? separatedFiatValueofLiquidity.data.token0usdPrice * position?.amount0.toSignificant()
        : undefined,
      token1usdPrice: separatedFiatValueofLiquidity.data.token1usdPrice
        ? separatedFiatValueofLiquidity.data.token1usdPrice * position?.amount1.toSignificant()
        : undefined,
    }
  }, [separatedFiatValueofLiquidity])

  const fiatValueofLiquidity = useMemo(() => {
    if (token0usdPrice && token1usdPrice) (Number(token0usdPrice) + Number(token1usdPrice)).toFixed(4)
    return undefined
  }, [token0usdPrice, token1usdPrice])

  useEffect(() => {
    if (callData) {
      writeAsync()
        .then((response) => {
          setCollecting(false)
          if (response?.transaction_hash) {
            setTxHash(response.transaction_hash)
          }
        })
        .catch((err) => {
          console.log(err?.message)
          setCollecting(false)
        })
    }
  }, [callData])

  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const collect = useCallback(async () => {
    if (!chainId || !account || !tokenId) {
      return
    }

    setCollecting(true)

    const collectFeeParams = {
      tokenId: cairo.uint256(tokenId),
      recipient: address,
      amount0_max: MAX_UINT128,
      amount1_max: MAX_UINT128,
    }

    const compiledParams = CallData.compile(collectFeeParams)

    const callData = {
      contractAddress: NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID],
      entrypoint: 'collect',
      calldata: compiledParams,
    }

    setCallData([callData])
  }, [
    chainId,
    feeValue0,
    feeValue1,
    currency0ForFeeCollectionPurposes,
    currency1ForFeeCollectionPurposes,
    positionManager,
    account,
    tokenId,
    addTransaction,
    provider,
  ])

  const ownsNFT = useMemo(() => {
    if (!isLoading && !error && ownerOf && address) {
      return ownerOf === validateAndParseAddress(address)
    }
    return false
  }, [ownerOf, address])

  // check if price is within range
  const below = pool && typeof tickLower === 'number' ? pool.tickCurrent < tickLower : undefined
  const above = pool && typeof tickUpper === 'number' ? pool.tickCurrent >= tickUpper : undefined
  const inRange: boolean = typeof below === 'boolean' && typeof above === 'boolean' ? !below && !above : false

  const showCollectAsWeth = Boolean(
    ownsNFT &&
      (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) &&
      currency0 &&
      currency1 &&
      (currency0.isNative || currency1.isNative) &&
      !collectMigrationHash
  )

  if (!positionDetails && !loading) {
    return <PositionPageUnsupportedContent />
  }

  return loading || poolState === PoolState.LOADING || !feeAmount ? (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  ) : (
    <>
      <PageWrapper>
        <AutoColumn gap="md">
          <AutoColumn gap="sm">
            <Link
              data-cy="visit-pool"
              style={{ textDecoration: 'none', width: 'fit-content', marginBottom: '0.5rem' }}
              to="/pools"
            >
              <HoverText>
                <Trans>← Back to Pools</Trans>
              </HoverText>
            </Link>
            <ResponsiveRow>
              <PositionLabelRow>
                <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={24} margin />
                <ThemedText.DeprecatedLabel fontSize="24px" mr="10px">
                  &nbsp;{currencyQuote?.symbol}&nbsp;/&nbsp;{currencyBase?.symbol}
                </ThemedText.DeprecatedLabel>
                <Badge style={{ marginRight: '8px' }}>
                  <BadgeText>
                    <Trans>{new Percent(feeAmount, 1_000_000).toSignificant()}%</Trans>
                  </BadgeText>
                </Badge>
                <RangeBadge removed={removed} inRange={inRange} />
              </PositionLabelRow>
              {ownsNFT && (
                <ActionButtonResponsiveRow>
                  {currency0 && currency1 && feeAmount && tokenId ? (
                    <ButtonGray
                      as={Link}
                      to={`/increase/${currencyId(currency0)}/${currencyId(currency1)}/${feeAmount}/${tokenId}`}
                      padding="6px 8px"
                      width="fit-content"
                      $borderRadius="12px"
                      style={{ marginRight: '8px' }}
                    >
                      <Trans>Increase liquidity</Trans>
                    </ButtonGray>
                  ) : null}
                  {tokenId && !removed ? (
                    <SmallButtonPrimary
                      as={Link}
                      to={`/remove/${tokenId}`}
                      padding="6px 8px"
                      width="fit-content"
                      $borderRadius="12px"
                    >
                      <Trans>Remove liquidity</Trans>
                    </SmallButtonPrimary>
                  ) : null}
                </ActionButtonResponsiveRow>
              )}
            </ResponsiveRow>
          </AutoColumn>
          <ResponsiveRow align="flex-start">
            <HideSmall
              style={{
                height: '100%',
                marginRight: 12,
              }}
            >
              {'result' in metadata ? (
                <DarkCard
                  width="100%"
                  height="100%"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    minWidth: '340px',
                  }}
                >
                  <NFT image={metadata.result.image} height={400} />
                  {typeof chainId === 'number' && owner && !ownsNFT ? (
                    <ExternalLink href={getExplorerLink(chainId, owner, ExplorerDataType.ADDRESS)}>
                      <Trans>Owner</Trans>
                    </ExternalLink>
                  ) : null}
                </DarkCard>
              ) : (
                <DarkCard
                  width="100%"
                  height="100%"
                  style={{
                    minWidth: '340px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <LoadingFullscreen />
                </DarkCard>
              )}
            </HideSmall>
            <AutoColumn gap="sm" style={{ width: '100%', height: '100%' }}>
              <DarkCard>
                <AutoColumn gap="md" style={{ width: '100%' }}>
                  <AutoColumn gap="md">
                    <Label>
                      <Trans>Liquidity</Trans>
                    </Label>
                    {fiatValueofLiquidity ? (
                      <ThemedText.DeprecatedLargeHeader fontSize="36px" fontWeight={535}>
                        <Trans>${fiatValueofLiquidity}</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                    ) : (
                      <ThemedText.DeprecatedLargeHeader color={theme.neutral1} fontSize="36px" fontWeight={535}>
                        <Trans>$-</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                    )}
                  </AutoColumn>
                  <LightCard padding="12px 16px">
                    <AutoColumn gap="md">
                      <RowBetween>
                        <LinkedCurrency chainId={chainId} currency={currencyQuote} />
                        <RowFixed>
                          <ThemedText.DeprecatedMain>
                            {inverted ? position?.amount0.toSignificant(4) : position?.amount1.toSignificant(4)}
                          </ThemedText.DeprecatedMain>
                          {typeof ratio === 'number' && !removed ? (
                            <Badge style={{ marginLeft: '10px' }}>
                              <BadgeText>
                                <Trans>{inverted ? ratio : 100 - ratio}%</Trans>
                              </BadgeText>
                            </Badge>
                          ) : null}
                        </RowFixed>
                      </RowBetween>
                      <RowBetween>
                        <LinkedCurrency chainId={chainId} currency={currencyBase} />
                        <RowFixed>
                          <ThemedText.DeprecatedMain>
                            {inverted ? position?.amount1.toSignificant(4) : position?.amount0.toSignificant(4)}
                          </ThemedText.DeprecatedMain>
                          {typeof ratio === 'number' && !removed ? (
                            <Badge style={{ marginLeft: '10px' }}>
                              <BadgeText>
                                <Trans>{inverted ? 100 - ratio : ratio}%</Trans>
                              </BadgeText>
                            </Badge>
                          ) : null}
                        </RowFixed>
                      </RowBetween>
                    </AutoColumn>
                  </LightCard>
                </AutoColumn>
              </DarkCard>
              {poolAddress && ownerOf && position && address ? (
                <CollectFees
                  poolAddress={poolAddress}
                  owner={address}
                  position={position}
                  inverted={inverted}
                  showConfirm={showConfirm}
                  setShowConfirm={setShowConfirm}
                  collecting={collecting}
                  collect={collect}
                  ownsNFT={ownsNFT}
                  txHash={txHash}
                  isCollectPending={isCollectPending}
                  showCollectAsWeth={showCollectAsWeth}
                  parsedTokenId={parsedTokenId}
                />
              ) : null}
            </AutoColumn>
          </ResponsiveRow>

          <DarkCard>
            <AutoColumn gap="md">
              <RowBetween>
                <RowFixed>
                  <Label display="flex" style={{ marginRight: '12px' }}>
                    <Trans>Price range</Trans>
                  </Label>
                  <HideExtraSmall>
                    <>
                      <RangeBadge removed={removed} inRange={inRange} />
                      <span style={{ width: '8px' }} />
                    </>
                  </HideExtraSmall>
                </RowFixed>
                <RowFixed>
                  {currencyBase && currencyQuote && (
                    <RateToggle
                      currencyA={currencyBase}
                      currencyB={currencyQuote}
                      handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
                    />
                  )}
                </RowFixed>
              </RowBetween>

              <RowBetween>
                <LightCard padding="12px" width="100%">
                  <AutoColumn gap="sm" justify="center">
                    <ExtentsText>
                      <Trans>Min price</Trans>
                    </ExtentsText>
                    <ThemedText.DeprecatedMediumHeader textAlign="center">
                      {formatTickPrice({
                        price: priceLower,
                        atLimit: tickAtLimit,
                        direction: Bound.LOWER,
                        numberType: NumberType.TokenTx,
                      })}
                    </ThemedText.DeprecatedMediumHeader>
                    <ExtentsText>
                      {' '}
                      <Trans>
                        {currencyQuote?.symbol} per {currencyBase?.symbol}
                      </Trans>
                    </ExtentsText>

                    {inRange && (
                      <ThemedText.DeprecatedSmall color={theme.neutral3}>
                        <Trans>Your position will be 100% {currencyBase?.symbol} at this price.</Trans>
                      </ThemedText.DeprecatedSmall>
                    )}
                  </AutoColumn>
                </LightCard>

                <DoubleArrow>⟷</DoubleArrow>
                <LightCard padding="12px" width="100%">
                  <AutoColumn gap="sm" justify="center">
                    <ExtentsText>
                      <Trans>Max price</Trans>
                    </ExtentsText>
                    <ThemedText.DeprecatedMediumHeader textAlign="center">
                      {formatTickPrice({
                        price: priceUpper,
                        atLimit: tickAtLimit,
                        direction: Bound.UPPER,
                        numberType: NumberType.TokenTx,
                      })}
                    </ThemedText.DeprecatedMediumHeader>
                    <ExtentsText>
                      {' '}
                      <Trans>
                        {currencyQuote?.symbol} per {currencyBase?.symbol}
                      </Trans>
                    </ExtentsText>

                    {inRange && (
                      <ThemedText.DeprecatedSmall color={theme.neutral3}>
                        <Trans>Your position will be 100% {currencyQuote?.symbol} at this price.</Trans>
                      </ThemedText.DeprecatedSmall>
                    )}
                  </AutoColumn>
                </LightCard>
              </RowBetween>
              <CurrentPriceCard
                inverted={inverted}
                pool={pool}
                currencyQuote={currencyQuote}
                currencyBase={currencyBase}
              />
            </AutoColumn>
          </DarkCard>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
