import { Text } from 'rebass'
import Numeral from 'numeral'

export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange = ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

export const get2DayPercentChange = (oneDayData, twoDaysData) => {
  // get volume info for both 24 hour periods
  let yesterdayData = twoDaysData - oneDayData

  const adjustedPercentChange = ((oneDayData - yesterdayData) / (yesterdayData)) * 100

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

export function formattedPercent(percent, useAbs = false, color = '', fontWeight=500) {
  const green = '#21E70F'
  const red = '#FC4D4D'
  percent = parseFloat(percent)
  if (!percent || percent === 0) {
    return <Text fontWeight={fontWeight} color={color}>0%</Text>
  }

  if (percent < 0.0001 && percent > 0) {
    return (
      <Text fontWeight={fontWeight} color={color || green}>
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent < 0 && percent > -0.0001) {
    return (
      <Text fontWeight={fontWeight} color={color || red}>
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent > 999999) {
    return (
      <Text fontWeight={fontWeight} color={color ||  green}>
        {'> 999999%'}
      </Text>
    )
  }

  let fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return <Text fontWeight={fontWeight} color={color}>0%</Text>
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return <Text fontWeight={fontWeight} color={color || green}>{`${useAbs ? '' : '+'}${percent?.toFixed(0).toLocaleString()}%`}</Text>
    } else {
      return <Text fontWeight={fontWeight} color={color || green}>{`${useAbs ? '' : '+'}${fixedPercent}%`}</Text>
    }
  } else {
    return <Text fontWeight={fontWeight} color={color || red}>{`${fixedPercent}%`}</Text>
  }
}

export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}

export const toK = (num, maxSigns = 2) => {
  return Numeral(num).format(
    `0.[${Array.from({ length: maxSigns })
      .map(() => 0)
      .join('')}]a`
  )
}

export const formattedNum = (number, usd = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true)
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  return Number(parseFloat(num).toFixed(4)).toString()
}