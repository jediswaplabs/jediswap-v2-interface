import { BigNumber } from '@ethersproject/bignumber'
import JSBI from 'jsbi'
import { NEVER_RELOAD, useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'
import { useV3NFTPositionManagerContract } from './useContract'
import { useContractRead } from '@starknet-react/core'
import { NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { cairo, encode, num } from 'starknet'

type TokenId = number | JSBI | BigNumber

const STARTS_WITH = 'data:application/json;base64,'

type UsePositionTokenURIResult =
  | {
      valid: true
      loading: false
      result: {
        name: string
        description: string
        image: string
      }
    }
  | {
      valid: false
      loading: false
    }
  | {
      valid: true
      loading: true
    }

export function usePositionTokenURI(tokenId: TokenId | undefined): UsePositionTokenURIResult {
  const contract = useV3NFTPositionManagerContract()
  const inputs = useMemo(
    () => [tokenId instanceof BigNumber ? tokenId.toHexString() : tokenId?.toString(16)],
    [tokenId]
  )
  const { result, error, loading, valid } = useSingleCallResult(contract, 'tokenURI', inputs, {
    ...NEVER_RELOAD,
    gasRequired: 3_000_000,
  })

  return useMemo(() => {
    if (error || !valid || !tokenId) {
      return {
        valid: false,
        loading: false,
      }
    }
    if (loading) {
      return {
        valid: true,
        loading: true,
      }
    }
    if (!result) {
      return {
        valid: false,
        loading: false,
      }
    }
    const [tokenURI] = result as [string]
    if (!tokenURI || !tokenURI.startsWith(STARTS_WITH))
      return {
        valid: false,
        loading: false,
      }

    try {
      const json = JSON.parse(atob(tokenURI.slice(STARTS_WITH.length)))

      return {
        valid: true,
        loading: false,
        result: json,
      }
    } catch (error) {
      return { valid: false, loading: false }
    }
  }, [error, loading, result, tokenId, valid])
}

const feltArrToStr = (felts: bigint[]): string | undefined => {
  if (!felts || !felts.length) return undefined
  return felts.reduce((memo, felt) => memo + Buffer.from(felt.toString(16), 'hex').toString(), '')
}

const useTokenURI = (tokenId: number) => {
  const { data, error, isLoading } = useContractRead({
    functionName: 'token_uri',
    args: [cairo.uint256(tokenId)],
    abi: NFTPositionManagerABI,
    address: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
    watch: true,
  })
  return { metadata: data, error, isLoading }
}

export function useV3PositionTokenURI(tokenId: number) {
  const { metadata, error, isLoading } = useTokenURI(tokenId)
  const metadataArray: bigint[] = Array.isArray(metadata) ? metadata : []
  const slicedMetaData: bigint[] = metadataArray.slice(1)
  return useMemo(() => {
    if (error || !tokenId) {
      return {
        loading: false,
        error,
      }
    }
    if (isLoading) {
      return {
        loading: true,
      }
    }
    if (!slicedMetaData) {
      return {
        loading: false,
      }
    }

    try {
      const result = feltArrToStr(slicedMetaData as any)

      if (typeof result === 'string') {
        const json = JSON.parse(result)
        return {
          loading: false,
          result: json,
        }
      } else {
        // Handle the case where result is not a string (possibly undefined)
        return {
          loading: false,
          error: new Error('Invalid result'),
        }
      }
    } catch (error) {
      return { loading: false, error }
    }
  }, [metadata, error, isLoading, tokenId])
}
