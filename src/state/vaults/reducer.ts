// @ts-nocheck
// @ts-ignore

import { createSlice } from '@reduxjs/toolkit'
import { ChainId, Token } from '@vnaysn/jediswap-sdk-core'
import { Field } from './actions'

interface URLs {
  asset0Icon: string
  asset1Icon: string
  shareIcon: string
}
interface Links {
  details: string
  fee: string
}

interface Share {
  address: string
  decimals: number
  icon: string
  symbol: string
}

interface PromotionInfo {
  // Define properties if known, otherwise use an empty object type
  [key: string]: any
}

interface Provider {
  name: string
  logo: string
}

export type Vault = {
  token0: Token
  token1: Token
  chain: string
  chainId: string
  decimals: number | null
  defaultSlippage: string
  details: string
  feeTier: string
  forceGasPrice: boolean
  isActive: boolean
  isAsset0Main: boolean
  isDeFi: boolean
  links: Links
  lpStrategyGraph: string
  mainAssetKey: string
  name: string
  poolAddress: string
  positionGraph: string
  protocol: string
  provider: Provider
  riskLevel: string
  share: Share
  strategyType: string
  type: string
  performance: any
}

type Vaults = {
  [key: string]: Vault
}
export interface VaultState {
  // readonly allVaults: Vault[]
  readonly allVaults: Vaults
  readonly users: any
  readonly independentField: Field
  readonly typedValue: string
  readonly withdrawTypedValue: string
  readonly chainId: ChainId | null
}
export const initialState: VaultState = {
  allVaults: null,
  users: {},
  independentField: Field.CURRENCY_A,
  typedValue: '',
  withdrawTypedValue: '',
  chainId: null,
}

const vaultsSlice = createSlice({
  name: 'vaults',
  initialState,
  reducers: {
    updateAllVaults(state, { payload }) {
      state.allVaults = payload
    },
    updateUserVaults(state, { payload }) {
      if (!payload?.account) {
        return
      }
      state.users[payload.account] = payload.vaults
    },
    updateInput(state, { payload: { field, typedValue } }) {
      state.typedValue = typedValue
      state.independentField = field
    },
    updateWithdrawInput(state, { payload: { typedValue } }) {
      state.withdrawTypedValue = typedValue
    },
    updateChainId(state, { payload }) {
      state.chainId = payload
    },
  },
})

export const { updateAllVaults, updateUserVaults, updateInput, updateWithdrawInput, updateChainId } =
  vaultsSlice.actions

export default vaultsSlice.reducer
