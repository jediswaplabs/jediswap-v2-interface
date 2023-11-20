import { Currency } from '@jediswap/sdk'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
// import { useCombinedActiveList } from 'state/lists/hooks'

/** Returns a WrappedTokenInfo from the active token lists when possible, or the passed token otherwise. */
export function useTokenInfoFromActiveList(currency: Currency) {
  const { chainId } = useWeb3React()
  const activeList = {}

  return useMemo(() => {
    return Currency
  }, [activeList, chainId, currency])
}
