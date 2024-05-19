/* eslint-disable no-nested-ternary */

import { Trans } from '@lingui/macro'
import { ChainId, Currency, CurrencyAmount, Percent, Token } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import JSBI from 'jsbi'
import { ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ArrowDown } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { InterfaceSectionName } from '@uniswap/analytics-events'

import { useToggleAccountDrawer } from 'components/AccountDrawer'
import AddressInputPanel from 'components/AddressInputPanel'
import {
  ButtonEmphasis,
  ButtonError,
  ButtonGray,
  ButtonLight,
  ButtonPrimary,
  ButtonSize,
  ThemeButton,
} from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import SwapCurrencyInputPanel from 'components/CurrencyInputPanel/SwapCurrencyInputPanel'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import PriceImpactModal from 'components/swap/PriceImpactModal'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import { ArrowWrapper, PageWrapper, SwapWrapper } from 'components/swap/styled'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import SwapHeader from 'components/swap/SwapHeader'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { getChainInfo } from 'constants/chainInfo'
import { isSupportedChain } from 'constants/chains'
import { useUniswapXDefaultEnabled } from 'featureFlags/flags/uniswapXDefault'
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useMaxAmountIn } from 'hooks/useMaxAmountIn'
import usePermit2Allowance, { AllowanceState } from 'hooks/usePermit2Allowance'
import usePrevious from 'hooks/usePrevious'
import { SwapResult, useSwapCallback } from 'hooks/useSwapCallback'
import { useSwitchChain } from 'hooks/useSwitchChain'
import { useUSDPrice } from 'hooks/useUSDPrice'
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback'
import { formatSwapQuoteReceivedEventProperties } from 'lib/utils/analytics'
import { useAppSelector } from 'state/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { isClassicTrade, isPreviewTrade } from 'state/routing/utils'
import { Field, forceExactInput, replaceSwapState } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import swapReducer, { initialState as initialSwapState, SwapState } from 'state/swap/reducer'
import { LinkStyledButton, ThemedText } from 'theme/components'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { warningSeverity } from 'utils/prices'
import { didUserReject } from 'utils/swapErrorToUserReadableMessage'
import { useScreenSize } from '../../hooks/useScreenSize'
import { OutputTaxTooltipBody } from './TaxTooltipBody'
import { SWAP_ROUTER_ADDRESS_V2, getSwapCurrencyId, DEFAULT_CHAIN_ID, SWAP_ROUTER_ADDRESS_V1 } from 'constants/tokens'
import fetchAllPools from 'api/fetchAllPools'
import { Call, CallData, cairo, num, validateAndParseAddress } from 'starknet'
import { LoadingRows } from 'components/Loader/styled'
import { useContractWrite } from '@starknet-react/core'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useApprovalCall } from 'hooks/useApproveCall'
import { Pool, TradeType, toHex } from '@vnaysn/jediswap-sdk-v3'
import fetchAllPairs from 'api/fetchAllPairs'
import { useQuery } from 'react-query'
import { getClient } from 'apollo/client'
import { TOKENS_DATA } from 'apollo/queries'
import { findClosestPrice } from 'utils/getClosest'

export const ArrowContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`

const SwapSection = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  border-radius: 8px;
  color: ${({ theme }) => theme.neutral2};
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset;
  font-size: 14px;
  font-weight: 500;
  //height: 120px;
  line-height: 20px;
  padding: 16px;
  position: relative;

  &:before {
    box-sizing: border-box;
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid ${({ theme }) => theme.surface2};
  }
`

const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.surface1}`};
`

const ButtonPrimaryRed = styled(ButtonPrimary)`
  color: #ff3257 !important;
`

function getIsReviewableQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  if (swapInputError) {
    return false
  }
  // if the current quote is a preview quote, allow the user to progress to the Swap review screen
  if (isPreviewTrade(trade)) {
    return true
  }

  return Boolean(trade && tradeState === TradeState.VALID)
}

function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b
  }
  if (a) {
    return a
  }
  if (b) {
    return b
  }
  return undefined
}

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div style={{ height: 450 }} />
    </LoadingRows>
  )
}

export default function SwapPage({ className }: { className?: string }) {
  const { chainId: connectedChainId } = useAccountDetails()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [allPools, setAllPools] = useState<any>([])
  const [allPairs, setAllPairs] = useState<any>([])
  const [loadingPositions, setLoadingPositions] = useState<boolean>(false)

  //fetch Token Ids
  useEffect(() => {
    const getTokenIds = async () => {
      if (connectedChainId) {
        try {
          setLoadingPositions(true)
          const pools = await fetchAllPools(connectedChainId)
          const pairs = await fetchAllPairs(connectedChainId)
          if (pools && pools.data) {
            const allPoolsArray: number[] = pools.data.map((item: any) =>
              validateAndParseAddress(item.contract_address)
            )
            setAllPools(allPoolsArray)
            setLoadingPositions(false)
          }

          if (pairs && pairs.data) {
            const allPairsArray: number[] = pairs.data.map((item: any) =>
              validateAndParseAddress(item.contract_address)
            )
            setAllPairs(allPairsArray)
            setLoadingPositions(false)
          }
        } catch (e) {
          console.error(e)
          setLoadingPositions(false)
        }
      }
    }

    getTokenIds()
  }, [connectedChainId])

  return (
    <PageWrapper>
      {loadingPositions ? (
        <PositionsLoadingPlaceholder />
      ) : (
        <Swap
          className={className}
          chainId={connectedChainId}
          initialInputCurrencyId={loadedUrlParams?.[Field.INPUT]?.currencyId}
          initialOutputCurrencyId={loadedUrlParams?.[Field.OUTPUT]?.currencyId}
          allPools={allPools}
          allPairs={allPairs}
          // disableTokenInputs={supportedChainId === undefined}
        />
      )}
    </PageWrapper>
  )
}

/**
 * The swap component displays the swap interface, manages state for the swap, and triggers onchain swaps.
 *
 * In most cases, chainId should refer to the connected chain, i.e. `useAccountDetails().chainId`.
 * However if this component is being used in a context that displays information from a different, unconnected
 * chain (e.g. the TDP), then chainId should refer to the unconnected chain.
 */
export function Swap({
  className,
  initialInputCurrencyId,
  initialOutputCurrencyId,
  allPools,
  allPairs,
  chainId,
  onCurrencyChange,
  disableTokenInputs = false,
}: {
  className?: string
  initialInputCurrencyId?: string | null
  initialOutputCurrencyId?: string | null
  allPools: [] | string[]
  allPairs: [] | string[]
  chainId?: ChainId
  onCurrencyChange?: (selected: Pick<SwapState, Field.INPUT | Field.OUTPUT>) => void
  disableTokenInputs?: boolean
}) {
  const connectionReady = useConnectionReady()
  const { address, account, chainId: connectedChainId } = useAccountDetails()
  const swapRouterAddressV2 = SWAP_ROUTER_ADDRESS_V2[connectedChainId ?? DEFAULT_CHAIN_ID]
  const swapRouterAddressV1 = SWAP_ROUTER_ADDRESS_V1[connectedChainId ?? DEFAULT_CHAIN_ID]

  // token warning stuff
  const prefilledInputCurrency = useCurrency(initialInputCurrencyId, chainId)
  const prefilledOutputCurrency = useCurrency(initialOutputCurrencyId, chainId)

  const [loadedInputCurrency, setLoadedInputCurrency] = useState(prefilledInputCurrency)
  const [loadedOutputCurrency, setLoadedOutputCurrency] = useState(prefilledOutputCurrency)

  useEffect(() => {
    setLoadedInputCurrency(prefilledInputCurrency)
    setLoadedOutputCurrency(prefilledOutputCurrency)
  }, [prefilledInputCurrency, prefilledOutputCurrency])

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const [showPriceImpactModal, setShowPriceImpactModal] = useState<boolean>(false)

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useDefaultActiveTokens(chainId)
  const importTokensNotInDefault = useMemo(
    () =>
      urlLoadedTokens &&
      urlLoadedTokens
        .filter((token: Token) => !(token.address in defaultTokens))
        .filter((token: Token) => {
          // Any token addresses that are loaded from the shorthands map do not need to show the import URL
          // const supported = asSupportedChain(chainId)
          // if (!supported) {
          //   return true
          // }
          // return !Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
          //   const shorthandTokenAddress = TOKEN_SHORTHANDS[shorthand][supported]
          //   return shorthandTokenAddress && shorthandTokenAddress === token.address
          // })
        }),
    [chainId, defaultTokens, urlLoadedTokens]
  )

  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletDrawer = useToggleAccountDrawer()

  // swap state
  const prefilledState = useMemo(
    () => ({
      [Field.INPUT]: { currencyId: initialInputCurrencyId },
      [Field.OUTPUT]: { currencyId: initialOutputCurrencyId },
    }),
    [initialInputCurrencyId, initialOutputCurrencyId]
  )
  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState })
  const { typedValue, recipient, independentField } = state

  const previousConnectedChainId = usePrevious(connectedChainId)
  const previousPrefilledState = usePrevious(prefilledState)
  useEffect(() => {
    const combinedInitialState = { ...initialSwapState, ...prefilledState }
    const chainChanged = previousConnectedChainId && previousConnectedChainId !== connectedChainId
    const prefilledInputChanged =
      previousPrefilledState &&
      previousPrefilledState?.[Field.INPUT]?.currencyId !== prefilledState?.[Field.INPUT]?.currencyId
    const prefilledOutputChanged =
      previousPrefilledState &&
      previousPrefilledState?.[Field.OUTPUT]?.currencyId !== prefilledState?.[Field.OUTPUT]?.currencyId
    if (chainChanged || prefilledInputChanged || prefilledOutputChanged) {
      dispatch(
        replaceSwapState({
          ...initialSwapState,
          ...prefilledState,
          field: combinedInitialState.independentField ?? Field.INPUT,
          inputCurrencyId: combinedInitialState.INPUT.currencyId ?? undefined,
          outputCurrencyId: combinedInitialState.OUTPUT.currencyId ?? undefined,
        })
      )
      // reset local state
      setSwapState({
        tradeToConfirm: undefined,
        swapError: undefined,
        showConfirm: false,
        swapResult: undefined,
      })
    }
  }, [connectedChainId, prefilledState, previousConnectedChainId, previousPrefilledState])

  const swapInfo = useDerivedSwapInfo(state, chainId, allPools, allPairs)
  const {
    trade: { state: tradeState, trade, swapQuoteLatency },
    allowedSlippage,
    autoSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    inputTax,
    outputTax,
  } = swapInfo

  const [inputTokenHasTax, outputTokenHasTax] = useMemo(
    () => [!inputTax.equalTo(0), !outputTax.equalTo(0)],
    [inputTax, outputTax]
  )

  useEffect(() => {
    // Force exact input if the user switches to an output token with tax
    if (outputTokenHasTax && independentField === Field.OUTPUT) {
      dispatch(forceExactInput())
    }
  }, [independentField, outputTokenHasTax, trade?.outputAmount])

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const getSingleUnitAmount = (currency?: Currency) => {
    if (!currency) {
      return
    }
    return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(10 ** currency.decimals))
  }

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      tradeState === TradeState.NO_ROUTE_FOUND,
      tradeState === TradeState.LOADING,
      tradeState === TradeState.LOADING && Boolean(trade),
    ],
    [trade, tradeState]
  )

  const fiatValueTradeInput = useUSDPrice(trade?.inputAmount)
  const fiatValueTradeOutput = useUSDPrice(trade?.outputAmount)
  const preTaxFiatValueTradeOutput = useUSDPrice(trade?.outputAmount)
  const [stablecoinPriceImpact, preTaxStablecoinPriceImpact] = useMemo(
    () =>
      routeIsSyncing || !isClassicTrade(trade)
        ? [undefined, undefined]
        : [
            computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
            computeFiatValuePriceImpact(fiatValueTradeInput.data, preTaxFiatValueTradeOutput.data),
          ],
    [fiatValueTradeInput, fiatValueTradeOutput, preTaxFiatValueTradeOutput, routeIsSyncing, trade]
  )

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers(dispatch)
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const navigate = useNavigate()
  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    navigate('/swap/')
  }, [navigate])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm?: InterfaceTrade
    swapError?: Error
    swapResult?: SwapResult
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    swapError: undefined,
    swapResult: undefined,
  })

  const { formatCurrencyAmount } = useFormatter()
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : formatCurrencyAmount({
            amount: parsedAmounts[dependentField],
            type: NumberType.SwapTradeAmount,
            placeholder: '',
          }),
    }),
    [dependentField, formatCurrencyAmount, independentField, parsedAmounts, showWrap, typedValue]
  )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const isFetchingOutput = Boolean(
    userHasSpecifiedInputOutput && formattedAmounts[dependentField] === '' && !routeNotFound
  )

  const maximumAmountIn = useMaxAmountIn(trade, allowedSlippage)
  const allowance = usePermit2Allowance(
    maximumAmountIn ??
      (parsedAmounts[Field.INPUT]?.currency.isToken
        ? (parsedAmounts[Field.INPUT] as CurrencyAmount<Token>)
        : undefined),
    undefined,
    trade?.fillType
  )

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const handleContinueToReview = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapError: undefined,
      showConfirm: true,
      swapResult: undefined,
    })
  }, [trade])

  const clearSwapState = useCallback(() => {
    setSwapState((currentState) => ({
      ...currentState,
      swapError: undefined,
      swapResult: undefined,
    }))
  }, [])
  const [swapCallData, setSwapCallData] = useState<Call[]>([])

  const {
    writeAsync,
    data: txData,
    error,
  } = useContractWrite({
    calls: swapCallData,
  })

  const deadline = useTransactionDeadline() // custom from users settings

  useEffect(() => {
    if (swapCallData) {
      writeAsync()
        .then((response) => {
          if (response?.transaction_hash) {
          }
        })
        .catch((err) => {
          console.log(err?.message)
        })
    }
  }, [swapCallData])

  const separatedFiatValueofLiquidity = useQuery({
    queryKey: ['fiat_value', trade?.inputAmount, trade?.outputAmount],
    queryFn: async () => {
      const ids = []
      if (!trade?.inputAmount && !trade?.outputAmount) return
      if (trade?.inputAmount) ids.push((trade?.inputAmount.currency as any).address)
      if (trade?.outputAmount) ids.push((trade?.outputAmount.currency as any).address)
      const graphqlClient = getClient(chainId)
      let result = await graphqlClient.query({
        query: TOKENS_DATA({ tokenIds: ids }),
        // fetchPolicy: 'cache-first',
      })

      try {
        if (result.data) {
          const tokensData = result.data.tokensData
          if (tokensData) {
            const [price0Obj, price1Obj] = [tokensData[0], tokensData[1]]
            const isToken0InputAmount =
              validateAndParseAddress((trade?.inputAmount.currency as any).address) ===
              validateAndParseAddress(price0Obj.token.tokenAddress)
            const price0 = findClosestPrice(price0Obj?.period)
            const price1 = findClosestPrice(price1Obj?.period)

            return {
              token0usdPrice: isToken0InputAmount ? price0 : price1,
              token1usdPrice: isToken0InputAmount ? price1 : price0,
            }
          }
        }

        return { token0usdPrice: undefined, token1usdPrice: undefined }
      } catch (e) {
        console.log(e)
        return { token0usdPrice: null, token1usdPrice: null }
      }
    },
  })

  const { token0usdPrice, token1usdPrice } = useMemo(() => {
    if (!separatedFiatValueofLiquidity.data || !trade) return { token0usdPrice: undefined, token1usdPrice: undefined }
    return {
      token0usdPrice: separatedFiatValueofLiquidity.data.token0usdPrice
        ? Number(separatedFiatValueofLiquidity.data.token0usdPrice) * Number(trade.inputAmount.toSignificant())
        : undefined,
      token1usdPrice: separatedFiatValueofLiquidity.data.token1usdPrice
        ? Number(separatedFiatValueofLiquidity.data.token1usdPrice) * Number(trade?.outputAmount.toSignificant())
        : undefined,
    }
  }, [separatedFiatValueofLiquidity])

  const usdPriceDifference = useMemo(() => {
    if (!token0usdPrice || !token1usdPrice) return undefined
    else
      return parseFloat(
        ((token1usdPrice - token0usdPrice) / token0usdPrice * 100).toFixed(2)
      )
  }, [token0usdPrice, token1usdPrice])

  const amountToApprove = useMemo(
    () => (trade ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [trade, allowedSlippage]
  )

  const spender = useMemo(() => {
    if (trade) {
      const isTradeTypeV2 = (trade as any).swaps
      return isTradeTypeV2 ? swapRouterAddressV2 : swapRouterAddressV1
    }
    return undefined
  }, [trade])

  const approveCallback = useApprovalCall(amountToApprove, spender)

  const handleSwap = useCallback(() => {
    if (!trade || !address || !deadline) return
    const handleApproval = approveCallback()
    if (!handleApproval) return
    const isTradeTypeV2 = (trade as any).swaps
    const { inputAmount, outputAmount } = trade
    const route = (trade as any).route
    const callData = []
    callData.push(handleApproval)
    const amountIn: string = toHex(trade.maximumAmountIn(allowedSlippage, inputAmount).quotient)
    const amountOut: string = toHex(trade.minimumAmountOut(allowedSlippage, outputAmount).quotient)
    if (isTradeTypeV2) {
      const isRouteSingleHop = route.pools.length === 1
      if (trade.tradeType === TradeType.EXACT_INPUT) {
        if (isRouteSingleHop) {
          const exactInputSingleParams = {
            token_in: route.tokenPath[0].address,
            token_out: route.tokenPath[1].address,
            fee: route.pools[0].fee,
            recipient: address,
            deadline: cairo.felt(deadline.toString()),
            amount_in: cairo.uint256(inputAmount.raw.toString()),
            amount_out_minimum: cairo.uint256(amountOut),
            sqrt_price_limit_X96: cairo.uint256(0),
          }
          const compiledSwapCalls = CallData.compile(exactInputSingleParams)

          const calls = {
            contractAddress: swapRouterAddressV2,
            entrypoint: 'exact_input_single',
            calldata: compiledSwapCalls,
          }
          callData.push(calls)
        } else {
          const firstInputToken: Token = route.input.wrapped
          //create path
          const { path } = route.pools.reduce(
            (
              { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
              pool: Pool,
              index: number
            ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
              const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0
              if (index === 0) {
                return {
                  inputToken: outputToken,
                  types: ['address', 'address', 'uint24'],
                  path: [inputToken.address, outputToken.address, pool.fee],
                }
              } else {
                return {
                  inputToken: outputToken,
                  types: [...types, 'address', 'address', 'uint24'],
                  path: [...path, inputToken.address, outputToken.address, pool.fee],
                }
              }
            },
            { inputToken: firstInputToken, path: [], types: [] }
          )

          const exactInputParams = {
            path,
            recipient: address,
            deadline: cairo.felt(deadline.toString()),
            amount_in: cairo.uint256(inputAmount.raw.toString()),
            amount_out_minimum: cairo.uint256(amountOut),
          }
          const compiledSwapCalls = CallData.compile(exactInputParams)

          const calls = {
            contractAddress: swapRouterAddressV2,
            entrypoint: 'exact_input',
            calldata: compiledSwapCalls,
          }
          callData.push(calls)
        }
      } else {
        if (isRouteSingleHop) {
          const exactOutputSingleParams = {
            token_in: route.tokenPath[0].address,
            token_out: route.tokenPath[1].address,
            fee: route.pools[0].fee,
            recipient: address,
            deadline: cairo.felt(deadline.toString()),
            amount_out: cairo.uint256(outputAmount.raw.toString()),
            amount_in_maximum: cairo.uint256(amountIn),
            sqrt_price_limit_X96: cairo.uint256(0),
          }

          const compiledSwapCalls = CallData.compile(exactOutputSingleParams)

          const calls = {
            contractAddress: swapRouterAddressV2,
            entrypoint: 'exact_output_single',
            calldata: compiledSwapCalls,
          }
          callData.push(calls)
        } else {
          const firstInputToken: Token = route.input.wrapped
          //create path
          const { path } = route.pools.reduce(
            (
              { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
              pool: Pool,
              index: number
            ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
              const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0
              if (index === 0) {
                return {
                  inputToken: outputToken,
                  types: ['uint24', 'address', 'address'],
                  path: [pool.fee, inputToken.address, outputToken.address],
                }
              } else {
                return {
                  inputToken: outputToken,
                  types: [...types, 'uint24', 'address', 'address'],
                  path: [...path, pool.fee, inputToken.address, outputToken.address],
                }
              }
            },
            { inputToken: firstInputToken, path: [], types: [] }
          )

          const reversePath = path.reverse()

          const exactOutputParams = {
            path: reversePath,
            recipient: address,
            deadline: cairo.felt(deadline.toString()),
            amount_out: cairo.uint256(outputAmount.raw.toString()),
            amount_in_maximum: cairo.uint256(amountIn),
          }

          const compiledSwapCalls = CallData.compile(exactOutputParams)

          const calls = {
            contractAddress: swapRouterAddressV2,
            entrypoint: 'exact_output',
            calldata: compiledSwapCalls,
          }
          callData.push(calls)
        }
      }
    } else {
      const path: string[] = route.path.map((token: any) => token.address)
      if (trade.tradeType === TradeType.EXACT_INPUT) {
        const swapArgs = {
          amountIn: cairo.uint256(inputAmount.raw.toString()),
          amountOutMin: cairo.uint256(amountOut),
          path,
          to: address,
          deadline: cairo.felt(deadline.toString()),
        }
        const compiledSwapCalls = CallData.compile(swapArgs)

        const calls = {
          contractAddress: swapRouterAddressV1,
          entrypoint: 'swap_exact_tokens_for_tokens',
          calldata: compiledSwapCalls,
        }

        callData.push(calls)
      } else {
        const swapArgs = {
          amountOut: cairo.uint256(outputAmount.raw.toString()),
          amountInMax: cairo.uint256(amountIn),
          path,
          to: address,
          deadline: cairo.felt(deadline.toString()),
        }

        const compiledSwapCalls = CallData.compile(swapArgs)

        const calls = {
          contractAddress: swapRouterAddressV1,
          entrypoint: 'swap_tokens_for_exact_tokens',
          calldata: compiledSwapCalls,
        }
        callData.push(calls)
      }
    }
    setSwapCallData(callData)
  }, [trade, address, deadline, approveCallback])

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    if (!isClassicTrade(trade)) {
      return { priceImpactSeverity: 0, largerPriceImpact: undefined }
    }

    const marketPriceImpact = undefined
    const newLargerPriceImpact = largerPercentValue(marketPriceImpact, preTaxStablecoinPriceImpact)
    return { priceImpactSeverity: warningSeverity(newLargerPriceImpact), newLargerPriceImpact }
  }, [preTaxStablecoinPriceImpact, trade])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState((currentState) => ({ ...currentState, showConfirm: false }))
    // If there was a swap, we want to clear the input
    if (swapResult) {
      onUserInput(Field.INPUT, '')
    }
  }, [onUserInput, swapResult])

  const handleAcceptChanges = useCallback(() => {
    setSwapState((currentState) => ({ ...currentState, tradeToConfirm: trade }))
  }, [trade])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(Field.INPUT, inputCurrency)
      onCurrencyChange?.({
        [Field.INPUT]: {
          currencyId: getSwapCurrencyId(inputCurrency),
        },
        [Field.OUTPUT]: state[Field.OUTPUT],
      })
    },
    [onCurrencyChange, onCurrencySelection, state]
  )
  const inputCurrencyNumericalInputRef = useRef<HTMLInputElement>(null)

  const handleMaxInput = useCallback(() => {
    if (!maxInputAmount) {
      return
    }
    onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      onCurrencyChange?.({
        [Field.INPUT]: state[Field.INPUT],
        [Field.OUTPUT]: {
          currencyId: getSwapCurrencyId(outputCurrency),
        },
      })
    },
    [onCurrencyChange, onCurrencySelection, state]
  )

  const showPriceImpactWarning = isClassicTrade(trade) && largerPriceImpact && priceImpactSeverity > 3

  const prevTrade = usePrevious(trade)
  useEffect(() => {
    if (!trade || prevTrade === trade) {
    } // no new swap quote to log
  }, [prevTrade, trade, allowedSlippage, swapQuoteLatency, inputTax, outputTax])

  const showDetailsDropdown = Boolean(
    !showWrap && userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing)
  )

  const inputCurrency = currencies[Field.INPUT] ?? undefined

  const swapElement = (
    <SwapWrapper className={className} id="swap-page">
      <TokenSafetyModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokenAddress={importTokensNotInDefault[0]?.address}
        secondTokenAddress={importTokensNotInDefault[1]?.address}
        onContinue={handleConfirmTokenWarning}
        onCancel={handleDismissTokenWarning}
        showCancel
      />
      <SwapHeader trade={trade} autoSlippage={autoSlippage} chainId={chainId} />
      {trade && showConfirm && (
        <ConfirmSwapModal
          trade={trade}
          inputCurrency={inputCurrency}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          onCurrencySelection={onCurrencySelection}
          swapResult={swapResult}
          allowedSlippage={allowedSlippage}
          clearSwapState={clearSwapState}
          onConfirm={handleSwap}
          allowance={allowance}
          swapError={swapError}
          onDismiss={handleConfirmDismiss}
          fiatValueInput={fiatValueTradeInput}
          fiatValueOutput={fiatValueTradeOutput}
          txData={txData}
          error={error}
        />
      )}
      {showPriceImpactModal && showPriceImpactWarning && (
        <PriceImpactModal
          priceImpact={largerPriceImpact}
          onDismiss={() => setShowPriceImpactModal(false)}
          onContinue={() => {
            setShowPriceImpactModal(false)
            handleContinueToReview()
          }}
        />
      )}

      <div style={{ display: 'relative' }}>
        <SwapSection>
          <SwapCurrencyInputPanel
            label={<Trans>From</Trans>}
            disabled={disableTokenInputs}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            currency={currencies[Field.INPUT] ?? null}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            fiatValue={token0usdPrice}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            showCommonBases
            id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
            loading={independentField === Field.OUTPUT && routeIsSyncing}
            ref={inputCurrencyNumericalInputRef}
          />
        </SwapSection>
        <ArrowWrapper clickable={isSupportedChain(chainId)}>
          <ArrowContainer
            data-testid="swap-currency-button"
            onClick={() => {
              if (disableTokenInputs) {
                return
              }
              onSwitchTokens(inputTokenHasTax, formattedAmounts[dependentField])
            }}
            color={theme.neutral1}
          >
            <ArrowDown size="16" color={theme.neutral1} />
          </ArrowContainer>
        </ArrowWrapper>
      </div>
      <AutoColumn gap="lg">
        <div>
          <OutputSwapSection>
            <SwapCurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              disabled={disableTokenInputs}
              onUserInput={handleTypeOutput}
              label={<Trans>To</Trans>}
              showMaxButton={false}
              hideBalance={false}
              fiatValue={token1usdPrice}
              priceImpact={stablecoinPriceImpact}
              currency={currencies[Field.OUTPUT] ?? null}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              usdPriceDifference={usdPriceDifference}
              showCommonBases
              id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
              loading={independentField === Field.INPUT && routeIsSyncing}
              numericalInputSettings={{
                // We disable numerical input here if the selected token has tax, since we cannot guarantee exact_outputs for FOT tokens
                disabled: outputTokenHasTax,
                // Focus the input currency panel if the user tries to type into the disabled output currency panel
                onDisabledClick: () => inputCurrencyNumericalInputRef.current?.focus(),
                disabledTooltipBody: <OutputTaxTooltipBody currencySymbol={currencies[Field.OUTPUT]?.symbol} />,
              }}
            />
            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.neutral2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove recipient</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
          </OutputSwapSection>
        </div>
        <div>
          {swapIsUnsupported ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Unsupported asset</Trans>
            </ButtonPrimary>
          ) : connectionReady && !account ? (
            <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          ) : isFetchingOutput ? (
            <ButtonPrimaryRed size={ButtonSize.large} disabled>
              <Trans>Fetching best price...</Trans>
            </ButtonPrimaryRed>
          ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Insufficient liquidity</Trans>
            </ButtonPrimary>
          ) : routeIsSyncing || routeIsLoading ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Fetching...</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonError
              onClick={() => {
                if (!showPriceImpactWarning) {
                  handleContinueToReview()
                  return
                }
                setShowPriceImpactModal(true)
              }}
              id="swap-button"
              data-testid="swap-button"
              size={ButtonSize.large}
              disabled={!getIsReviewableQuote(trade, tradeState, swapInputError)}
              error={!swapInputError && priceImpactSeverity > 2 && allowance.state === AllowanceState.ALLOWED}
            >
              {swapInputError ? (
                swapInputError
              ) : routeIsSyncing || routeIsLoading ? (
                <Trans>Swap</Trans>
              ) : priceImpactSeverity > 2 ? (
                <Trans>Swap anyway</Trans>
              ) : (
                <Trans>Swap</Trans>
              )}
            </ButtonError>
          )}
        </div>

        {showDetailsDropdown && (
          <SwapDetailsDropdown
            trade={trade}
            syncing={routeIsSyncing}
            loading={routeIsLoading}
            allowedSlippage={allowedSlippage}
          />
        )}
        {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
      </AutoColumn>
    </SwapWrapper>
  )

  return swapElement
}
