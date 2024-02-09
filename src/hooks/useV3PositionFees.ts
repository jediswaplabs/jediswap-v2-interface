import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { Pool, Position } from '@vnaysn/jediswap-sdk-v3'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { unwrappedToken } from 'utils/unwrappedToken'
import { useBlockNumber as uBlockNumber, useContract, useContractRead } from '@starknet-react/core'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'
import { useV3NFTPositionManagerContract } from './useContract'
import { DEFAULT_CHAIN_ID, MAX_UINT128, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import {
  BigNumberish,
  CallData,
  RpcProvider,
  TransactionType,
  WeierstrassSignatureType,
  cairo,
  ec,
  hash,
  validateAndParseAddress,
} from 'starknet'
import POOL_ABI from 'contracts/pool/abi.json'
import { toI32 } from 'utils/toI32'
import { useAccountDetails } from './starknet-react'
import { useQuery } from 'react-query'

const provider = new RpcProvider({
  nodeUrl: 'https://starknet-testnet.public.blastapi.io/rpc/v0_6',
})

// compute current + counterfactual fees for a v3 position
export function useV3PositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWETH = false
): [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined] {
  const positionManager = useV3NFTPositionManagerContract(false)
  const owner: string | undefined = useSingleCallResult(tokenId ? positionManager : null, 'ownerOf', [tokenId])
    .result?.[0]

  const tokenIdHexString = tokenId?.toHexString()
  const latestBlockNumber = useBlockNumber()
  const { data: blockNumber } = uBlockNumber({
    refetchInterval: false,
  })

  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>()
  useEffect(() => {
    ;(async function getFees() {
      if (positionManager && tokenIdHexString && owner) {
        try {
          const results = await positionManager.callStatic.collect(
            {
              tokenId: tokenIdHexString,
              recipient: owner, // some tokens might fail if transferred to address(0)
              amount0Max: MAX_UINT128,
              amount1Max: MAX_UINT128,
            },
            { from: owner } // need to simulate the call as the owner
          )
          setAmounts([results.amount0, results.amount1])
        } catch {
          // If the static call fails, the default state will remain for `amounts`.
          // This case is handled by returning unclaimed fees as empty.
          // TODO(WEB-2283): Look into why we have failures with call data being 0x.
        }
      }
    })()
  }, [positionManager, tokenIdHexString, owner, latestBlockNumber])

  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(asWETH ? pool.token0 : unwrappedToken(pool.token0), amounts[0].toString()),
      CurrencyAmount.fromRawAmount(asWETH ? pool.token1 : unwrappedToken(pool.token1), amounts[1].toString()),
    ]
  } else {
    return [undefined, undefined]
  }
}

export const usePositionOwner = (tokenId: number) => {
  const { chainId } = useAccountDetails()
  const {
    data: ownerOf,
    isLoading,
    error,
  } = useContractRead({
    functionName: 'owner_of',
    args: [cairo.uint256(tokenId)],
    abi: NFTPositionManagerABI,
    address: NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID],
    watch: true,
  })
  return { ownerOf: ownerOf ? validateAndParseAddress(ownerOf.toString()) : undefined, isLoading, error }
}

export const useStaticFeeResults = (
  poolAddress: string,
  owner: string,
  position: Position,
  asWETH: false,
  parsedTokenId: number
) => {
  const { account, address, connector, chainId } = useAccountDetails()

  const privateKey = '0x1234567890987654321'

  const message: BigNumberish[] = [1, 128, 18, 14]

  const msgHash = hash.computeHashOnElements(message)
  const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey)

  const collectSelector = useMemo(() => {
    if (!chainId) return
    return {
      contract_address: NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId],
      selector: hash.getSelectorFromName('collect'),
    }
  }, [chainId])

  const totalTx = {
    totalTx: '0x1',
  }
  const collect_call_data_length = { approve_call_data_length: '0x05' }

  const nonce_results = useQuery({
    queryKey: [`nonce/${poolAddress}/${parsedTokenId}/${account?.address}`],
    queryFn: async () => {
      if (!account) return
      const results = await account?.getNonce()
      return cairo.felt(results.toString())
    },
    onSuccess: (data) => {
      // Handle the successful data fetching here if needed
    },
  })

  const fee_results = useQuery({
    queryKey: [`fee/${address}/${nonce_results.data}/${parsedTokenId}`],
    queryFn: async () => {
      if (!account || !address || !nonce_results || !parsedTokenId || !connector || !collectSelector) return
      const nonce_data = nonce_results.data
      if (!nonce_data) return undefined
      const nonce = Number(nonce_data)
      const isConnectorBraavos = connector.id === 'braavos'

      const collect_call_data = {
        tokenId: cairo.uint256(parsedTokenId),
        recipient: address,
        amount0_max: MAX_UINT128,
        amount1_max: MAX_UINT128,
      }
      const payload = isConnectorBraavos
        ? {
            contractAddress: address,
            calldata: CallData.compile({
              ...totalTx,
              ...collectSelector,
              ...{ collect_offset: '0x0' },
              ...collect_call_data_length,
              ...{ total_call_data_length: '0x5' },
              ...collect_call_data,
            }),
          }
        : {
            contractAddress: address,
            calldata: CallData.compile({
              ...totalTx,
              ...collectSelector,
              ...collect_call_data_length,
              ...collect_call_data,
            }),
          }

      // const compiledCall = CallData.
      const response = await provider.simulateTransaction(
        [
          {
            type: TransactionType.INVOKE,
            ...payload,
            signature,
            nonce,
          },
        ],
        {
          skipValidate: true,
        }
      )

      // return response

      const typedResponse: any = response

      const tx_response: any = typedResponse
        ? typedResponse[0]?.transaction_trace.execute_invocation?.result
        : undefined

      return tx_response
    },
  })

  if (fee_results && fee_results.data) {
    const results: string[] = fee_results.data
    if (results) {
      return [
        CurrencyAmount.fromRawAmount(
          asWETH ? position.pool.token0 : unwrappedToken(position.pool.token0),
          results[results.length - 2].toString()
        ),
        CurrencyAmount.fromRawAmount(
          asWETH ? position.pool.token1 : unwrappedToken(position.pool.token1),
          results[results.length - 1].toString()
        ),
      ]
    } else return [undefined, undefined]
  } else {
    return [undefined, undefined]
  }
}
