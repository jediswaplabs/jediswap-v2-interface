import React, { useEffect, useState } from 'react'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData } from 'starknet'
import styled, { css } from 'styled-components'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { useVaultActionHandlers, useVaultDerivedInfo, useVaultInputState } from 'state/vaults/hooks'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/vaults/actions'

const DepositWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

function VaultDeposit({ currentVault }: { currentVault: any }) {
  const [callData, setCallData] = useState<Call[]>([])
  const { onFieldAInput, onFieldBInput } = useVaultActionHandlers()

  // Vault Input state
  const { independentField, typedValue } = useVaultInputState()
  const baseCurrency = useCurrency(currentVault.token0.address)
  const currencyB = useCurrency(currentVault.token1.address)

  const { dependentField, currencies, parsedAmounts } = useVaultDerivedInfo(
    baseCurrency ?? undefined,
    currencyB ?? undefined
  )
  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }
  const {
    writeAsync,
    data: txData,
    error,
  } = useContractWrite({
    calls: callData,
  })

  useEffect(() => {
    if (callData) {
      writeAsync()
        .then((response) => {
          if (response?.transaction_hash) {
          }
        })
        .catch((err) => {
          console.log(err?.message)
        })
    }
  }, [callData])

  useEffect(() => {
    // onDeposit()
  }, [])

  const onDeposit = () => {
    // const callData = []
    const vaultAddress = '0x054d911ef2a0c44fc92d28d55fb0abe1f8a93c1c2b3035c0c47d7965a6378da9' // replace vault address
    const callParams = {
      shares: cairo.uint256('0'),
      amount0_max: cairo.uint256('2'),
      amount1_max: cairo.uint256('4'),
    }

    const compiledSwapCalls = CallData.compile(callParams)
    const calls = {
      contractAddress: vaultAddress,
      entrypoint: 'deposit',
      calldata: compiledSwapCalls,
    }
    callData.push(calls)
    setCallData(callData)
  }

  return (
    <DepositWrapper>
      <CurrencyInputPanel
        value={formattedAmounts[Field.CURRENCY_A]}
        onUserInput={onFieldAInput}
        // onMax={() => {
        //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        // }}
        // showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
        showMaxButton
        currency={currencies[Field.CURRENCY_A] ?? null}
        id="add-liquidity-input-tokena"
        // fiatValue={currencyAFiat}
        // showCommonBases
        // locked={depositADisabled}
      />
      <CurrencyInputPanel
        value={formattedAmounts[Field.CURRENCY_B]}
        onUserInput={onFieldBInput}
        // onMax={() => {
        //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        // }}
        showMaxButton
        // showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
        currency={currencies[Field.CURRENCY_B] ?? null}
        id="add-liquidity-input-tokena"
        // fiatValue={currencyAFiat}
        // showCommonBases
        // locked={depositADisabled}
      />
    </DepositWrapper>
  )
}

export default VaultDeposit
