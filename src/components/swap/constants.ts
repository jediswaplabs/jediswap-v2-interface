import { LDO, USDT as USDT_MAINNET } from 'constants/tokens'

import { argentX, braavosWallet, argentWebWallet } from '../../connectors'
import ARGENTX_ICON from '../../assets/wallets/argentx.png'
import EMAIL_ICON from '../../assets/images/mail.png'
import BRAAVOS_ICON from '../../assets/wallets/Braavos.svg'
import { InjectedConnector } from '@starknet-react/core'

// List of tokens that require existing allowance to be reset before approving the new amount (mainnet only).
// See the `approve` function here: https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7#code
export const RESET_APPROVAL_TOKENS = [USDT_MAINNET, LDO]

export interface WalletInfo {
  connector?: InjectedConnector
  name: string
  icon: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
  size?: number
  id: string
  subHeader?: string
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  argentX: {
    connector: argentX,
    name: 'Argent-X',
    icon: ARGENTX_ICON,
    description: 'Starknet Browser Wallet',
    href: null,
    color: '#FF875B',
    mobile: true,
    id: 'argentX',
  },
  argentWebWallet: {
    connector: argentWebWallet,
    name: 'Continue with email',
    icon: EMAIL_ICON,
    description: 'Starknet Browser Wallet',
    href: null,
    color: '#FF875B',
    mobile: true,
    id: 'argentWebWallet',
    subHeader: 'Powered  by Argent',
  },
  braavos: {
    connector: braavosWallet,
    name: 'Braavos',
    icon: BRAAVOS_ICON,
    description: 'Braavos Wallet for Starknet',
    href: null,
    color: '#E0B137',
    size: 30,
    mobile: true,
    id: 'braavos',
  },
}
