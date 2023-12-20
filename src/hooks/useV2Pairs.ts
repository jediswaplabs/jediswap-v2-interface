import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import IUniswapV2PairJSON from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { computePairAddress, Pair } from '@vnaysn/jediswap-sdk-v2'
import { useMemo } from 'react'

import JediswapPairABI from '../constants/abis/Pair.json'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { V2_FACTORY_ADDRESSES } from 'constants/addresses'


export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useV2Pairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const tokens = useMemo(
    () => currencies.map(([currencyA, currencyB]) => [currencyA?.wrapped, currencyB?.wrapped]),
    [currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA &&
          tokenB &&
          tokenA.chainId === tokenB.chainId &&
          !tokenA.equals(tokenB) &&
          V2_FACTORY_ADDRESSES[tokenA.chainId]
          ? computePairAddress({ factoryAddress: V2_FACTORY_ADDRESSES[tokenA.chainId], tokenA, tokenB })
          : undefined
      }),
    [tokens]
  )

  console.log({pairAddresses})

  const results = useMultipleContractSingleData(pairAddresses, JediswapPairABI, 'get_reserves')
  console.log({results})

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString())
        ),
      ]
    })
  }, [results, tokens])
}

export function useV2Pair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(() => [[tokenA, tokenB]], [tokenA, tokenB])
  return useV2Pairs(inputs)[0]
}