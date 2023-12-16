import { ArrowRight } from 'react-feather'
import { useTheme } from 'styled-components'

import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row from 'components/Row'
import { InterfaceTrade } from 'state/routing/types'
import { ThemedText } from 'theme/components'
import { useFormatter } from 'utils/formatNumbers'

export function TradeSummary() {
  const theme = useTheme()
  const { formatReviewSwapCurrencyAmount } = useFormatter()

  // TODO
  return (
    <Row gap="sm" justify="center" align="center">
      {/* <CurrencyLogo currency={trade.inputAmount.currency} size="16px" /> */}
      {/* <ThemedText.LabelSmall color="neutral1"> */}
      {/*  {formatReviewSwapCurrencyAmount(trade.inputAmount)} {trade.inputAmount.currency.symbol} */}
      {/* </ThemedText.LabelSmall> */}
      {/* <ArrowRight color={theme.neutral1} size="12px" /> */}
      {/* <CurrencyLogo currency={trade.postTaxOutputAmount.currency} size="16px" /> */}
      {/* <ThemedText.LabelSmall color="neutral1"> */}
      {/*  {formatReviewSwapCurrencyAmount(trade.postTaxOutputAmount)} {trade.postTaxOutputAmount.currency.symbol} */}
      {/* </ThemedText.LabelSmall> */}
    </Row>
  )
}
