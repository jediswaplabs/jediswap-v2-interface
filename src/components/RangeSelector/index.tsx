import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@jediswap/sdk'
import StepCounter from 'components/InputStepCounter/InputStepCounter'
import { AutoRow } from 'components/Row'
import { Bound } from 'state/mint/actions'
import { useAccountDetails } from 'hooks/starknet-react'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { FullRange } from 'state/mint/reducer'

// currencyA is the base token
export default function RangeSelector({
  leftPrice,
  rightPrice,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  currencyA,
  currencyB,
  feeAmount,
}: // ticksAtLimit,
{
  leftPrice: string
  rightPrice: string
  priceLower?: Price
  priceUpper?: Price
  getDecrementLower?: () => string
  getIncrementLower?: () => string
  getDecrementUpper?: () => string
  getIncrementUpper?: () => string
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  currencyA: Currency | undefined | null
  currencyB: Currency | undefined | null
  feeAmount?: number
  ticksAtLimit?: { [bound in Bound]?: boolean | undefined }
}) {
  const { chainId } = useAccountDetails()
  const tokenA = wrappedCurrency(currencyA, chainId)
  const tokenB = wrappedCurrency(currencyB, chainId)
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  return (
    <AutoRow gap="md">
      <StepCounter
        value={leftPrice}
        onUserInput={onLeftRangeInput}
        feeAmount={feeAmount}
        label={leftPrice ? `${currencyB?.symbol}` : '-'}
        title={<Trans>Low price</Trans>}
        tokenA={currencyA?.symbol}
        tokenB={currencyB?.symbol}
      />
      <StepCounter
        value={rightPrice}
        onUserInput={onRightRangeInput}
        feeAmount={feeAmount}
        label={rightPrice ? `${currencyB?.symbol}` : '-'}
        tokenA={currencyA?.symbol}
        tokenB={currencyB?.symbol}
        title={<Trans>High price</Trans>}
      />
    </AutoRow>
  )
}
