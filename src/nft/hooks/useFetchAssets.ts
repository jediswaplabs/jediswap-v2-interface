import { useAccountDetails } from 'hooks/starknet-react'
import { useCallback, useMemo } from 'react'

import { useNftRouteLazyQuery } from 'graphql/data/types-and-hooks'
import { BagStatus } from 'nft/types'
import { buildNftTradeInputFromBagItems, recalculateBagUsingPooledAssets } from 'nft/utils'
import { getNextBagState, getPurchasableAssets } from 'nft/utils/bag'
import { buildRouteResponse } from 'nft/utils/nftRoute'
import { useBag } from './useBag'
import { usePurchaseAssets } from './usePurchaseAssets'
import { useTokenInput } from './useTokenInput'

export function useFetchAssets(): () => Promise<void> {
  const { address: account } = useAccountDetails()

  const {
    itemsInBag: uncheckedItemsInBag,
    setBagStatus,
    didOpenUnavailableAssets,
    setDidOpenUnavailableAssets,
    isLocked: bagIsLocked,
    setLocked: setBagLocked,
    setItemsInBag,
  } = useBag(
    ({
      itemsInBag,
      setBagStatus,
      didOpenUnavailableAssets,
      setDidOpenUnavailableAssets,
      isLocked,
      setLocked,
      setItemsInBag,
    }) => ({
      itemsInBag,
      setBagStatus,
      didOpenUnavailableAssets,
      setDidOpenUnavailableAssets,
      isLocked,
      setLocked,
      setItemsInBag,
    })
  )
  const tokenTradeInput = useTokenInput((state) => state.tokenTradeInput)
  const itemsInBag = useMemo(() => recalculateBagUsingPooledAssets(uncheckedItemsInBag), [uncheckedItemsInBag])

  const [fetchGqlRoute] = useNftRouteLazyQuery()
  const purchaseAssets = usePurchaseAssets()

  const resetStateBeforeFetch = useCallback(() => {
    didOpenUnavailableAssets && setDidOpenUnavailableAssets(false)
    !bagIsLocked && setBagLocked(true)
    setBagStatus(BagStatus.FETCHING_ROUTE)
  }, [bagIsLocked, didOpenUnavailableAssets, setBagLocked, setBagStatus, setDidOpenUnavailableAssets])

  return useCallback(async () => {
    resetStateBeforeFetch()

    fetchGqlRoute({
      variables: {
        senderAddress: account || '',
        nftTrades: buildNftTradeInputFromBagItems(itemsInBag),
        tokenTrades: tokenTradeInput || undefined,
      },
      onCompleted: (data) => {
        if (!data.nftRoute || !data.nftRoute.route) {
          setBagStatus(BagStatus.ADDING_TO_BAG)
          setBagLocked(false)
          return
        }

        const wishAssetsToBuy = getPurchasableAssets(itemsInBag)
        const purchasingWithErc20 = !!tokenTradeInput
        const { route, routeResponse } = buildRouteResponse(data.nftRoute, purchasingWithErc20)

        const { newBagItems, nextBagStatus } = getNextBagState(wishAssetsToBuy, route, purchasingWithErc20)

        setItemsInBag(newBagItems)
        setBagStatus(nextBagStatus)

        if (nextBagStatus === BagStatus.CONFIRMING_IN_WALLET) {
          purchaseAssets(routeResponse, wishAssetsToBuy, purchasingWithErc20)
          setBagLocked(true)
          return
        }

        setBagLocked(false)
      },
    })
  }, [
    account,
    fetchGqlRoute,
    itemsInBag,
    purchaseAssets,
    resetStateBeforeFetch,
    setBagLocked,
    setBagStatus,
    setItemsInBag,
    tokenTradeInput,
  ])
}
