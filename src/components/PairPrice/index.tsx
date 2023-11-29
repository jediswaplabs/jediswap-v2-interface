import React from 'react'
import { Price, Trade, Pair } from '@jediswap/sdk'
import { useContext } from 'react'
import { Repeat } from 'react-feather'
import { BoxProps, Text, TextProps } from 'rebass'
// import { StyledBalanceMaxMini } from '../swap/styleds'
import { formatPairExecutionPrice } from '../../utils/priceV2'
// import { DMSansText } from '../../theme'

interface PairPriceProps {
  pair?: Pair | null
  showInverted?: boolean
  setShowInverted?: (showInverted: boolean) => void
}

export default function PairPrice({ pair, showInverted, setShowInverted, ...rest }: PairPriceProps & TextProps) {
  // const formattedPrice = showInverted ? price?.toSignificant(5) : price?.invert()?.toSignificant(5)

  const show = Boolean(pair?.token0 && pair?.token1)
  // const label = showInverted
  //   ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
  //   : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  const formattedPrice = pair && formatPairExecutionPrice(pair, showInverted, '=')

  return (
    <>
      {show ? (
        <>
          {formattedPrice ?? '-'}
          {/* <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Icon src={PriceInverter} noMargin height={18} width={18} />
          </StyledBalanceMaxMini> */}
        </>
      ) : (
        '-'
      )}
    </>
  )
}
