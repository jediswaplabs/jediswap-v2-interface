import { useAccountDetails } from 'hooks/starknet-react'
import { RouteResponse, UpdatedGenieAsset } from 'nft/types'
import { useCallback } from 'react'

import { useBag } from './useBag'
import { useSendTransaction } from './useSendTransaction'
import { useTransactionResponse } from './useTransactionResponse'
import { useProvider } from '@starknet-react/core'

export function usePurchaseAssets(): (
  routingData: RouteResponse,
  assetsToBuy: UpdatedGenieAsset[],
  purchasingWithErc20?: boolean
) => Promise<void> {
  const { provider } = useProvider()
  const sendTransaction = useSendTransaction((state) => state.sendTransaction)
  const setTransactionResponse = useTransactionResponse((state) => state.setTransactionResponse)

  const {
    setLocked: setBagLocked,
    setBagExpanded,
    reset: resetBag,
  } = useBag(({ setLocked, setBagExpanded, reset }) => ({
    setLocked,
    setBagExpanded,
    reset,
  }))

  return useCallback(
    async (routingData: RouteResponse, assetsToBuy: UpdatedGenieAsset[], purchasingWithErc20 = false) => {
      if (!provider) return

      // const purchaseResponse = await sendTransaction(
      //   provider.getSigner(),
      //   assetsToBuy,
      //   routingData,
      //   purchasingWithErc20
      // )

      // if (purchaseResponse) {
      //   setBagLocked(false)
      //   setTransactionResponse(purchaseResponse)
      //   setBagExpanded({ bagExpanded: false })
      //   resetBag()
      // }
    },
    [provider, resetBag, sendTransaction, setBagExpanded, setBagLocked, setTransactionResponse]
  )
}
