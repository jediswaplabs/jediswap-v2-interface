import { useToken } from 'hooks/Tokens'
import { useAccountDetails } from './starknet-react'
// import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { computePoolAddress, toHex } from '@vnaysn/jediswap-sdk-v3'
import { FeeAmount, Pool } from '@vnaysn/jediswap-sdk-v3'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useAllPairs } from 'state/pairs/hooks'
import { BigNumberish, BlockTag, CallData, Contract, ec, hash, num } from 'starknet'
import { useContractRead } from '@starknet-react/core'
import POOL_ABI from 'contracts/pool/abi.json'
import FACTORY_ABI from 'contracts/factoryAddress/abi.json'
import { POOL_CLASS_HASH, FACTORY_ADDRESS } from 'constants/tokens'
import { toInt } from 'utils/toInt'

// const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi) as IUniswapV3PoolStateInterface

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
export class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }),
    }
    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find((pool) => {
      return (
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
      )
    })
    if (found) return found
    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

interface CustomBigNumber {
  _hex: string
  _isBigNumber: boolean
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null][] {
  const { chainId } = useAccountDetails()

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddress: (string | undefined)[] = useMemo(
    () =>
      poolTokens.map((items): string | undefined => {
        if (items && items[0] && items[1] && items[2] && chainId) {
          // Check if tokens are defined
          const [tokenA, tokenB, feeAmount] = items

          const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

          //compute pool contract address
          const { calculateContractAddressFromHash } = hash

          const salt = ec.starkCurve.poseidonHashMany([
            BigInt(tokens[0].address),
            BigInt(tokens[1].address),
            BigInt(feeAmount),
          ])

          const constructorCalldata = CallData.compile([
            tokens[0].address,
            tokens[1].address,
            feeAmount,
            feeAmount / 50,
          ])

          return tokenA && tokenB && !tokenA.equals(tokenB)
            ? calculateContractAddressFromHash(
                salt,
                POOL_CLASS_HASH[chainId],
                constructorCalldata,
                FACTORY_ADDRESS[chainId]
              )
            : undefined
        }
        return undefined
      }),
    [poolTokens]
  )

  const { data: tick } = useContractRead({
    functionName: 'get_tick',
    args: [],
    abi: POOL_ABI,
    address: poolAddress?.[0],
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const tickCurrent = useMemo(() => {
    return toInt(tick)
  }, [tick])

  const { data: liquidity } = useContractRead({
    functionName: 'get_liquidity',
    args: [],
    abi: POOL_ABI,
    address: poolAddress?.[0],
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: sqrtPriceX96 } = useContractRead({
    functionName: 'get_sqrt_price_X96',
    args: [],
    abi: POOL_ABI,
    address: poolAddress?.[0],
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const sqrtPriceHex = sqrtPriceX96 && JSBI.BigInt(num.toHex(sqrtPriceX96 as BigNumberish))
  const liquidityHex = Boolean(liquidity) ? JSBI.BigInt(num.toHex(liquidity as BigNumberish)) : JSBI.BigInt('0x0')

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]

      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens
      if (!liquidityHex || !sqrtPriceHex) return [PoolState.NOT_EXISTS, null]
      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceHex, liquidityHex, tickCurrent)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidityHex, poolKeys, tickCurrent, poolTokens, sqrtPriceHex])
}

export function usePoolsForSwap(results: any): [PoolState, Pool | null][] {
  return useMemo(() => {
    return results.map((result: any) => {
      const { tickCurrent, liquidity, sqrtPriceX96, token0, token1, fee } = result
      const sqrtPriceHex = sqrtPriceX96 && JSBI.BigInt(num.toHex(sqrtPriceX96 as BigNumberish))
      const liquidityHex = Boolean(liquidity) ? JSBI.BigInt(num.toHex(liquidity as BigNumberish)) : JSBI.BigInt('0x0')

      if (!liquidityHex || !sqrtPriceHex || !token0) return [PoolState.NOT_EXISTS, null]
      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceHex, liquidityHex, tickCurrent)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [results])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}

export function usePoolAddress(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): string | undefined {
  const { chainId } = useAccountDetails()
  return useMemo(() => {
    if (currencyA && currencyB && feeAmount && chainId) {
      const tokenA = currencyA.wrapped
      const tokenB = currencyB.wrapped
      if (tokenA.equals(tokenB)) return undefined
      const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

      //compute pool contract address
      const { calculateContractAddressFromHash } = hash

      const salt = ec.starkCurve.poseidonHashMany([
        BigInt(tokens[0].address),
        BigInt(tokens[1].address),
        BigInt(feeAmount),
      ])

      const contructorCalldata = CallData.compile([tokens[0].address, tokens[1].address, feeAmount, feeAmount / 50])

      return tokenA && tokenB && !tokenA.equals(tokenB)
        ? calculateContractAddressFromHash(salt, POOL_CLASS_HASH[chainId], contructorCalldata, FACTORY_ADDRESS[chainId])
        : undefined
    }

    return undefined
  }, [currencyA, currencyB, feeAmount, chainId])
}
