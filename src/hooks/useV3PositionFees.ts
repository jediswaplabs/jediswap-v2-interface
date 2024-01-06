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
import { MAX_UINT128, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { CallData, cairo, validateAndParseAddress } from 'starknet'
import POOL_ABI from 'contracts/pool/abi.json'
import { toI32 } from 'utils/toI32'
import { useAccountDetails } from './starknet-react'

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
  const {
    data: ownerOf,
    isLoading,
    error,
  } = useContractRead({
    functionName: 'owner_of',
    args: [cairo.uint256(tokenId)],
    abi: NFTPositionManagerABI,
    address: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
    watch: true,
  })
  return { ownerOf: ownerOf ? validateAndParseAddress(ownerOf.toString()) : undefined, isLoading, error }
}

export const useStaticFeeResults = (poolAddress: string, owner: string, position: Position, asWETH: false) => {
  const callData = {
    owner,
    tick_lower: toI32(position.tickLower),
    tick_upper: toI32(position.tickUpper),
    amount0_requested: MAX_UINT128,
    amount1_requested: MAX_UINT128,
  }
  position.pool.token0

  const compiledData = CallData.compile(callData)

  const { data } = useContractRead({
    functionName: 'static_collect',
    args: [compiledData],
    abi: POOL_ABI,
    address: poolAddress,
    watch: true,
  })

  if (data) {
    const dataObj = data as any
    return [
      CurrencyAmount.fromRawAmount(
        asWETH ? position.pool.token0 : unwrappedToken(position.pool.token0),
        dataObj[0].toString()
      ),
      CurrencyAmount.fromRawAmount(
        asWETH ? position.pool.token1 : unwrappedToken(position.pool.token1),
        dataObj[1].toString()
      ),
    ]
  } else {
    return [undefined, undefined]
  }
}
