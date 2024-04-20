import { BigNumber } from '@ethersproject/bignumber'
import JSBI from 'jsbi'
import { NEVER_RELOAD, useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'
import { useV3NFTPositionManagerContract } from './useContract'
import { useContractRead } from '@starknet-react/core'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { cairo, CallData, encode, num } from 'starknet'
import { useAccountDetails } from './starknet-react'
import { useQuery } from 'react-query'
import { providerInstance } from 'utils/getLibrary'

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

export const feltArrToStr = (felts: bigint[]): string | undefined => {
  if (!felts || !felts.length) return undefined
  return felts.reduce((memo, felt) => memo + Buffer.from(felt.toString(16), 'hex').toString(), '')
}

const useTokenURI = (tokenId: number) => {
  const { chainId } = useAccountDetails()
  const metadata = useQuery({
    queryKey: [`get_metadata/${chainId}`],
    queryFn: async () => {
      if (!chainId) return
      const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
      const contract_address = NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID]
      const results = await provider.callContract({
        entrypoint: 'token_uri',
        contractAddress: contract_address,
        calldata: CallData.compile({
          tokenId: cairo.uint256(tokenId),
        }),
      })
      return results?.result
    },
  })

  return useMemo(() => {
    if (!metadata.data || !Array.isArray(metadata.data))
      return { metadata: [], isLoading: metadata.isLoading, error: metadata.error }
    else return { metadata: metadata.data, isLoading: metadata.isLoading, error: metadata.error }
  }, [metadata])
}

export function useV3PositionTokenURI(tokenId: number) {
  const { metadata, error, isLoading } = useTokenURI(tokenId)
  const metadataArray = Array.isArray(metadata) ? metadata : []
  const metaDataStrToFelt: bigint[] = metadataArray.map((meta) => num.toBigInt(meta))
  const slicedMetaData: bigint[] = metaDataStrToFelt.slice(1, -1)
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
      const result = feltArrToStr(slicedMetaData as any) ?? ''
      const jsonStartIndex = result.indexOf('{')
      const jsonString = result.slice(jsonStartIndex)
      if (typeof jsonString === 'string') {
        const json = JSON.parse(jsonString)
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
