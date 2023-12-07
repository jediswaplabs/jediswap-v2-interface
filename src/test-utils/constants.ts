import { ChainId, CurrencyAmount, Percent, Token, TradeType } from '@vnaysn/jediswap-sdk-core'
// This is a test file, so the import of smart-order-router is allowed.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
// import { V3Route } from '@uniswap/smart-order-router'
import { FeeAmount, Pool } from '@vnaysn/jediswap-sdk-v3'
import { ZERO_PERCENT } from 'constants/misc'
import { nativeOnChain } from 'constants/tokens'
import { BigNumber } from 'ethers/lib/ethers'
import JSBI from 'jsbi'
import { ClassicTrade, PreviewTrade, QuoteMethod } from 'state/routing/types'

export const TEST_TOKEN_1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'ABC', 'Abc')
export const TEST_TOKEN_2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 'DEF', 'Def')
export const TEST_TOKEN_3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 'GHI', 'Ghi')
export const TEST_RECIPIENT_ADDRESS = '0x0000000000000000000000000000000000000004'
export const ETH_MAINNET = nativeOnChain(ChainId.MAINNET)

export const TEST_POOL_12 = new Pool(
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  FeeAmount.HIGH,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633
)

export const TEST_POOL_13 = new Pool(
  TEST_TOKEN_1,
  TEST_TOKEN_3,
  FeeAmount.MEDIUM,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633
)

export const toCurrencyAmount = (token: Token, amount: number) =>
  CurrencyAmount.fromRawAmount(token, JSBI.BigInt(amount))

export const TEST_TRADE_EXACT_INPUT = undefined

export const TEST_TRADE_EXACT_INPUT_API = undefined

export const TEST_TRADE_EXACT_OUTPUT = undefined

export const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100)

export const TEST_DUTCH_TRADE_ETH_INPUT = undefined

export const TEST_TRADE_FEE_ON_SELL = undefined

export const TEST_TRADE_FEE_ON_BUY = undefined
