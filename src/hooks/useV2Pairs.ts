import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import IUniswapV2PairJSON from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { computePairAddress, Pair } from '@vnaysn/jediswap-sdk-v2'
import { useMemo } from 'react'
import { V2_FACTORY_ADDRESSES } from 'constants/addresses'
import { validateAndParseAddress } from 'starknet'
import { useAllPairs } from 'state/pairs/hooks'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import JediswapPairABI from 'constants/abis/Pair.json'

const PAIR_INTERFACE = new Interface(IUniswapV2PairJSON.abi)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useV2Pairs(
  pairs: string[],
  currencies: [Currency | undefined, Currency | undefined][]
): [PairState, Pair | null][] {
  const tokens = useMemo(
    () => currencies.map(([currencyA, currencyB]) => [currencyA?.wrapped, currencyB?.wrapped]),
    [currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? validateAndParseAddress(Pair.getAddress(tokenA, tokenB))
          : undefined
      }),
    [tokens]
  )

  const validatedPairAddress = useMemo(
    () => pairAddresses.map((addr) => (addr && pairs.includes(addr) ? addr : undefined)),
    [pairs, pairAddresses]
  )

  const definedPairAddress = useMemo(
    () => validatedPairAddress.filter((addr) => addr !== undefined),
    [validatedPairAddress]
  )

  const results = useMultipleContractSingleData(definedPairAddress, JediswapPairABI, 'get_reserves')
  // const reserves = validateAndParseAddress.

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
  return useV2Pairs([], inputs)[0]
}
