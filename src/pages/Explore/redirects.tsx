import { Navigate, useParams } from 'react-router-dom';

import Explore, { ExploreTab } from '.';

// useParams struggles to distinguish between /explore/:chainId and /explore/:tab
export function useExploreParams(): {
    tab?: ExploreTab
    chainName?: string
    tokenAddress?: string
    } {
  const { tab, chainName, tokenAddress } = useParams<{ tab: string; chainName: string; tokenAddress: string }>();
  const exploreTabs = Object.values(ExploreTab);
  if (tab && !chainName && exploreTabs.includes(tab as ExploreTab)) {
    // /explore/:tab
    return { tab: tab as ExploreTab, chainName: undefined, tokenAddress };
  } if (tab && !chainName) {
    // /explore/:chainName
    return { tab: ExploreTab.Tokens, chainName: tab, tokenAddress };
  } if (!tab && !chainName) {
    // legacy /tokens
    return { tab: ExploreTab.Tokens, chainName: undefined, tokenAddress: undefined };
  }
  // /explore/:tab/:chainName
  return { tab: tab as ExploreTab, chainName, tokenAddress };
}

export default function RedirectExplore() {
  const { tab, chainName, tokenAddress } = useExploreParams();
  if (tab && chainName && tokenAddress) {
    return <Navigate to={`/explore/${tab}/${chainName}/${tokenAddress}`} replace />;
  } if (chainName && tokenAddress) {
    return <Navigate to={`/explore/tokens/${chainName}/${tokenAddress}`} replace />;
  } if (tab && chainName) {
    return <Navigate to={`/explore/${tab}/${chainName}`} replace />;
  } if (chainName) {
    return <Navigate to={`/explore/tokens/${chainName}`} replace />;
  }
  return <Explore initialTab={tab as ExploreTab} />;
}
