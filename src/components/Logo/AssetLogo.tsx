import { ChainId, Currency } from '@vnaysn/jediswap-sdk-core'
import useTokenLogoSource from 'hooks/useAssetLogoSource'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import EthereumLogo from 'assets/images/ethereum-logo.png'

export const MissingImageLogo = styled.div<{ size?: string }>`
  --size: ${({ size }) => size};
  border-radius: 100px;
  color: ${({ theme }) => theme.neutral1};
  background-color: ${({ theme }) => theme.surface3};
  font-size: calc(var(--size) / 3);
  font-weight: 535;
  height: ${({ size }) => size ?? '24px'};
  line-height: ${({ size }) => size ?? '24px'};
  text-align: center;
  width: ${({ size }) => size ?? '24px'};
  display: flex;
  align-items: center;
  justify-content: center;
`

const LogoImage = styled.img<{ size: string; imgLoaded?: boolean }>`
  opacity: ${({ imgLoaded }) => (imgLoaded ? 1 : 0)};
  transition: opacity ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.in}`};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`

const LogoImageWrapper = styled.div<{ size: string; imgLoaded?: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: ${({ theme, imgLoaded }) => (imgLoaded ? 'none' : theme.surface3)};
  transition: background-color ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.in}`};
  box-shadow: 0 0 1px white;
  border-radius: 50%;
`

export type AssetLogoBaseProps = {
  symbol?: string | null
  backupImg?: string | null
  size?: string
  style?: React.CSSProperties
}
type AssetLogoProps = AssetLogoBaseProps & {
  currency?: Currency
  isNative?: boolean
  address?: string | null
  chainId?: ChainId
}

const LogoContainer = styled.div`
  position: relative;
  display: flex;
`

const StyledEthereumLogo = styled.img<{ size: number }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  transition: background-color ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.in}`};
  box-shadow: 0 0 1px white;
  border-radius: 50%;
`

const CurrencyLogo = ({ currency, symbol, size }: { currency: any; symbol: any; size: any }) => {
  const currencyLogo: any = currency

  if (currencyLogo && (currencyLogo.name === 'ETHER' || currencyLogo.name === 'ETH')) {
    return <StyledEthereumLogo src={EthereumLogo} alt={`${symbol ?? 'token'} logo`} size={size} loading="lazy" />
  } else if (currencyLogo && currencyLogo.logoURI) {
    return (
      <StyledEthereumLogo src={currencyLogo.logoURI} alt={`${symbol ?? 'token'} logo`} size={size} loading="lazy" />
    )
  }

  return (
    <MissingImageLogo size={size}>
      {symbol?.toUpperCase().replace('$', '').replace(/\s+/g, '').slice(0, 3)}
    </MissingImageLogo>
  )
}

/**
 * Renders an image by prioritizing a list of sources, and then eventually a fallback triangle alert
 */
export default function AssetLogo({ currency, symbol, size = '24px', style }: AssetLogoProps) {
  return (
    <LogoContainer style={{ height: size, width: size, ...style }}>
      <CurrencyLogo currency={currency} symbol={symbol} size={size} />
    </LogoContainer>
  )
}
