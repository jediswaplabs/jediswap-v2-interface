import { combineReducers } from '@reduxjs/toolkit'

import multicall from 'lib/state/multicall'
import { isDevelopmentEnv } from 'utils/env';
import application from './application/reducer'
import burn from './burn/reducer'
import burnV3 from './burn/v3/reducer'
import lists from './lists/reducer'
import logs from './logs/slice'
import mint from './mint/reducer'
import starkmulticall from './multicall/reducer'
import pairs from './pairs/reducer'
import mintV3 from './mint/v3/reducer'
import { quickRouteApi } from './routing/quickRouteSlice'
import { routingApi } from './routing/slice'
import signatures from './signatures/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import wallets from './wallets/reducer'

const appReducer = combineReducers({
  application,
  wallets,
  mint,
  mintV3,
  burn,
  burnV3,
  multicall: multicall.reducer,
  starkmulticall,
  logs,
  [routingApi.reducerPath]: routingApi.reducer,
  [quickRouteApi.reducerPath]: quickRouteApi.reducer,
  user,
  transactions,
  signatures,
  lists,
  pairs,
});

export type AppState = ReturnType<typeof appReducer>

export default appReducer;
