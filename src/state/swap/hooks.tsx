import { Trans } from '@lingui/macro'
import { ChainId, Currency, CurrencyAmount, Percent, TradeType } from '@vnaysn/jediswap-sdk-core'
import { useAccountBalance, useAccountDetails } from 'hooks/starknet-react'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { useFotAdjustmentsEnabled } from 'featureFlags/flags/fotAdjustments'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useDebouncedTrade } from 'hooks/useDebouncedTrade'
import { useSwapTaxes } from 'hooks/useSwapTaxes'
import { useUSDPrice } from 'hooks/useUSDPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { AnyAction } from 'redux'
import { useAppDispatch } from 'state/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { isClassicTrade } from 'state/routing/utils'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'

// import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { useCurrencyBalances } from '../connection/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useBestV3TradeExactIn, useBestV3TradeExactOut } from 'hooks/useBestV3Trade'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { BigNumber } from 'ethers'

export function useSwapActionHandlers(dispatch: React.Dispatch<AnyAction>): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: (newOutputHasTax: boolean, previouslyEstimatedOutput: string) => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(
    (newOutputHasTax: boolean, previouslyEstimatedOutput: string) => {
      dispatch(switchCurrencies({ newOutputHasTax, previouslyEstimatedOutput }))
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

export type SwapInfo = {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  inputTax: Percent
  outputTax: Percent
  outputFeeFiatValue?: number
  parsedAmount?: CurrencyAmount<Currency>
  inputError?: ReactNode
  trade: {
    trade?: InterfaceTrade
    state: TradeState
    uniswapXGasUseEstimateUSD?: number
    error?: any
    swapQuoteLatency?: number
  }
  allowedSlippage: Percent
  autoSlippage: Percent
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(state: SwapState, chainId: ChainId | undefined, allPools: string[]): SwapInfo {
  const { address: account } = useAccountDetails()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = state

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const fotAdjustmentsEnabled = useFotAdjustmentsEnabled()
  const { inputTax, outputTax } = useSwapTaxes(
    inputCurrency?.isToken && fotAdjustmentsEnabled ? inputCurrency.address : undefined,
    outputCurrency?.isToken && fotAdjustmentsEnabled ? outputCurrency.address : undefined
  )

  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const token0balance = useAccountBalance(inputCurrency ?? undefined)
  const token1balance = useAccountBalance(outputCurrency ?? undefined)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  const bestV3TradeExactIn = useBestV3TradeExactIn(
    allPools,
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined
  )
  const bestV3TradeExactOut = useBestV3TradeExactOut(
    allPools,
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined
  )

  const [bestV2TradeExactIn] = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)

  const [bestV2TradeExactOut] = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const bestTradeExactIn = useMemo(() => {
    if (bestV2TradeExactIn && bestV3TradeExactIn && bestV3TradeExactIn.trade) {
      const v2OutputAmount = BigInt(bestV2TradeExactIn.outputAmount.raw.toString())
      const v3OutputAmount = BigInt(bestV3TradeExactIn.trade.outputAmount.raw.toString())
      return v2OutputAmount > v3OutputAmount
        ? { state: TradeState.VALID, trade: bestV2TradeExactIn }
        : bestV3TradeExactIn
    } else if (!bestV2TradeExactIn && bestV3TradeExactIn) {
      return bestV3TradeExactIn
    } else if (bestV2TradeExactIn && !bestV3TradeExactIn?.trade) {
      return { state: TradeState.VALID, trade: bestV2TradeExactIn }
    }

    return {
      state: TradeState.INVALID,
      trade: null,
    }
  }, [bestV2TradeExactIn, bestV3TradeExactIn])

  const bestTradeExactOut = useMemo(() => {
    if (bestV2TradeExactOut && bestV3TradeExactOut && bestV3TradeExactOut.trade) {
      const v2InputAmount = BigInt(bestV2TradeExactOut.inputAmount.raw.toString())
      const v3InputAmount = BigInt(bestV3TradeExactOut.trade.inputAmount.raw.toString())
      return v2InputAmount < v3InputAmount
        ? { state: TradeState.VALID, trade: bestV2TradeExactOut }
        : bestV3TradeExactOut
    } else if (!bestV2TradeExactOut && bestV3TradeExactOut) {
      return bestV3TradeExactOut
    } else if (bestV2TradeExactOut && !bestV3TradeExactOut?.trade) {
      return bestV2TradeExactOut
    }

    return {
      state: TradeState.INVALID,
      trade: null,
    }
  }, [bestV2TradeExactOut, bestV3TradeExactOut])

  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const { data: outputFeeFiatValue } = useUSDPrice(undefined, trade.trade?.outputAmount.currency)

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  )

  // allowed slippage for classic trades is either auto slippage, or custom user defined slippage if auto slippage disabled
  const classicAutoSlippage = useAutoSlippageTolerance(isClassicTrade(trade.trade) ? trade.trade : undefined)

  // slippage for uniswapx trades is defined by the quote response
  const uniswapXAutoSlippage = undefined

  // Uniswap interface recommended slippage amount
  const autoSlippage = uniswapXAutoSlippage ?? classicAutoSlippage
  const classicAllowedSlippage = useUserSlippageToleranceWithDefault(autoSlippage)

  // slippage amount used to submit the trade
  const allowedSlippage = uniswapXAutoSlippage ?? classicAllowedSlippage

  const connectionReady = useConnectionReady()
  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = connectionReady ? <Trans>Connect wallet</Trans> : <Trans>Connecting wallet...</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddressValidForStarknet(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }

    // compare input balance to max input based on version
    const maxAmountIn = Number(trade?.trade?.maximumAmountIn(allowedSlippage)?.toSignificant())

    if (token0balance && token0balance.balance && Number(token0balance.balance) < maxAmountIn) {
      inputError = <Trans>Insufficient {inputCurrency?.symbol} balance</Trans>
    }

    return inputError
  }, [account, currencies, parsedAmount, to, currencyBalances, trade?.trade, allowedSlippage, connectionReady])

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
      autoSlippage,
      allowedSlippage,
      inputTax,
      outputTax,
      outputFeeFiatValue,
    }),
    [
      allowedSlippage,
      autoSlippage,
      currencies,
      currencyBalances,
      inputError,
      inputTax,
      outputFeeFiatValue,
      outputTax,
      parsedAmount,
      trade,
    ]
  )
}

function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    // if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)

  if (inputCurrency === '' && outputCurrency === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the native currency selected
    inputCurrency = 'ETH'
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue,
    independentField,
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(): SwapState {
  const { chainId } = useAccountDetails()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  const parsedSwapState = useMemo(() => {
    return queryParametersToSwapState(parsedQs)
  }, [parsedQs])

  useEffect(() => {
    if (!chainId) return
    const inputCurrencyId = parsedSwapState[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsedSwapState[Field.OUTPUT].currencyId ?? undefined

    dispatch(
      replaceSwapState({
        typedValue: parsedSwapState.typedValue,
        field: parsedSwapState.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsedSwapState.recipient,
      })
    )
  }, [dispatch, chainId, parsedSwapState])

  return parsedSwapState
}
