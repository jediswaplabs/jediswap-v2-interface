import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@vnaysn/jediswap-sdk-core'
import { FeeAmount } from '@vnaysn/jediswap-sdk-v3'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { format } from 'd3'
import { useColor } from 'hooks/useColor'
import { saturate } from 'polished'
import { ReactNode, useCallback, useMemo } from 'react'
import { BarChart2, CloudOff, Inbox } from 'react-feather'
import { batch } from 'react-redux'
import { Bound } from 'state/mint/v3/actions'
import styled, { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'

import { Chart } from './Chart'
import { useDensityChartData } from './hooks'
import { ZoomLevels } from './types'
import JSBI from 'jsbi'

const ZOOM_LEVELS: Record<FeeAmount, ZoomLevels> = {
  [FeeAmount.LOWEST]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [FeeAmount.LOW]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [FeeAmount.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
  [FeeAmount.HIGH]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
}

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  max-height: 200px;
  justify-content: center;
  align-content: center;
`

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <ColumnCenter style={{ height: '100%', justifyContent: 'center' }}>
      {icon}
      {message && (
        <ThemedText.DeprecatedMediumHeader padding={10} marginTop="20px" textAlign="center">
          {message}
        </ThemedText.DeprecatedMediumHeader>
      )}
    </ColumnCenter>
  )
}

export default function LiquidityChartRangeInput({
  rangePercentage,
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
}: {
  rangePercentage: number | null
  currencyA?: Currency
  currencyB?: Currency
  feeAmount?: FeeAmount
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  price?: number
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  interactive: boolean
}) {
  const theme = useTheme()

  const tokenAColor = useColor(currencyA?.wrapped)
  const tokenBColor = useColor(currencyB?.wrapped)

  const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped)

  const { isLoading, error, formattedData } = useDensityChartData({
    currencyA,
    currencyB,
    feeAmount,
  })

  const onBrushDomainChangeEnded = useCallback((domain: [number, number], mode: string | undefined) => {}, [])

  interactive = interactive && Boolean(formattedData?.length)

  const brushDomain: [number, number] | undefined = useMemo(() => {
    if (priceLower && priceUpper && price) {
      if (!rangePercentage) {
        const leftPrice = isSorted ? priceLower : priceUpper?.invert()
        const rightPrice = isSorted ? priceUpper : priceLower?.invert()
        return [parseFloat(leftPrice?.toSignificant(6)), parseFloat(rightPrice?.toSignificant(6))]
      } else {
        const percentage = JSBI.BigInt(rangePercentage) // 20%
        const base = JSBI.BigInt(100) // 100 to represent the whole
        // Calculate the percentage value
        const percentageValue = JSBI.divide(JSBI.multiply(JSBI.BigInt(Math.floor(price)), percentage), base)

        const leftPriceWithPercentage = JSBI.subtract(JSBI.BigInt(price), percentageValue)
        const rightPriceWithPercentage = JSBI.add(JSBI.BigInt(price), percentageValue)

        // Generate scaled random numbers directly
        const scaledDecimalForLeftPrice = Math.random() * 0.0001
        const scaledDecimalForRightPrice = Math.random() * 0.0001

        // Combine with the base number
        const leftPriceWithScaledPercentage = Number(leftPriceWithPercentage) - scaledDecimalForLeftPrice
        const rightPriceWithScaledPercentage = Number(rightPriceWithPercentage) + scaledDecimalForRightPrice

        return [
          parseFloat(leftPriceWithScaledPercentage.toString()),
          parseFloat(rightPriceWithScaledPercentage.toString()),
        ]
      }
    }

    return undefined
  }, [priceLower, priceUpper, rangePercentage])

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      if (!price) return ''

      if (d === 'w' && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0'
      if (d === 'e' && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞'

      const percent = (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100

      return price ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%` : ''
    },
    [isSorted, price, ticksAtLimit]
  )

  const isUninitialized = !currencyA || !currencyB
  return (
    <AutoColumn gap="md" style={{ minHeight: '200px' }}>
      {isUninitialized ? (
        <InfoBox
          message={<Trans>Your position will appear here.</Trans>}
          icon={<Inbox size={56} stroke={theme.neutral1} />}
        />
      ) : (
        <ChartWrapper>
          {price && (
            <Chart
              data={{ series: [], current: price }}
              dimensions={{ width: 560, height: 200 }}
              margins={{ top: 10, right: 2, bottom: 20, left: 0 }}
              styles={{
                area: {
                  selection: theme.accent1,
                },
                brush: {
                  handle: {
                    west: saturate(0.1, tokenAColor) ?? theme.critical,
                    east: saturate(0.1, tokenBColor) ?? theme.accent1,
                  },
                },
              }}
              interactive={interactive}
              brushLabels={brushLabelValue}
              brushDomain={brushDomain}
              onBrushDomainChange={onBrushDomainChangeEnded}
              zoomLevels={ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
              ticksAtLimit={ticksAtLimit}
            />
          )}
        </ChartWrapper>
      )}
    </AutoColumn>
  )
}
