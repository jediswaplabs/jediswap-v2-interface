import styled, { css } from 'styled-components'
import { AutoColumn } from 'components/Column'
import VaultWithdrawInput from './VaultWithdrawInput'
import VaultWithdrawSummary from './VaultWithdrawSummary'
import { useVaultActionHandlers, useVaultState, useVaultTokens } from 'state/vaults/hooks'

const WithdrawWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
        // onMax={() => {
        //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        // }}
        // showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
        showMaxButton
        // currency={currencies[Field.CURRENCY_A] ?? null}
        id="add-liquidity-input-tokena"
        // fiatValue={currencyAFiat}
        // showCommonBases
        // locked={depositADisabled}
        vaultPair={pair}
        currentVault={currentVault}
      />
      <VaultWithdrawSummary id="add-liquidity-input-tokena" vaultPair={pair} currentVault={currentVault} />
    </WithdrawWrapper>
  )
}

export default VaultWithdraw
