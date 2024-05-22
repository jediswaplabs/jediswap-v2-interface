/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable semi */
/* eslint-disable indent */

import styled from 'styled-components'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ThemedText } from 'theme/components'
import { useVaultState, useVaultWithdrawDerivedInfo } from 'state/vaults/hooks'
import { useCurrency } from 'hooks/Tokens'

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
  ...rest
}: {
  hideInput?: boolean
  id: string
  vaultPair?: any
  currentVault: any
}) {
  const currency0 = useCurrency(currentVault.token0.address)
  const currency1 = useCurrency(currentVault.token1.address)
  const vaultState = useVaultState()
  const { parsedReceivedTokens } = useVaultWithdrawDerivedInfo(
    vaultState,
    currency0 ?? undefined,
    currency1 ?? undefined
  )

  return (
    <SummaryWrapper id={id} hideInput={hideInput} {...rest}>
      <VaultRow>
        <ThemedText.BodyPrimary fontWeight={500}>Received tokens:</ThemedText.BodyPrimary>
        <VaultColumnFull>
          <TokenCountRow currency={vaultPair?.token0Currency} value={parsedReceivedTokens.token0?.toSignificant(6)} />
          <TokenCountRow currency={vaultPair?.token1Currency} value={parsedReceivedTokens?.token1?.toSignificant(6)} />
        </VaultColumnFull>
      </VaultRow>
    </SummaryWrapper>
  )
}
