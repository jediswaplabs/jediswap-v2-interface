import { Currency } from '@vnaysn/jediswap-sdk-core'
import {} from '@uniswap/token-lists'

import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: Currency
  }
) {
  return (
    <AssetLogo
      isNative={props.currency?.isNative}
      chainId={props.currency?.chainId}
      address={props.currency?.wrapped?.address}
      symbol={props.symbol ?? props.currency?.symbol}
      // backupImg={(props.currency as Token)?.logoURI}
      {...props}
    />
  )
}
