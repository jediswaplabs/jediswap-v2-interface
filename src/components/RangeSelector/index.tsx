import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@jediswap/sdk'
import StepCounter from 'components/InputStepCounter/InputStepCounter'
import { AutoRow } from 'components/Row'
import { Bound } from 'state/mint/actions'
import { useAccountDetails } from 'hooks/starknet-react'
import { wrappedCurrency } from 'utils/wrappedCurrency'

// currencyA is the base token
export default function RangeSelector({
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  currencyA,
  currencyB,
  feeAmount,
}: // ticksAtLimit,
{
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

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  return (
    <AutoRow gap="md">
      <StepCounter
        value={'0'}
        onUserInput={onLeftRangeInput}
        feeAmount={feeAmount}
        label={leftPrice ? `${currencyB?.symbol}` : '-'}
        title={<Trans>Low price</Trans>}
        tokenA={currencyA?.symbol}
        tokenB={currencyB?.symbol}
      />
      <StepCounter
        value={'0'}
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
