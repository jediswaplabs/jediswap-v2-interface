import { lazy, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { isBrowserRouterEnabled } from 'utils/env';
import PoolDetails from './PoolDetails';
import Swap from './Swap';
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects';

const AddLiquidity = lazy(() => import('pages/AddLiquidity'));

const RedirectDuplicateTokenIds = lazy(() => import('pages/AddLiquidity/redirects'));

const Pool = lazy(() => import('pages/Pool'));
const PositionPage = lazy(() => import('pages/Pool/PositionPage'));
const RemoveLiquidityV3 = lazy(() => import('pages/RemoveLiquidity/V3'));

interface RouterConfig {
  browserRouterEnabled?: boolean
  hash?: string
}

/**
 * Convenience hook which organizes the router configuration into a single object.
 */
export function useRouterConfig(): RouterConfig {
  const browserRouterEnabled = isBrowserRouterEnabled();
  const { hash } = useLocation();
  return useMemo(
    () => ({
      browserRouterEnabled,
      hash,
    }),
    [browserRouterEnabled, hash],
  );
}

export interface RouteDefinition {
  path: string
  nestedPaths: string[]
  // eslint-disable-next-line no-unused-vars
  enabled: (args: RouterConfig) => boolean
  // eslint-disable-next-line no-unused-vars
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
  };
}

export const routes: RouteDefinition[] = [
  createRouteDefinition({ path: '/swap', getElement: () => <Swap /> }),
  createRouteDefinition({ path: '/swap/:outputCurrency', getElement: () => <RedirectToSwap /> }),
  createRouteDefinition({ path: '/pool', getElement: () => <Pool /> }),
  createRouteDefinition({ path: '/pool/:tokenId', getElement: () => <PositionPage /> }),
  createRouteDefinition({ path: '/pools', getElement: () => <Pool /> }),
  createRouteDefinition({ path: '/pools/:tokenId', getElement: () => <PositionPage /> }),

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
  createRouteDefinition({ path: '/remove/:tokenId', getElement: () => <RemoveLiquidityV3 /> }),
  createRouteDefinition({ path: '/expore/pools/:poolId', getElement: () =>  <PoolDetails />}),
  // @ts-ignore
  createRouteDefinition({ path: '*', getElement: () => <RedirectPathToSwapOnly /> }),
];
