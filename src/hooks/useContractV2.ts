import { useContract, useContractWrite } from '@starknet-react/core'
import { ROUTER_ABI } from 'constants/contracts/routerAddress'
import { Contract } from 'starknet'
import { useAccountDetails } from './starknet-react'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'
import { ROUTER_ADDRESS } from 'constants/index'

export function useRouterContract(): Contract | undefined {
  const { chainId } = useAccountDetails()
  const { contract } = useContract({
    abi: ROUTER_ABI,
    address: '0x0737dddce39dd75ae74b0d27fbc985bdba9b5100521199e6725af6e3cbe2f692',
  })

  return contract
}
