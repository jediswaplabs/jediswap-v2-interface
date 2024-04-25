import React, { useEffect, useState } from 'react'
import { useContractWrite } from '@starknet-react/core'
import { cairo, Call, CallData } from 'starknet'

function VaultWithdraw() {
  const [callData, setCallData] = useState<Call[]>([])

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

  return <div></div>
}

export default VaultWithdraw