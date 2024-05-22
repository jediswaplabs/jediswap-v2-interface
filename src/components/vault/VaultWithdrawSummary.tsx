/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable semi */
/* eslint-disable indent */

import styled from 'styled-components'

import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ThemedText } from 'theme/components'
import { useVaultState } from 'state/vaults/hooks'
import { useUnderlyingVaultAssets, useVaultTotalSupply } from './hooks'
import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { useCurrency } from 'hooks/Tokens'
import { removeExtraDecimals } from 'utils/removeExtraDecimals'

const SummaryWrapper = styled.div<{ hideInput?: boolean }>`
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '10px')};
  // background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.surface2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
  padding: 16px;
  border: 1px solid #ffffff50;
`

const VaultRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 36px;
`

const VaultColumn = styled.div`
  display: flex;
  flex-direction: column;
`
const VaultColumnFull = styled(VaultColumn)`
  flex-grow: 1;
  gap: 16px;
`
const StyledTokenName = styled.span`
  font-size: 16px;
  font-weight: 700;
  font-family: 'DM Sans';
`
function TokenCountRow({ currency, value }: { currency: any; value: string }) {
  return (
    <VaultRow>
      <VaultRow style={{ gap: '6px', alignItems: 'center' }}>
        {currency && <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />}
        <StyledTokenName>{currency?.symbol}</StyledTokenName>
      </VaultRow>
      <span>{value ?? 0}</span>
    </VaultRow>
  )
}
export default function VaultWithdrawSummary({
  hideInput = false,
  id,
  vaultPair,
  currentVault,
  ...rest
}: {
  hideInput?: boolean
  id: string
  vaultPair?: any
  currentVault: any
}) {
  const { withdrawTypedValue } = useVaultState()
  const currency0 = useCurrency(currentVault.token0.address)
  const currency1 = useCurrency(currentVault.token1.address)
  // amounts
  const typedValue: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(withdrawTypedValue, currency0)
  const { vaultId: vaultAddressFromUrl } = useParams()
  const { data, isError } = useUnderlyingVaultAssets(vaultAddressFromUrl ? vaultAddressFromUrl : '')
  const { token0All, token1All } = useMemo(() => {
    const result: any = data
    if (!result || isError) return { token0All: undefined, token1All: undefined }
    return {
      token0All: result[0],
      token1All: result[1],
    }
  }, [data, isError])

  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
  } = useVaultTotalSupply(vaultAddressFromUrl ? vaultAddressFromUrl : '')
  const totalSupply = useMemo(() => {
    if (!data2 || isError2 || isLoading2) return null
    return data2
  }, [data2, isError2, isLoading2])

  //formula for received tokens
  // 0 == (share/totalsupply)*token0all
  // 1 === (share/totalsupply)*token1all
  const receivedToken0 = useMemo(() => {
    if (!typedValue || !totalSupply || !token0All) {
      return undefined
    }
    const token0Amount = withdrawTypedValue * (Number(token0All) / Number(totalSupply))

    const formattedToken0 = removeExtraDecimals(Number(token0Amount), currency0)
    return tryParseCurrencyAmount(formattedToken0.toString(), currency0)
  }, [typedValue, totalSupply, token0All])

  const receivedToken1 = useMemo(() => {
    if (!typedValue || !totalSupply || !token1All) {
      return undefined
    }
    const token1Amount = withdrawTypedValue * (Number(token1All) / Number(totalSupply))
    const formattedToken1 = removeExtraDecimals(Number(token1Amount), currency1)
    return tryParseCurrencyAmount(formattedToken1.toString(), currency1)
  }, [typedValue, totalSupply, token1All])

  return (
    <SummaryWrapper id={id} hideInput={hideInput} {...rest}>
      <VaultRow>
        <ThemedText.BodyPrimary fontWeight={500}>Received tokens:</ThemedText.BodyPrimary>
        <VaultColumnFull>
          <TokenCountRow currency={vaultPair?.token0Currency} value={receivedToken0?.toSignificant(6)} />
          <TokenCountRow currency={vaultPair?.token1Currency} value={receivedToken1?.toSignificant(6)} />
        </VaultColumnFull>
      </VaultRow>
    </SummaryWrapper>
  )
}
