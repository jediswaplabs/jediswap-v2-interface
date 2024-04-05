// @ts-nocheck
// @ts-ignore

import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
  allVaults: null,
  users: {}
}

const vaultsSlice = createSlice({
    name: 'vaults',
    initialState,
    reducers: {
        updateAllVaults(state, {payload}) {
            state.allVaults = payload;
        },
        updateUserVaults(state, {payload}) {
            if (!payload?.account) { return }
            state.users[payload.account] = payload.vaults
        },
    },
})

export const {
    updateAllVaults,
    updateUserVaults
} = vaultsSlice.actions

export default vaultsSlice.reducer
