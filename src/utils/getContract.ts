import { Signer } from '@ethersproject/abstract-signer'
import { AddressZero } from '@ethersproject/constants'
import { Contract as ContractV2 } from '@ethersproject/contracts'
import { JsonRpcProvider, Provider } from '@ethersproject/providers'

import { isAddressValid } from './addresses'
import { Abi, AccountInterface, Contract } from 'starknet'
import { Connector } from '@starknet-react/core'
import { ZERO_ADDRESS } from 'constants/tokens'

export function getContract(address: string, ABI: any, provider: JsonRpcProvider, account?: string): ContractV2 {
  if (!isAddressValid(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new ContractV2(address, ABI, getProviderOrSigner(provider, account) as any)
}

export function getContractV2(
  address: string,
  ABI: any,
  library?: AccountInterface,
  connector?: Connector,
  account?: string
): Contract {
  const parsedAddress = isAddressValid(address)

  if (!parsedAddress || parsedAddress === ZERO_ADDRESS) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // const providerOrSigner = getProviderOrSigner(library, connector, account)

  return new Contract(ABI as Abi, address, library)
}

// account is optional
function getProviderOrSigner(provider: JsonRpcProvider, account?: string): Provider | Signer {
  return account ? provider.getSigner(account).connectUnchecked() : provider
}
