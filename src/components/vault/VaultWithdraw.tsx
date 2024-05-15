/* eslint-disable object-curly-newline */
/* eslint-disable semi */
import styled, { css } from 'styled-components'
import React, { useEffect, useState } from 'react'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData } from 'starknet'

import { AutoColumn } from 'components/Column'
import VaultWithdrawInput from './VaultWithdrawInput'
import { useCurrency } from 'hooks/Tokens'
import { useV2Pair } from 'hooks/useV2Pairs'
import { useVaultTokens } from 'state/vaults/hooks'
import VaultWithdrawSummary from './VaultWithdrawSummary'

const WithdrawWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

function VaultWithdraw({ currentVault }: { currentVault: any }) {
  const [callData, setCallData] = useState<Call[]>([])
  // Vault Input state
  const baseCurrency = useCurrency(currentVault.token0.address)
  const currencyB = useCurrency(currentVault.token1.address)

  const { token0, token1 } = useVaultTokens(currentVault)
  const pair = {
    token0,
    token1,
  }
  console.log(pair)
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
    // onWithdraw()
  }, [])

  const onWithdraw = () => {
    const callData = []
    const vaultAddress = '0x054d911ef2a0c44fc92d28d55fb0abe1f8a93c1c2b3035c0c47d7965a6378da9' // vault address
    const callParams = {
      shares: cairo.uint256('0'),
      amount0_min: cairo.uint256('2'),
      amount1_min: cairo.uint256('4'),
    }

    const compiledSwapCalls = CallData.compile(callParams)
    const calls = {
      contractAddress: vaultAddress,
      entrypoint: 'withdraw',
      calldata: compiledSwapCalls,
    }
    callData.push(calls)
    setCallData(callData)
  }

  return (
    <WithdrawWrapper>
      <VaultWithdrawInput
        value={'123123123s123'}
        onUserInput={() => {}}
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
      <VaultWithdrawSummary id="add-liquidity-input-tokena" vaultPair={pair} />
    </WithdrawWrapper>
  )
}

export default VaultWithdraw
