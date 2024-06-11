/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable semi */
/* eslint-disable indent */

import styled from 'styled-components'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ThemedText } from 'theme/components'
import { BigNumberish } from 'starknet'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'

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
function TokenCountRow({ currency, value }: { currency: any; value: string }) {
  return (
    <VaultRow>
      <VaultRow style={{ gap: '6px', alignItems: 'center' }}>
        {currency && <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />}
        <StyledTokenName>{currency?.symbol}</StyledTokenName>
      </VaultRow>
      <span>{value ?? 0}</span>
    </VaultRow>
  )
}
export default function VaultWithdrawSummary({
  hideInput = false,
  id,
  vaultPair,
  currentVault,
  token0Amount,
  token1Amount,
  ...rest
}: {
  hideInput?: boolean
  id: string
  vaultPair?: any
  currentVault: any
  token0Amount: CurrencyAmount<Currency>
  token1Amount: CurrencyAmount<Currency>
}) {
  return (
    <SummaryWrapper id={id} hideInput={hideInput} {...rest}>
      <VaultRow>
        <ThemedText.BodyPrimary fontWeight={500}>Received tokens:</ThemedText.BodyPrimary>
        <VaultColumnFull>
          <TokenCountRow currency={vaultPair?.token0Currency} value={token0Amount?.toSignificant(6)} />
          <TokenCountRow currency={vaultPair?.token1Currency} value={token1Amount?.toSignificant(6)} />
        </VaultColumnFull>
      </VaultRow>
    </SummaryWrapper>
  )
}
