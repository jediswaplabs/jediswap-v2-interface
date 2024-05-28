import styled, { css } from 'styled-components'
import { AutoColumn } from 'components/Column'
import VaultWithdrawInput from './VaultWithdrawInput'
import VaultWithdrawSummary from './VaultWithdrawSummary'
import { useVaultActionHandlers, useVaultState, useVaultTokens } from 'state/vaults/hooks'
import { ThemedText } from 'theme/components'

const WithdrawWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DisclaimerText = styled.div`
  background: #4f2376;
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 10px;
`

function VaultWithdraw({ currentVault }: { currentVault: any }) {
  const { withdrawTypedValue } = useVaultState()
  const { onWithdrawInput } = useVaultActionHandlers()
  const { token0: token0Currency, token1: token1Currency } = useVaultTokens(currentVault)
  const pair = {
    token0Currency,
    token1Currency,
  }

  return (
    <WithdrawWrapper>
      <VaultWithdrawInput
        value={withdrawTypedValue}
        onUserInput={onWithdrawInput}
        showMaxButton
        id="add-liquidity-input-tokena"
        vaultPair={pair}
        currentVault={currentVault}
      />
      <VaultWithdrawSummary id="add-liquidity-input-tokena" vaultPair={pair} currentVault={currentVault} />
      <DisclaimerText>Withdrawal might incur small slippage (&lt;1%)</DisclaimerText>
    </WithdrawWrapper>
  )
}

export default VaultWithdraw
