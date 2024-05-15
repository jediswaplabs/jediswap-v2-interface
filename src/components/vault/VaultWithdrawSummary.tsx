/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable semi */
/* eslint-disable indent */

import styled from 'styled-components'

import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ThemedText } from 'theme/components'

const SummaryWrapper = styled.div<{ hideInput?: boolean }>`
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '10px')};
  // background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.surface2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
  padding: 16px;
  border: 1px solid #ffffff50;
`

const VaultRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 36px;
`

const VaultColumn = styled.div`
  display: flex;
  flex-direction: column;
`
const VaultColumnFull = styled(VaultColumn)`
  flex-grow: 1;
  gap: 16px;
`
const StyledTokenName = styled.span`
  font-size: 16px;
  font-weight: 700;
  font-family: 'DM Sans';
`
function TokenCountRow({ currency }: { currency: any }) {
  return (
    <VaultRow>
      <VaultRow style={{ gap: '6px', alignItems: 'center' }}>
        {currency && <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />}
        <StyledTokenName>{currency.symbol}</StyledTokenName>
      </VaultRow>
      <span>0</span>
    </VaultRow>
  )
}
export default function VaultWithdrawSummary({
  hideInput = false,
  id,
  vaultPair,
  ...rest
}: {
  hideInput?: boolean
  id: string
  vaultPair?: any
}) {
  return (
    <SummaryWrapper id={id} hideInput={hideInput} {...rest}>
      <VaultRow>
        <ThemedText.BodyPrimary fontWeight={500}>Received tokens:</ThemedText.BodyPrimary>
        <VaultColumnFull>
          <TokenCountRow currency={vaultPair?.token0} />
          <TokenCountRow currency={vaultPair?.token1} />
        </VaultColumnFull>
      </VaultRow>
    </SummaryWrapper>
  )
}
