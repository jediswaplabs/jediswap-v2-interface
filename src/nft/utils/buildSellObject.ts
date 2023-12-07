import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { NftMarketplace, NftTradeInput, TokenAmountInput } from 'graphql/data/types-and-hooks'
import { BagItem, BagItemStatus, UpdatedGenieAsset } from 'nft/types'

export const buildNftTradeInputFromBagItems = (itemsInBag: BagItem[]): NftTradeInput[] => {
  const assetsToBuy = itemsInBag.filter((item) => item.status !== BagItemStatus.UNAVAILABLE).map((item) => item.asset)
  return buildNftTradeInput(assetsToBuy)
}

const buildNftTradeInput = (assets: UpdatedGenieAsset[]): NftTradeInput[] =>
  assets.flatMap((asset) => {
    const { id, address, marketplace, priceInfo, tokenId, tokenType } = asset

    if (!id || !marketplace) {
      return []
    }

    const ethAmountInput: TokenAmountInput = {
      amount: priceInfo.ETHPrice,
      token: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        chainId: ChainId.MAINNET,
        decimals: 18,
        isNative: true,
      },
    }

    return [
      {
        amount: 1,
        contractAddress: address,
        id,
        marketplace: marketplace.toUpperCase() as NftMarketplace,
        quotePrice: ethAmountInput,
        tokenId,
        tokenType,
      },
    ]
  })
