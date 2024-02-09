import { BigNumber } from '@ethersproject/bignumber'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { PositionDetails } from 'types/position'
import { useContractRead } from '@starknet-react/core'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { cairo } from 'starknet'
import { useV3NFTPositionManagerContract } from './useContract'
import { toInt } from 'utils/toInt'
import { useAccountDetails } from './starknet-react'

export interface TickType {
  mag: BigNumber
  sign: boolean
}

export interface FlattenedPositions {
  tokenId: number
  operator: string
  token0: string
  token1: string
  fee: number
  tick_lower: number
  tick_upper: number
  liquidity: BigNumber
  fee_growth_inside_0_last_X128: BigNumber
  fee_growth_inside_1_last_X128: BigNumber
  tokens_owed_0: BigNumber
  tokens_owed_1: BigNumber
}

interface UseV3Positions {
  loading: boolean
  error: any
  position?: FlattenedPositions
}

interface UseV3PositionsResults {
  loading: boolean
  positions?: PositionDetails[]
}

interface UseV3PositionsResult {
  loading: boolean
  position?: PositionDetails[]
}

const flattenedPositionsV3 = (positionsV3: FlattenedPositions): FlattenedPositions => {
  let flattened: any = {}

  for (const key in positionsV3) {
    const positionKey = key as keyof FlattenedPositions // Type assertion to keyof FlattenedPositions
    flattened = Object.assign(flattened, positionsV3[positionKey])
  }

  return flattened
}

const usePositionResults = (tokenId: number): UseV3Positions => {
  const { chainId } = useAccountDetails()

  const { data, isLoading, error } = useContractRead({
    functionName: 'get_position',
    args: [cairo.uint256(tokenId)],
    abi: NFTPositionManagerABI,
    address: NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID],
    watch: true,
  })

  const position = flattenedPositionsV3(data as any)
  return { position, loading: isLoading, error }
}

const usePositionsV3 = (tokenIds: number[]): UseV3Positions[] => {
  return tokenIds?.map((tokenId) => {
    return usePositionResults(tokenId)
  })
}

export function useV3PositionsFromTokenId(tokenIds: number[] | undefined, address: string | undefined) {
  const results = usePositionsV3(tokenIds ? tokenIds : [])
  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds?.length) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.position as FlattenedPositions
        const tick_lower = toInt(result?.tick_lower)
        const tick_upper = toInt(result?.tick_upper)
        return {
          tokenId,
          fee: Number(result?.fee),
          fee_growth_inside_0_last_X128: result?.fee_growth_inside_0_last_X128,
          fee_growth_inside_1_last_X128: result?.fee_growth_inside_1_last_X128,
          liquidity: BigNumber.from(result.liquidity),
          operator: result?.operator,
          tick_lower: tick_lower,
          tick_upper: tick_upper,
          token0: result?.token0,
          token1: result?.token1,
          tokens_owed_0: result?.tokens_owed_0,
          tokens_owed_1: result?.tokens_owed_1,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds, address])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: position.tokenId })),
  }
}

export function getV3PositionsFromTokenId(tokenIds: number[] | undefined) {
  const results = usePositionsV3(tokenIds ? tokenIds : [])
  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds?.length) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.position as FlattenedPositions
        const tick_lower = toInt(result?.tick_lower)
        const tick_upper = toInt(result?.tick_upper)
        return {
          tokenId,
          fee: Number(result?.fee),
          fee_growth_inside_0_last_X128: result?.fee_growth_inside_0_last_X128,
          fee_growth_inside_1_last_X128: result?.fee_growth_inside_1_last_X128,
          liquidity: BigNumber.from(result.liquidity),
          operator: result?.operator,
          tick_lower: tick_lower,
          tick_upper: tick_upper,
          token0: result?.token0,
          token1: result?.token1,
          tokens_owed_0: result?.tokens_owed_0,
          tokens_owed_1: result?.tokens_owed_1,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: position.tokenId })),
  }
}

function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  }
}

interface UseV3PositionResults {
  loading: boolean
  position?: PositionDetails
}

export function useV3PosFromTokenId(tokenId: number | undefined) {
  const { address } = useAccountDetails()
  const position = useV3PositionsFromTokenId(tokenId ? [tokenId] : undefined, address)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  }
}
