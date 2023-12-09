import { ChainId } from '@vnaysn/jediswap-sdk-core'
import useHttpLocations from 'hooks/useHttpLocations'
import { useMemo } from 'react'
import { isAddressValidForStarknet } from 'utils/addresses'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import AvaxLogo from '../../assets/svg/avax_logo.svg'
import BnbLogo from '../../assets/svg/bnb-logo.svg'
import CeloLogo from '../../assets/svg/celo_logo.svg'
import MaticLogo from '../../assets/svg/matic-token-icon.svg'
import { isCelo, NATIVE_CHAIN_ID, nativeOnChain } from '../../constants/tokens'

type Network = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon' | 'smartchain' | 'celo' | 'avalanchec' | 'base'

export function chainIdToNetworkName(networkId: ChainId): Network {
  switch (networkId) {
    case ChainId.MAINNET:
      return 'ethereum'
    default:
      return 'ethereum'
  }
}

export function getNativeLogoURI(chainId: ChainId = ChainId.MAINNET): string {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return MaticLogo
    case ChainId.MAINNET:
      return BnbLogo
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return CeloLogo
    case ChainId.MAINNET:
      return AvaxLogo
    default:
      return EthereumLogo
  }
}

function getTokenLogoURI(address: string, chainId: ChainId = ChainId.MAINNET): string | void {
  const networkName = chainIdToNetworkName(chainId)
  const networksWithUrls = [
    ChainId.MAINNET,
    ChainId.MAINNET,
    ChainId.MAINNET,
    ChainId.MAINNET,
    ChainId.MAINNET,
    ChainId.MAINNET,
  ]
  // if (isCelo(chainId) && address === nativeOnChain(chainId).wrapped.address) {
  //   return CeloLogo
  // }

  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

export default function useCurrencyLogoURIs(
  currency:
    | {
        isNative?: boolean
        isToken?: boolean
        address?: string
        chainId: ChainId
        logoURI?: string | null
      }
    | null
    | undefined
): string[] {
  const locations = useHttpLocations(currency?.logoURI)
  return useMemo(() => {
    const logoURIs = [...locations]
    if (currency) {
      if (currency.isNative || currency.address === NATIVE_CHAIN_ID) {
        logoURIs.push(getNativeLogoURI(currency.chainId))
      } else if (currency.isToken || currency.address) {
        const checksummedAddress = isAddressValidForStarknet(currency.address)
        const logoURI = checksummedAddress && getTokenLogoURI(checksummedAddress, currency.chainId)
        if (logoURI) {
          logoURIs.push(logoURI)
        }
      }
    }
    return logoURIs
  }, [currency, locations])
}
