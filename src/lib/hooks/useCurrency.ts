import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { InterfaceEventName } from '@uniswap/analytics-events'
import { ChainId, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import { sendAnalyticsEvent } from 'analytics'
import { isSupportedChain } from 'constants/chains'
import { useTokenContract } from 'hooks/useContractV2'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useEffect, useMemo } from 'react'

import { DEFAULT_CHAIN_ID, DEFAULT_ERC20_DECIMALS, WETH } from '../../constants/tokens'
// import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { isAddress } from '../../utils'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useContractRead } from '@starknet-react/core'
import ERC20_ABI from 'abis/erc20.json'
import { cairo, num, shortString } from 'starknet'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

export const UNKNOWN_TOKEN_SYMBOL = 'UNKNOWN'
const UNKNOWN_TOKEN_NAME = 'Unknown Token'

const useSingleCallResult = (address: string | undefined, type: string) => {
  const { data: result, isLoading } = useContractRead({
    functionName: type,
    args: [],
    abi: ERC20_ABI,
    address,
    watch: true,
  })

  return { result, isLoading }
}

export function parseStringFromArgs(data: any, isHexNumber?: boolean): string | undefined {
  if (typeof data === 'string') {
    if (isHexNumber) {
      return num.hexToDecimalString(data)
    } else if (shortString.isShortString(data)) {
      return shortString.decodeShortString(data)
    }
    return data
  }
  return undefined
}

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromActiveNetwork(tokenAddress: string | undefined): Token | null | undefined {
  const { chainId } = useAccountDetails()

  const formattedAddress = isAddressValidForStarknet(tokenAddress)
  const tokenContract = useTokenContract(formattedAddress ? formattedAddress : undefined, false)

  // TODO (WEB-1709): reduce this to one RPC call instead of 5
  // TODO: Fix redux-multicall so that these values do not reload.
  const tokenName: any = useSingleCallResult(tokenContract?.address, 'name')
  const symbol: any = useSingleCallResult(tokenContract?.address, 'symbol')
  const decimals: any = useSingleCallResult(tokenContract?.address, 'decimals')

  const isLoading = useMemo(
    () => decimals.isLoading || symbol.isLoading || tokenName.isLoading,
    [decimals.isLoading, symbol.isLoading, tokenName.isLoading]
  )

  const parsedDecimals = useMemo(
    () => parseInt(decimals?.result?.decimals) ?? DEFAULT_ERC20_DECIMALS,
    [decimals.result]
  )

  return useMemo(() => {
    if (!chainId || !formattedAddress || isLoading) return undefined
    if (decimals.isLoading || symbol.isLoading || tokenName.isLoading) return null
    const parsedTokenNameHexString =
      tokenName && tokenName.result ? num.getHexString(tokenName?.result?.name.toString()) : UNKNOWN_TOKEN_NAME

    const parsedSymbolHexString =
      tokenName && tokenName.result ? num.getHexString(symbol?.result?.symbol.toString()) : UNKNOWN_TOKEN_SYMBOL

    if (decimals.result) {
      const token = new Token(
        chainId,
        formattedAddress,
        parsedDecimals,
        parseStringFromArgs(parsedSymbolHexString),
        parseStringFromArgs(parsedTokenNameHexString)
      )
      return token
    }
    return undefined
  }, [formattedAddress, chainId, decimals, symbol, tokenName])
}

type TokenMap = { [address: string]: Token }

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromMapOrNetwork(tokens: TokenMap, tokenAddress?: string | null): Token | undefined {
  const { chainId } = useAccountDetails()
  const address = isAddressValidForStarknet(tokenAddress)
  const token: Token | undefined =
    WETH[chainId ?? DEFAULT_CHAIN_ID].address === address
      ? WETH[chainId ?? DEFAULT_CHAIN_ID]
      : address
      ? tokens[address]
      : undefined
  const tokenFromNetwork = useTokenFromActiveNetwork(token ? undefined : address ? address : undefined)

  return tokenFromNetwork ?? token
}

/**
 * Returns a Currency from the currencyId.
 * Returns null if currency is loading or null was passed.
 * Returns undefined if currencyId is invalid or token does not exist.
 */
export function useCurrencyFromMap(
  tokens: TokenMap,
  chainId: ChainId | undefined,
  currencyId?: string | null
): Currency | undefined {
  const nativeCurrency = useNativeCurrency(chainId)
  const isNative = Boolean(nativeCurrency && currencyId?.toUpperCase() === 'ETH')
  const shorthandMatchAddress = useMemo(() => {
    const chain = DEFAULT_CHAIN_ID
    return undefined
  }, [chainId, currencyId])

  const token = useTokenFromMapOrNetwork(tokens, isNative ? undefined : shorthandMatchAddress ?? currencyId)

  if (currencyId === null || currencyId === undefined || !isSupportedChain(chainId)) return

  // this case so we use our builtin wrapped token instead of wrapped tokens on token lists
  const wrappedNative = nativeCurrency?.wrapped
  if (wrappedNative?.address?.toUpperCase() === currencyId?.toUpperCase()) return wrappedNative
  return isNative ? nativeCurrency : token
}
