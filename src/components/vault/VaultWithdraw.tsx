import styled, { css } from 'styled-components'
import React, { useEffect, useState } from 'react'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData } from 'starknet'
import { useParams } from 'react-router-dom'
import { useUserShares } from './hooks'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import { AutoColumn } from 'components/Column'
import VaultWithdrawInput from './VaultWithdrawInput'
import VaultWithdrawSummary from './VaultWithdrawSummary'
import { useVaultActionHandlers, useVaultState, useVaultTokens } from 'state/vaults/hooks'
import { useSelector } from 'react-redux'

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
      />
      <VaultWithdrawSummary id="add-liquidity-input-tokena" vaultPair={pair} currentVault={currentVault} />
    </WithdrawWrapper>
  )
}

export default VaultWithdraw
