export function formattedPercent(percent: any, useAbs = false, useColors = true) {
  percent = parseFloat(percent)
  if (!percent || percent === 0) {
    return '0'
  }

  if (percent < 0.0001 && percent > 0) {
    return '< 0.0001%'
  }

  if (percent < 0 && percent > -0.0001) {
    return '< 0.0001%'
  }

  if (percent > 999999) {
    return '> 999999%'
  }

  let fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return '0%'
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return `${useAbs ? '' : '+'}${percent?.toFixed(0).toLocaleString()}%`
    } else {
      return `${useAbs ? '' : '+'}${fixedPercent}%`
    }
  } else {
    return `${fixedPercent}%`
  }
}
