import { Token, Currency, CurrencyAmount, TokenAmount, TradeType } from '@vnaysn/jediswap-sdk-core'
import { encodeRouteToPath, Pool, Route, Trade } from '@vnaysn/jediswap-sdk-v3'
import { BigNumber } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
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

function queryResults(data: any) {
  return async function () {
    if (!data) throw new Error('address is required')

    return await data
  }
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
  // State to store the resolved result

  if (!routes)
    return {
      state: TradeState.NO_ROUTE_FOUND,
      trade: null,
    }

  const { account, address } = useAccountDetails()
  const quoteExactInInputs = useMemo(() => {
    if (routesLoading || !amountIn || !address || !routes) return [{}]
    return routes.map((route: Route<Currency, Currency>) => {
      const isRouteSingleHop = route.pools.length === 1

      //multi hop
      if (!isRouteSingleHop) {
        const firstInputToken: Token = route.input.wrapped
        //create path
        const { path, types } = route.pools.reduce(
          (
            { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
            pool: Pool,
            index
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

        return {
          tx_type: '0x1',
          contract_address: SWAP_ROUTER_ADDRESS,
          entry_point: hash.getSelectorFromName('exact_input'),
          call_data_length: path.length + 7,
          path,
          recipient: address,
          deadline: cairo.felt('0x6bb311a1'),
          amount_in: amountIn ? cairo.uint256(`0x${amountIn.raw.toString(16)}`) : 0,
          amount_out_minimum: cairo.uint256(0),
        }
      } else {
        //single hop
        const isCurrencyInFirst = amountIn?.currency?.address === route.pools[0].token0.address
        const sortedTokens = isCurrencyInFirst
          ? [route.pools[0].token0.address, route.pools[0].token1.address]
          : [route.pools[0].token1.address, route.pools[0].token0.address]
        return {
          tx_type: '0x1',
          contract_address: SWAP_ROUTER_ADDRESS,
          entry_point: hash.getSelectorFromName('exact_input_single'),
          call_data_length: cairo.felt('0xb'),
          token_in: sortedTokens[0],
          token_out: sortedTokens[1],
          fee: route.pools[0].fee,
          recipient: address,
          deadline: cairo.felt('0x6bb311a1'),
          amount_in: amountIn ? cairo.uint256(`0x${amountIn.raw.toString(16)}`) : 0,
          amount_out_minimum: cairo.uint256(0),
          sqrt_price_limit_X96: cairo.uint256(0),
        }
      }
    })
  }, [routes, amountIn, address])

  const approveCall = useMemo(() => {
    if (!amountIn) return
    return {
      tx_type: '0x1',
      currency_address: amountIn.currency.address,
      selector: hash.getSelectorFromName('approve'),
      call_data_length: '0x03',
      router_address: SWAP_ROUTER_ADDRESS,
      approveAmount: cairo.uint256(2 ** 128),
    }
  }, [amountIn])

  const compiledApprovedCall = useMemo(() => {
    if (!approveCall) return
    return CallData.compile(approveCall)
  }, [approveCall])

  // const { data, error } = useQuoteExactInput(compiledCallData)
  const privateKey = '0x1234567890987654321'

  const message: BigNumberish[] = [1, 128, 18, 14]

  const { data: blockNumber } = useBlockNumber({
    refetchInterval: false,
    blockIdentifier: 'latest' as BlockNumber,
  })

  const nonce = useMemo(async () => {
    if (!account) return
    const nonce = await account?.getNonce()
    return nonce
  }, [account])

  const msgHash = hash.computeHashOnElements(message)
  const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey)

  const callsArr = useMemo(() => {
    if (!nonce || !quoteExactInInputs || !quoteExactInInputs.length) return
    const results = quoteExactInInputs.map((input, index) => {
      const approveCallWithInvocations = {
        contractAddress: address,
        calldata: compiledApprovedCall,
        type: TransactionType.INVOKE,
        nonce: 110,
        signature,
        maxFee: '0x0',
      }

      const compiledInputs = CallData.compile(input as any)
      const compiledInputWithInvocations = {
        contractAddress: address,
        calldata: compiledInputs,
        type: TransactionType.INVOKE,
        nonce: 111,
        signature,
        maxFee: '0x0',
      }
      return [approveCallWithInvocations, compiledInputWithInvocations]
      // const inputCall = [approveCall, inputs]
    })

    return results
  }, [quoteExactInInputs, nonce, compiledApprovedCall])

  const amountOutResults = useMemo(() => {
    if (!address || !account || !callsArr || !callsArr.length) return

    const callPromises = callsArr.map(async (call) => {
      const result = await account.getSimulateTransaction(call as any, {
        blockIdentifier: blockNumber,
        skipValidate: true,
      })
      return result
    })

    return callPromises

    // const nonce = await account.getNonce()
    // if (!nonce) return
  }, [address, account, callsArr])

  function fromUint256ToNumber(uint256: any) {
    // Assuming uint256 is an object with 'high' and 'low' properties
    const { high, low } = uint256
    return high
  }

  const filteredAmountOutResults = useMemo(async () => {
    try {
      const settledResults = await Promise.allSettled(amountOutResults as any)

      const resolvedResults = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result: any) => result.value)

      const bestRouteResults = { bestRoute: null, amountOut: null }

      resolvedResults.forEach((results) => {
        const { bestRoute, amountOut } = results.reduce((currentBest: any, result: any, i: any) => {
          const selected_tx = results[1]
          const selected_tx_result = selected_tx?.transaction_trace?.execute_invocation?.result
          const amountOut = fromUint256ToNumber({ high: selected_tx_result[2], low: selected_tx_result[3] })

          if (!result) return currentBest
          if (currentBest.amountOut === null) {
            bestRouteResults.bestRoute = routes[i]
            bestRouteResults.amountOut = amountOut
          } else if (Number(cairo.felt(currentBest.amountOut)) < Number(cairo.felt(amountOut))) {
            bestRouteResults.bestRoute = routes[i]
            bestRouteResults.amountOut = amountOut
          }

          return currentBest
        }, bestRouteResults)
      })

      return bestRouteResults
    } catch (error) {
      console.error('Error resolving promises:', error)
      return null
    }
  }, [amountOutResults])

  // useEffect(() => {
  //   // Define an async function within useEffect
  //   async function fetchData() {
  //     try {
  //       // Check if filteredAmountOutResults is truthy
  //       if (filteredAmountOutResults) {
  //         // Await the resolved value from the promise
  //         const result = await filteredAmountOutResults
  //         // Update the state with the resolved result
  //         setResultProps(result)
  //       }
  //     } catch (error) {
  //       console.error('Error resolving promise:', error)
  //     }
  //   }

  //   // Call the async function
  //   fetchData()
  // }, [filteredAmountOutResults])

  return useMemo(() => {
    if (!amountIn || !currencyOut || !filteredAmountOutResults) {
      return {
        state: TradeState.INVALID,
        trade: null,
      }
    }

    if (routesLoading) {
      return {
        state: TradeState.LOADING,
        trade: null,
      }
    }
    let bestRoute: any = null
    let amountOut: any = null
    filteredAmountOutResults.then((res) => {
      if (res) {
        bestRoute = res.bestRoute
        amountOut = res.amountOut
      }
    })

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
  }, [amountIn, currencyOut, filteredAmountOutResults])
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
  const { address, account } = useAccountDetails()
  const quoteExactOutInputs = useMemo(() => {
    if (routesLoading || !amountOut || !address || !routes) return [{}]
    return routes.map((route: Route<Currency, Currency>) => {
      const isRouteSingleHop = route.pools.length === 1

      //multi hop
      if (!isRouteSingleHop) {
        const firstInputToken: Token = route.input.wrapped
        //create path
        const { path } = route.pools.reduce(
          (
            { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
            pool: Pool,
            index
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

        const reversePath = path.reverse()

        return {
          tx_type: '0x1',
          contract_address: SWAP_ROUTER_ADDRESS,
          entry_point: hash.getSelectorFromName('exact_output'),
          call_data_length: reversePath.length + 7,
          path: reversePath,
          recipient: address,
          deadline: cairo.felt('0x6bb311a1'),
          amount_out: amountOut ? cairo.uint256(`0x${amountOut.raw.toString(16)}`) : 0,
          amount_in_maximum: cairo.uint256(2 ** 128),
        }
      } else {
        //single hop
        const isCurrencyInFirst = amountOut?.currency?.address === route.pools[0].token0.address
        const sortedTokens = isCurrencyInFirst
          ? [route.pools[0].token0.address, route.pools[0].token1.address]
          : [route.pools[0].token1.address, route.pools[0].token0.address]
        return {
          tx_type: '0x1',
          contract_address: SWAP_ROUTER_ADDRESS,
          entry_point: hash.getSelectorFromName('exact_output_single'),
          call_data_length: cairo.felt('0xb'),
          token_in: sortedTokens[1],
          token_out: sortedTokens[0],
          fee: route.pools[0].fee,
          recipient: address,
          deadline: cairo.felt('0x6bb311a1'),
          amount_out: amountOut ? cairo.uint256(`0x${amountOut.raw.toString(16)}`) : 0,
          amount_in_maximum: cairo.uint256(2 ** 128),
          sqrt_price_limit_X96: cairo.uint256(0),
        }
      }
    })
  }, [routes])

  const approveCall = useMemo(() => {
    if (!amountOut) return
    return {
      tx_type: '0x1',
      currency_address: (currencyIn as any).address,
      selector: hash.getSelectorFromName('approve'),
      call_data_length: '0x03',
      router_address: SWAP_ROUTER_ADDRESS,
      approveAmount: cairo.uint256(2 ** 128),
    }
  }, [amountOut])

  const compiledApprovedCall = useMemo(() => {
    if (!approveCall) return
    return CallData.compile(approveCall)
  }, [approveCall])

  // const { data, error } = useQuoteExactInput(compiledCallData)
  const privateKey = '0x1234567890987654321'

  const message: BigNumberish[] = [1, 128, 18, 14]

  const { data: blockNumber } = useBlockNumber({
    refetchInterval: false,
    blockIdentifier: 'latest' as BlockNumber,
  })

  const nonce = useMemo(async () => {
    if (!account) return
    const nonce = await account?.getNonce()
    return nonce
  }, [account])

  const msgHash = hash.computeHashOnElements(message)
  const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey)

  const callsArr = useMemo(() => {
    if (!nonce || !quoteExactOutInputs || !quoteExactOutInputs.length) return
    const results = quoteExactOutInputs.map((input, index) => {
      const approveCallWithInvocations = {
        contractAddress: address,
        calldata: compiledApprovedCall,
        type: TransactionType.INVOKE,
        nonce: 110,
        signature,
        maxFee: '0x0',
      }

      const compiledInputs = CallData.compile(input as any)
      const compiledInputWithInvocations = {
        contractAddress: address,
        calldata: compiledInputs,
        type: TransactionType.INVOKE,
        nonce: 111,
        signature,
        maxFee: '0x0',
      }
      return [approveCallWithInvocations, compiledInputWithInvocations]
      // const inputCall = [approveCall, inputs]
    })

    return results
  }, [quoteExactOutInputs, nonce, compiledApprovedCall])

  const amountOutResults = useMemo(() => {
    if (!address || !account || !callsArr || !callsArr.length) return

    const callPromises = callsArr.map(async (call) => {
      const result = await account.getSimulateTransaction(call as any, {
        blockIdentifier: blockNumber,
        skipValidate: true,
      })
      return result
    })

    return callPromises

    // const nonce = await account.getNonce()
    // if (!nonce) return
  }, [address, account, callsArr])

  function fromUint256ToNumber(uint256: any) {
    // Assuming uint256 is an object with 'high' and 'low' properties
    const { high, low } = uint256
    return high
  }

  const filteredAmountOutResults = useMemo(async () => {
    try {
      const settledResults = await Promise.allSettled(amountOutResults as any)

      const resolvedResults = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result: any) => result.value)

      const bestRouteResults = { bestRoute: null, amountOut: null }

      resolvedResults.forEach((results) => {
        const { bestRoute, amountOut } = results.reduce((currentBest: any, result: any, i: any) => {
          const selected_tx = results[1]
          const selected_tx_result = selected_tx?.transaction_trace?.execute_invocation?.result
          const amountOut = fromUint256ToNumber({ high: selected_tx_result[2], low: selected_tx_result[3] })

          if (!result) return currentBest
          if (currentBest.amountOut === null) {
            bestRouteResults.bestRoute = routes[i]
            bestRouteResults.amountOut = amountOut
          } else if (Number(cairo.felt(currentBest.amountOut)) < Number(cairo.felt(amountOut))) {
            bestRouteResults.bestRoute = routes[i]
            bestRouteResults.amountOut = amountOut
          }

          return currentBest
        }, bestRouteResults)
      })

      return bestRouteResults
    } catch (error) {
      console.error('Error resolving promises:', error)
      return null
    }
  }, [amountOutResults])

  return useMemo(() => {
    if (!amountOut || !currencyIn) {
      return {
        state: TradeState.INVALID,
        trade: null,
      }
    }

    if (routesLoading) {
      return {
        state: TradeState.LOADING,
        trade: null,
      }
    }

    const bestRoute = null
    const amountIn = null

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
