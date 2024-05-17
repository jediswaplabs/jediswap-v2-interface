import React, { useEffect, useState } from 'react'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData } from 'starknet'
import { useUserShares } from './hooks'
import { useAccountDetails } from 'hooks/starknet-react'
import { Percent } from '@vnaysn/jediswap-sdk-core'

function VaultWithdraw() {
  const [callData, setCallData] = useState<Call[]>([])
  const { token1, token0, shares } = useUserShares()
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
    const vaultAddress = '0x033bb35548c9cfcfdafe1c18cf8040644a52881f8fd2f4be56770767c12e3a41' // vault address
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

  return <div></div>
}

export default VaultWithdraw
