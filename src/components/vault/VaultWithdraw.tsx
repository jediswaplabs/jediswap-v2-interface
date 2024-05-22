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
  const [callData, setCallData] = useState<Call[]>([])
  const { vaultId: vaultAddressFromUrl } = useParams()

  const { token1, token0, shares } = useUserShares()
  const { token0: token0Currency, token1: token1Currency } = useVaultTokens(currentVault)
  const pair = {
    token0Currency,
    token1Currency,
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
    // if (token0 && token1 && shares) onWithdraw()
  }, [token1, token0, shares])

  const onWithdraw = () => {
    if (!token0 || !token1 || !shares) return
    const defaultDepositSlippage = new Percent(99, 10000)
    const amount0_min = BigInt(Math.round(Number(token0.toString()) * Number(defaultDepositSlippage.toSignificant())))
    const amount1_min = BigInt(Math.round(Number(token1.toString()) * Number(defaultDepositSlippage.toSignificant())))
    const callData = []
    const vaultAddress = vaultAddressFromUrl
    const callParams = {
      shares: cairo.uint256(shares),
      amount0_min: cairo.uint256(amount0_min.toString()),
      amount1_min: cairo.uint256(amount1_min.toString()),
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
