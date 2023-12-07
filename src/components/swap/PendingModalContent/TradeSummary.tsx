import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row from 'components/Row'
import { ArrowRight } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'
import { useFormatter } from 'utils/formatNumbers'

export function TradeSummary() {
  const theme = useTheme()
  const { formatReviewSwapCurrencyAmount } = useFormatter()

  return <Row gap="sm" justify="center" align="center"></Row>
}
