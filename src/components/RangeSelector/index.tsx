import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@vnaysn/jediswap-sdk-core'
import StepCounter from 'components/InputStepCounter/InputStepCounter'
import { AutoRow } from 'components/Row'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { Bound } from 'state/mint/v3/actions'

// currencyA is the base token
export default function RangeSelector({
  price,
  rangePercentage,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
}: {
  price: any
  rangePercentage: number | null
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  currencyA?: Currency | null
  currencyB?: Currency | null
  feeAmount?: number
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
}) {
  const tokenA = (currencyA ?? undefined)?.wrapped
  const tokenB = (currencyB ?? undefined)?.wrapped
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  const { leftPrice, rightPrice } = useMemo(() => {
    if (priceLower && priceUpper) {
      if (!rangePercentage) {
        const leftPrice = isSorted ? priceLower : priceUpper?.invert()
        const rightPrice = isSorted ? priceUpper : priceLower?.invert()
        return { leftPrice: leftPrice.toSignificant(8), rightPrice: rightPrice.toSignificant(8) }
      } else {
        const percentage = JSBI.BigInt(rangePercentage) // 20%
        const base = JSBI.BigInt(100) // 100 to represent the whole
        // Calculate the percentage value
        const percentageValue = JSBI.divide(JSBI.multiply(JSBI.BigInt(parseInt(price)), percentage), base)

        const leftPriceWithPercentage = JSBI.subtract(JSBI.BigInt(price), percentageValue)
        const rightPriceWithPercentage = JSBI.add(JSBI.BigInt(price), percentageValue)

        // Generate scaled random numbers directly
        const scaledDecimalForLeftPrice = Math.random() * 0.0001
        const scaledDecimalForRightPrice = Math.random() * 0.0001

        // Combine with the base number
        const leftPriceWithScaledPercentage = Number(leftPriceWithPercentage) - scaledDecimalForLeftPrice
        const rightPriceWithScaledPercentage = Number(rightPriceWithPercentage) + scaledDecimalForRightPrice
        return {
          leftPrice: leftPriceWithScaledPercentage.toString(),
          rightPrice: rightPriceWithScaledPercentage.toString(),
        }
      }
    }

    return { leftPrice: undefined, rightPrice: undefined }
  }, [priceLower, priceUpper, rangePercentage])

  return (
    <AutoRow gap="md">
      <StepCounter
        value={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] ? '0' : leftPrice ?? ''}
        onUserInput={onLeftRangeInput}
        feeAmount={feeAmount}
        label={leftPrice ? `${currencyB?.symbol}` : '-'}
        title={<Trans>Low price</Trans>}
        tokenA={currencyA?.symbol}
        tokenB={currencyB?.symbol}
      />
      <StepCounter
        value={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] ? '∞' : rightPrice ?? ''}
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
