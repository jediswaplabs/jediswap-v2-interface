import { Token, Currency, CurrencyAmount, TokenAmount, TradeType } from '@vnaysn/jediswap-sdk-core'
import { encodeRouteToPath, Route, Trade } from '@vnaysn/jediswap-sdk-v3'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSingleContractMultipleData } from '../state/multicall/hooks'
import { useAllV3Routes } from './useAllV3Routes'
import { useBlockNumber, useContractRead } from '@starknet-react/core'
import SWAP_QUOTER_ABI from 'contracts/swapquoter/abi.json'
import { SWAP_QUOTER_ADDRESS, SWAP_ROUTER_ADDRESS } from 'constants/tokens'
import { BigNumberish, BlockNumber, CallData, TransactionType, cairo, encode, num } from 'starknet'
import { TradeState } from 'state/routing/types'
import { ec, hash, json, Contract, WeierstrassSignatureType } from 'starknet'
import { useAccountDetails } from './starknet-react'
import { useApprovalCall } from './useApproveCall'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
// import { useV3Quoter } from './useContract'

export enum V3TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

const useQuoteExactInput = (compiledCallData: any) => {
  const { data, isError, error } = useContractRead({
    functionName: 'quote_exact_input',
    args: [compiledCallData],
    abi: SWAP_QUOTER_ABI,
    address: SWAP_QUOTER_ADDRESS,
    watch: true,
  })

  return { data, error }
}

const useQuoteExactOutput = (compiledCallData: any) => {
  const { data, isError, error } = useContractRead({
    functionName: 'quote_exact_output',
    args: [compiledCallData],
    abi: SWAP_QUOTER_ABI,
    address: SWAP_QUOTER_ADDRESS,
    watch: true,
  })

  return { data, error }
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestV3TradeExactIn(
  allPools: string[],
  amountIn?: any,
  currencyOut?: Currency
): { state: TradeState; trade: any | null } {
  const { routes, loading: routesLoading } = useAllV3Routes(allPools, amountIn?.currency, currencyOut)
  const { account, address } = useAccountDetails()
  const quoteExactInInputs = useMemo(() => {
    if (routesLoading || !amountIn || !address) return []
    return routes.map((route: Route<Currency, Currency>, index: number) => {
      const isCurrencyInFirst = amountIn?.currency?.address === route.pools[0].token0.address
      const sortedTokens = isCurrencyInFirst
        ? [route.pools[0].token0.address, route.pools[0].token1.address]
        : [route.pools[0].token1.address, route.pools[0].token0.address]
      return {
        id: '0x1',
        contract_address: SWAP_ROUTER_ADDRESS,
        entry_point: hash.getSelectorFromName('exact_input_single'),
        length: cairo.felt('0xb'),
        token_in: sortedTokens[0],
        token_out: sortedTokens[1],
        fee: route.pools[0].fee,
        recipient: address,
        deadline: cairo.felt('0x6bb311a1'),
        amount_in: amountIn ? cairo.uint256(`0x${amountIn.raw.toString(16)}`) : 0,
        amount_out_minimum: cairo.uint256(0),
        sqrt_price_limit_X96: cairo.uint256(0),
      }
    })
  }, [routes])

  const approveCall = useMemo(() => {
    if (!amountIn) return
    return {
      id: '0x1',
      currency_address: amountIn.currency.address,
      selector: '0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c',
      length: '0x03',
      router_address: SWAP_ROUTER_ADDRESS,
      approveAmount: cairo.uint256(10 ** 18),
    }
  }, [amountIn])

  const compiledApprovedCall = useMemo(() => {
    if (!approveCall) return
    return CallData.compile(approveCall)
  }, [approveCall])

  const callData = useMemo(() => {
    if (!quoteExactInInputs || !quoteExactInInputs.length) return
    return quoteExactInInputs[0]
  }, [quoteExactInInputs])

  const callDataFirstIndex = useMemo(() => {
    if (!quoteExactInInputs || !quoteExactInInputs.length) return
    return quoteExactInInputs[1]
  }, [quoteExactInInputs])

  const compiledCallData = useMemo(() => {
    if (!callData) return
    return CallData.compile(callData)
  }, [callData])

  const compiledCallDataFirstIndex = useMemo(() => {
    if (!callDataFirstIndex) return
    return CallData.compile(callDataFirstIndex)
  }, [callDataFirstIndex])

  // const { data, error } = useQuoteExactInput(compiledCallData)
  const privateKey = '0x1234567890987654321'

  const message: BigNumberish[] = [1, 128, 18, 14]

  const {
    data: blockNumber,
    isLoading,
    isError,
  } = useBlockNumber({
    refetchInterval: false,
    blockIdentifier: 'latest' as BlockNumber,
  })

  // if (!callData || !address)
  //   return {
  //     state: TradeState.LOADING,
  //     trade: null,
  //   }

  const msgHash = hash.computeHashOnElements(message)
  const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey)

  const amountOutResults = useMemo(async () => {
    if (!address || !compiledCallData || !account || !compiledApprovedCall || !compiledCallDataFirstIndex) return
    const nonce = await account.getNonce()
    if (!nonce) return

    const results = await account.getSimulateTransaction(
      [
        {
          contractAddress: address,
          calldata: compiledApprovedCall,
          type: TransactionType.INVOKE,
          nonce,
          signature,
          maxFee: '0x0',
        },
        {
          contractAddress: address,
          calldata: compiledCallData,
          type: TransactionType.INVOKE,
          nonce: 111,
          signature,
          maxFee: '0x6f',
        },
        {
          contractAddress: address,
          calldata: compiledCallDataFirstIndex,
          type: TransactionType.INVOKE,
          nonce: 112,
          signature,
          maxFee: '0x6f',
        },
      ],
      { blockIdentifier: blockNumber, skipValidate: true }
    )

    return results
  }, [compiledCallData, compiledApprovedCall, address, account])

  const error = { message: '' }

  // const { data, isError, error } = useContractRead({
  //   functionName: 'quote_exact_input',
  //   args: [compiledCallData],
  //   abi: SWAP_QUOTER_ABI,
  //   address: SWAP_QUOTER_ADDRESS,
  //   watch: true,
  // })

  // const quotesResults = useSingleContractMultipleData(quoter, 'quoteExactInput', quoteExactInInputs)

  return useMemo(() => {
    if (!amountIn || !currencyOut || !error) {
      return {
        state: TradeState.INVALID,
        trade: null,
      }
    }
    const errorString = error?.message

    // Use a regular expression to extract the value
    const match = errorString.match(/Failure reason: (0x[0-9a-fA-F]+)/)

    // Check if there's a match and retrieve the value
    const failureReason = match ? match[1] : null

    if (routesLoading) {
      return {
        state: TradeState.LOADING,
        trade: null,
      }
    }

    const bestRoute = routes[0]
    const amountOut = failureReason?.toString()

    // const { bestRoute, amountOut } = quotesResults.reduce(
    //   (currentBest: { bestRoute: Route | null; amountOut: BigNumber | null }, { result }, i) => {
    //     if (!result) return currentBest

    //     if (currentBest.amountOut === null) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     } else if (currentBest.amountOut.lt(result.amountOut)) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     }

    //     return currentBest
    //   },
    //   {
    //     bestRoute: null,
    //     amountOut: null,
    //   }
    // )

    if (!bestRoute || !amountOut) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: null,
      }
    }

    // const isSyncing = quotesResults.some(({ syncing }) => syncing)

    return {
      state: TradeState.VALID,
      trade: Trade.createUncheckedTrade({
        route: bestRoute,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: amountIn,
        outputAmount: CurrencyAmount.fromRawAmount(currencyOut, num.hexToDecimalString(amountOut)),
      }),
    }
  }, [amountIn, currencyOut, error, routes, routesLoading])
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestV3TradeExactOut(
  allPools: string[],
  currencyIn?: Currency,
  amountOut?: any
): { state: TradeState; trade: any | null } {
  // : { state: V3TradeState; trade: any | null }
  // const quoter = useV3Quoter()
  const { routes, loading: routesLoading } = useAllV3Routes(allPools, currencyIn, amountOut?.currency)

  const quoteExactOutInputs = useMemo(() => {
    if (routesLoading || !amountOut) return []
    return routes.map((route: Route<Currency, Currency>, index: number) => {
      const isCurrencyInFirst = amountOut?.currency?.address === route.pools[0].token0.address
      const sortedTokens = isCurrencyInFirst
        ? [route.pools[0].token0.address, route.pools[0].token1.address]
        : [route.pools[0].token1.address, route.pools[0].token0.address]

      return {
        path: [...sortedTokens, route.pools[0].fee],
        amountOut: amountOut ? cairo.uint256(`0x${amountOut.raw.toString(16)}`) : 0,
      }
    })
  }, [routes])

  const callData = useMemo(() => {
    if (!quoteExactOutInputs || !quoteExactOutInputs.length) return
    return quoteExactOutInputs[0]
  }, [quoteExactOutInputs])

  const compiledCallData = useMemo(() => {
    if (!callData) return
    return CallData.compile(callData)
  }, [callData])

  const { data, error } = useQuoteExactOutput(compiledCallData)

  return useMemo(() => {
    if (!amountOut || !currencyIn || !error) {
      return {
        state: TradeState.INVALID,
        trade: null,
      }
    }

    const errorString = error?.message

    // Use a regular expression to extract the value
    const match = errorString.match(/Failure reason: (0x[0-9a-fA-F]+)/)

    // Check if there's a match and retrieve the value
    const failureReason = match ? match[1] : null

    if (routesLoading) {
      return {
        state: TradeState.LOADING,
        trade: null,
      }
    }

    const bestRoute = routes[0]
    const amountIn = failureReason?.toString()

    // const { bestRoute, amountOut } = quotesResults.reduce(
    //   (currentBest: { bestRoute: Route | null; amountOut: BigNumber | null }, { result }, i) => {
    //     if (!result) return currentBest

    //     if (currentBest.amountOut === null) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     } else if (currentBest.amountOut.lt(result.amountOut)) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     }

    //     return currentBest
    //   },
    //   {
    //     bestRoute: null,
    //     amountOut: null,
    //   }
    // )

    if (!bestRoute || !amountIn) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: null,
      }
    }

    return {
      state: TradeState.VALID,
      trade: Trade.createUncheckedTrade({
        route: bestRoute,
        tradeType: TradeType.EXACT_OUTPUT,
        inputAmount: CurrencyAmount.fromRawAmount(currencyIn, num.hexToDecimalString(amountIn)),
        outputAmount: amountOut,
      }),
    }
  }, [amountOut, currencyIn, routes, routesLoading])
}
