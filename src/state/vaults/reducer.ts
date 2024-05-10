// @ts-nocheck
// @ts-ignore

import { createSlice } from '@reduxjs/toolkit'
import { Field } from './actions'

export interface VaultState {
  readonly allVaults: any
  readonly users: any
  readonly independentField: Field
  readonly typedValue: string
}
export const initialState: VaultState = {
  allVaults: null,
  users: {},
  independentField: Field.CURRENCY_A,
  typedValue: '',
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
  },
})

export const { updateAllVaults, updateUserVaults, updateInput } = vaultsSlice.actions

export default vaultsSlice.reducer
