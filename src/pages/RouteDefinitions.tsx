import { useInfoExplorePageEnabled } from 'featureFlags/flags/infoExplore'
import { useInfoPoolPageEnabled } from 'featureFlags/flags/infoPoolPage'
import { useAtom } from 'jotai'
import { lazy, ReactNode, Suspense, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'
import { SpinnerSVG } from 'theme/components'
import { isBrowserRouterEnabled } from 'utils/env'

import Swap from './Swap'
import {RedirectPathToSwapOnly, RedirectToSwap} from "./Swap/redirects";


const AddLiquidity = lazy(() => import('pages/AddLiquidity'))
const RedirectDuplicateTokenIds = lazy(() => import('pages/AddLiquidity/redirects'))
const RedirectDuplicateTokenIdsV2 = lazy(() => import('pages/AddLiquidityV2/redirects'))
const NotFound = lazy(() => import('pages/NotFound'))
const Pool = lazy(() => import('pages/Pool'))
const PositionPage = lazy(() => import('pages/Pool/PositionPage'))
const RemoveLiquidity = lazy(() => import('pages/RemoveLiquidity'))
const RemoveLiquidityV3 = lazy(() => import('pages/RemoveLiquidity/V3'))

// this is the same svg defined in assets/images/blue-loader.svg
// it is defined here because the remote asset may not have had time to load when this file is executing
const LazyLoadSpinner = () => (
  <SpinnerSVG width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M92 47C92 22.1472 71.8528 2 47 2C22.1472 2 2 22.1472 2 47C2 71.8528 22.1472 92 47 92"
      stroke="#2172E5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SpinnerSVG>
)

interface RouterConfig {
  browserRouterEnabled?: boolean
  hash?: string
  infoExplorePageEnabled?: boolean
  infoPoolPageEnabled?: boolean
  shouldDisableNFTRoutes?: boolean
}

/**
 * Convenience hook which organizes the router configuration into a single object.
 */
export function useRouterConfig(): RouterConfig {
  const browserRouterEnabled = isBrowserRouterEnabled()
  const { hash } = useLocation()
  return useMemo(
    () => ({
      browserRouterEnabled,
      hash,
    }),
    [browserRouterEnabled, hash]
  )
}

export interface RouteDefinition {
  path: string
  nestedPaths: string[]
  enabled: (args: RouterConfig) => boolean
  getElement: (args: RouterConfig) => ReactNode
}

// Assigns the defaults to the route definition.
function createRouteDefinition(route: Partial<RouteDefinition>): RouteDefinition {
  return {
    getElement: () => null,
    enabled: () => true,
    path: '/',
    nestedPaths: [],
    // overwrite the defaults
    ...route,
  }
}

export const routes: RouteDefinition[] = [
  createRouteDefinition({ path: '/swap', getElement: () => <Swap /> }),
  createRouteDefinition({ path: '/swap/:outputCurrency', getElement: () => <RedirectToSwap /> }),
  createRouteDefinition({ path: '/pool', getElement: () => <Pool /> }),
  // <Route exact path="/zap" component={Zap} />

  createRouteDefinition({ path: '/pools/:tokenId', getElement: () => <PositionPage /> }),
  createRouteDefinition({
    path: '/add/v2',
    nestedPaths: [':currencyIdA', ':currencyIdA/:currencyIdB'],
    getElement: () => <RedirectDuplicateTokenIdsV2 />,
  }),
  createRouteDefinition({
    path: '/add',
    nestedPaths: [':currencyIdA', ':currencyIdA/:currencyIdB', ':currencyIdA/:currencyIdB/:feeAmount'],
    getElement: () => <RedirectDuplicateTokenIds />,
  }),

  createRouteDefinition({
    path: '/increase',
    nestedPaths: [
      ':currencyIdA',
      ':currencyIdA/:currencyIdB',
      ':currencyIdA/:currencyIdB/:feeAmount',
      ':currencyIdA/:currencyIdB/:feeAmount/:tokenId',
    ],
    getElement: () => <AddLiquidity />,
  }),
  createRouteDefinition({ path: '/remove/v2/:currencyIdA/:currencyIdB', getElement: () => <RemoveLiquidity /> }),
  createRouteDefinition({ path: '/remove/:tokenId', getElement: () => <RemoveLiquidityV3 /> }),
  createRouteDefinition({ path: '*', getElement: () => <RedirectPathToSwapOnly /> }),
]
