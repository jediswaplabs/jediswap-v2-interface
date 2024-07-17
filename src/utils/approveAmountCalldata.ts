// import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { toHex } from '@harshalmaniya/jediswap-sdk-v3'

import { Erc20Interface } from '../abis/types/Erc20'

// const ERC20_INTERFACE = new Interface([
//   {
//     constant: false,
//     inputs: [
//       { name: '_spender', type: 'address' },
//       { name: '_value', type: 'uint256' },
//     ],
//     name: 'approve',
//     outputs: [{ name: '', type: 'bool' }],
//     payable: false,
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
// ]) as Erc20Interface

export default function approveAmountCalldata(amount: CurrencyAmount<Currency>, spender: string) {
  return null
}
