// import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { computePoolAddress } from '@vnaysn/jediswap-sdk-v3'
import { FeeAmount, Pool } from '@vnaysn/jediswap-sdk-v3'
import { useAccountDetails } from 'hooks/starknet-react'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useAllPairs } from 'state/pairs/hooks'
import { CallData, ec, hash, num, validateAndParseAddress } from 'starknet'
import { useContractRead } from '@starknet-react/core'
import POOL_ABI from 'contracts/pool/abi.json'
import { DEFAULT_POOL_ADDRESS, DEFAULT_POOL_HASH, FACTORY_ADDRESS } from 'constants/tokens'

// const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi) as IUniswapV3PoolStateInterface

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
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
  const { chainId, address } = useAccountDetails()

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

  const pairAddresses: (string | undefined)[] = useMemo(
    () =>
      poolTokens.map((tokens): string | undefined => {
        if (tokens && tokens[0] && tokens[1] && tokens[2]) {
          // Check if tokens are defined
          const [tokenA, tokenB, feeAmount] = tokens

          //compute contract address

          const { calculateContractAddressFromHash } = hash

          const salt = ec.starkCurve.poseidonHashMany([
            BigInt(tokens[0].address),
            BigInt(tokens[1].address),
            BigInt(feeAmount),
          ])

          const contructorCalldata = CallData.compile([tokens[0].address, tokens[1].address, feeAmount, 2])

          calculateContractAddressFromHash(salt, DEFAULT_POOL_HASH, contructorCalldata, FACTORY_ADDRESS)

          return tokenA && tokenB && !tokenA.equals(tokenB)
            ? calculateContractAddressFromHash(salt, DEFAULT_POOL_HASH, contructorCalldata, FACTORY_ADDRESS)
            : undefined
        }
        return undefined
      }),
    [poolTokens]
  )

  // if (!pairAddresses || !pairAddresses.length) return [PoolState.NOT_EXISTS, null]

  const {
    data: tick,
    isError,
    isLoading,
    error,
  } = useContractRead({
    functionName: 'get_tick',
    args: [],
    abi: POOL_ABI,
    address: DEFAULT_POOL_ADDRESS,
    watch: true,
  })

  const { data: liquid } = useContractRead({
    functionName: 'get_liquidity',
    args: [],
    abi: POOL_ABI,
    address: DEFAULT_POOL_ADDRESS,
    watch: true,
  })

  const { data: sqrtPriceX96 } = useContractRead({
    functionName: 'get_sqrt_price_X96',
    args: [],
    abi: POOL_ABI,
    address: DEFAULT_POOL_ADDRESS,
    watch: true,
  })

  const liquidity = JSBI.BigInt('0x78c95144121d6f5222f880')
  const sqrt = JSBI.BigInt('0x569d27eac14698dd7ad6117c')
  // const liquidity = JSBI.BigInt('253')
  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens

      // if(!slot) return [PoolState.INVALID, null]
      // if (!slot0s[index]) return [PoolState.INVALID, null]
      // const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]

      // if (!liquidities[index]) return [PoolState.INVALID, null]
      // const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      // if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      // if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]
      // if (!tick || !liquidity || !sqrtPriceX96) return [PoolState.NOT_EXISTS, null]
      // if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null]
      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrt, liquidity, -21676)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidity, poolKeys, tick, poolTokens])
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
