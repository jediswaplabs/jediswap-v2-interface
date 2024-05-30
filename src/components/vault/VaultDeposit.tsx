/* eslint-disable semi */
import styled, { css } from 'styled-components'
import { useSelector } from 'react-redux'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { useVaultActionHandlers, useVaultDerivedInfo, useVaultState } from 'state/vaults/hooks'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/vaults/actions'

const DepositWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

function VaultDeposit({ currentVault }: { currentVault: any }) {
  const { onFieldAInput, onFieldBInput } = useVaultActionHandlers()

  // Vault Input state
  const baseCurrency = useCurrency(currentVault.token0.address)
  const currencyB = useCurrency(currentVault.token1.address)
  const vaultState = useSelector((state: any) => state.vaults)

  // vault state state
  const { independentField, typedValue } = useVaultState()
  const { dependentField, currencies, parsedAmounts } = useVaultDerivedInfo(
    vaultState,
    baseCurrency ?? undefined,
    currencyB ?? undefined
  )
  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }
  return (
    <DepositWrapper>
      <CurrencyInputPanel
        value={formattedAmounts[Field.CURRENCY_A]}
        onUserInput={onFieldAInput}
        showMaxButton
        currency={currencies[Field.CURRENCY_A] ?? null}
        id="add-liquidity-input-tokena"
      />
      <CurrencyInputPanel
        value={formattedAmounts[Field.CURRENCY_B]}
        onUserInput={onFieldBInput}
        showMaxButton
        currency={currencies[Field.CURRENCY_B] ?? null}
        id="add-liquidity-input-tokena"
      />
    </DepositWrapper>
  )
}

export default VaultDeposit
