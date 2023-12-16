import { Currency, CurrencyAmount, Token } from '@vnaysn/jediswap-sdk-core'
import { CurrencyAmount as CurrencyAmountV2, ETHER, WETH } from '@jediswap/sdk'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { Abi, uint256 } from 'starknet'

import { useAccountDetails } from 'hooks/starknet-react'
import ERC20ABI from 'abis/erc20.json'
import { useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useSingleCallResult, useMultipleContractSingleData } from 'state/multicall/hooks'
import { DEFAULT_CHAIN_ID, nativeOnChain } from '../../constants/tokens'
import { useTokenContract } from '../../hooks/useContractV2'
import { useInterfaceMulticall } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import { isAddressValidForStarknet } from '../../utils/addresses'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useNativeCurrencyBalances(uncheckedAddresses?: (string | undefined)[]): {
  [address: string]: CurrencyAmount<Currency> | undefined
} {
  const { chainId } = useAccountDetails()
  const multicallContract = useInterfaceMulticall()

  const validAddressInputs: [string][] = useMemo(
    () => (uncheckedAddresses
      ? uncheckedAddresses
        .map(isAddress)
        .filter((a): a is string => a !== false)
        .sort()
        .map((addr) => [addr])
      : []),
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleData(multicallContract, 'getEthBalance', validAddressInputs)

  return useMemo(
    () => validAddressInputs.reduce<{ [address: string]: CurrencyAmount<Currency> }>((memo, [address], i) => {
      const value = results?.[i]?.result?.[0]
      if (value && chainId) { memo[address] = CurrencyAmount.fromRawAmount(nativeOnChain(chainId), JSBI.BigInt(value.toString())) }
      return memo
    }, {}),
    [validAddressInputs, chainId, results]
  )
}

export function useToken0Balance(uncheckedAddress?: string): CurrencyAmountV2 | undefined {
  const { account, chainId } = useAccountDetails()

  const tokenContract = useTokenContract(WETH[chainId ?? DEFAULT_CHAIN_ID]?.address)

  const address = useAddressNormalizer(uncheckedAddress)

  const balance = useSingleCallResult(tokenContract, 'balanceOf', { account: address ?? '0' })

  const uint256Balance: uint256.Uint256 = useMemo(() => ({ low: balance?.result?.[0] ?? '0x0', high: balance?.result?.[1] ?? '0x0' }), [
    balance?.result
  ])

  return useMemo(() => {
    const value = balance?.result ? uint256.uint256ToBN(uint256Balance) : undefined
    if (value && address) { return CurrencyAmountV2.ether(JSBI.BigInt(value.toString())) }
    return undefined
  }, [address, balance, uint256Balance, chainId])
}

// const ERC20Interface = new Interface(ERC20ABI)
const tokenBalancesGasRequirement = { gasRequired: 185_000 }

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddressValidForStarknet(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20ABI as Abi, 'balanceOf', {
    account: address ?? '0'
  })

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])

  return [
    useMemo(
      () => (address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: CurrencyAmount | undefined }>((memo, token, i) => {
          const value = balances?.[i]?.result?.[0]
          const amount = value ? JSBI.BigInt(value.toString()) : undefined
          if (amount) {
            memo[token.address] = new CurrencyAmount(token, amount)
          }
          return memo
        }, {})
        : {}),
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(
    account,
    useMemo(() => [token], [token])
  )
  if (!token) { return undefined }
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency?.isToken ?? false) ?? [],
    [currencies]
  )

  const { chainId } = useAccountDetails()

  const token0Balance = useToken0Balance()
  const tokenBalances = useTokenBalances(account, tokens)
  const containsTOKEN0: boolean = useMemo(() => currencies?.some((currency) => currency === ETHER) ?? false, [currencies])

  return useMemo(
    () => currencies?.map((currency) => {
      if (!account || !currency) { return undefined }
      if (currency?.isToken) { return tokenBalances[currency.address] }
      if (containsTOKEN0) { return token0Balance }
      return undefined
    }) ?? [],
    [account, containsTOKEN0, currencies, token0Balance, tokenBalances]
  )
}

export default function useCurrencyBalance(
  account?: string,
  currency?: Currency
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    account,
    useMemo(() => [currency], [currency])
  )[0]
}
