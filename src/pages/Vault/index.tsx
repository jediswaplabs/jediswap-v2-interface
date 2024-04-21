// @ts-nocheck

import { Trans } from '@lingui/macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft } from 'react-feather'
import { useMedia } from 'react-use'
import styled, { css } from 'styled-components'
import { Flex } from 'rebass'
import { Token } from '@vnaysn/jediswap-sdk-core'
import { isEmpty } from 'lodash'
import { Link, useParams } from 'react-router-dom'
import { useBalance } from '@starknet-react/core'

import { useAccountDetails } from 'hooks/starknet-react'
import { AutoColumn } from 'components/Column'
import { StyledRouterLink, ThemedText } from 'theme/components'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useAllVaults } from '../../state/vaults/hooks.ts'
import JediSwapLoader from '../../components/Loader/JediSwapLoader'
import noPositionsBg from '../../assets/svg/no-positions-bg.svg'
import { useFormatter } from '../../utils/formatNumbers.ts'
import { formatUsdPrice } from '../../nft/utils'
import { isAddressValidForStarknet } from '../../utils/addresses'
import { AutoRow } from 'components/Row'
import { FullDivider, VaultWrapper } from 'components/vault/styled'
import VaultHeader from 'components/vault/VaultHeader'

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 920px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`

const NoPositionsContainer = styled.div`
  background: url(${noPositionsBg}) no-repeat;
  background-color: #141451;
  background-position: center 20px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 100px;
  width: 100%;
  border-radius: 8px;
  padding: 2rem;
  // @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
  //   padding: 0px 52px;
  // }
  //
  // @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
  //   padding: 0px 52px;
  // }
`

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 25vh;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 0px 52px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding: 0px 52px;
  }
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const NetworkIcon = styled(AlertTriangle)`
  ${IconStyle}
`

const PageTitleRow = styled.div`
  display: flex;
  gap: 10px;

  align-items: center;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(217, 217, 217, 0.1);
`

const VerticalDivider = styled.div`
  height: 1px;
  width: 50px;
  background: rgba(217, 217, 217, 0.1);
  transform: rotate(90deg);
`

const List = styled.div``

const StyledTokenName = styled.span<{ active?: boolean }>`
  font-size: 20px;
  font-weight: 700;
  font-family: 'DM Sans';
`

const Arrow = styled.div`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;

  :hover {
    cursor: pointer;
  }
`

const VaultDetailsContainer = styled(Flex)`
  flex-direction: column;
  padding: 17px 20px 32px 20px;
  background-color: #141451;
  width: 416px;
  border-radius: 4px;
  gap: 20px;
`
const VaultName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`
const VaultStrategyType = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`

const VaultStrategyDetail = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #d9d9d9;
`
const VaultStrategyLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  font-size: 14px;
  font-weight: 700;
  color: #50d5ff;
  &:hover {
    cursor: pointer;
  }
  & a {
    color: inherit;
    text-decoration: none;
  }
`
const ProviderLogo = styled.img`
  user-select: none;
  max-width: 100%;
`

const VaultDataHeaders = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d9d9d9;
`

function ErrorPanel({ text }) {
  return (
    <ErrorContainer>
      <ThemedText.BodyPrimary textAlign="center">
        <NetworkIcon strokeWidth={1} style={{ marginTop: '2em' }} />
        <div>
          <Trans>{text || 'An error has occurred. Please try again later.'}</Trans>
        </div>
      </ThemedText.BodyPrimary>
    </ErrorContainer>
  )
}

function NoVaultsPanel() {
  return (
    <NoPositionsContainer>
      <ThemedText.BodyPrimary textAlign="center" fontSize={20}>
        <Trans>No Liquidity has been found. Please deposit in any of our Vaults.</Trans>
      </ThemedText.BodyPrimary>
    </NoPositionsContainer>
  )
}

const noop = () => {}
const UserBalance = ({ tokenAddress, vaultAddress, tokenPrice, getResult = noop }) => {
  const { address, isConnected } = useAccountDetails()
  const {
    data: userBalanceData,
    isLoading: isUserBalanceLoading,
    isError: isUserBalanceError,
    isSuccess: isUserBalanceSuccess,
  } = useBalance({
    token: tokenAddress,
    address,
    watch: true,
  })
  let result
  const balanceInUsd = Number(userBalanceData?.formatted ?? 0) * (tokenPrice ?? 0)
  useEffect(() => {
    if (isConnected && isUserBalanceSuccess) {
      getResult({ vaultAddress, balance: balanceInUsd })
    }
  }, [userBalanceData, isUserBalanceSuccess, isConnected])

  switch (true) {
    case !isConnected:
    case isUserBalanceError: {
      result = formatUsdPrice(0)
      break
    }
    case isUserBalanceLoading: {
      result = '...'
      break
    }
    case isUserBalanceSuccess: {
      result = formatUsdPrice(balanceInUsd)
      break
    }
    default: {
      result = 0
    }
  }
  return result
}

const BreadcrumbsRow = styled(Flex)``
const Breadcrumbs = styled(Flex)`
  gap: 6px;
  align-items: center;
`

const BreadcrumbsNavLink = styled(StyledRouterLink)`
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
`

const PageContentWrapper = styled(Flex)`
  gap: 20px;
  flex-direction: row;
`

const PageTitle = ({ token0, token1 }) => {
  const below600 = useMedia('(max-width: 600px)')
  if (!(token0 && token1)) {
    return null
  }
  return (
    <PageTitleRow>
      <DoubleCurrencyLogo size={below600 ? 24 : 30} currency0={token0} currency1={token1} margin />
      <StyledTokenName className="pair-name-container">
        {token0?.symbol}-{token1?.symbol}
      </StyledTokenName>
    </PageTitleRow>
  )
}

export default function Vault({ className }: { className?: string }) {
  const { vaultId: vaultIdFromUrl } = useParams()
  const { address, isConnected } = useAccountDetails()
  const { formatPercent } = useFormatter()
  const [generalError, setGeneralError] = useState(null)
  const [generalLoading, setGeneralLoading] = useState(true)

  const { data: allVaults, error: allVaultsError, isLoading: isAllVaultsLoading } = useAllVaults()

  const getCurrentVault = () => {
    if (!allVaults) {
      return
    }
    const result = allVaults[vaultIdFromUrl]
    return result
  }
  const currentVault = getCurrentVault()
  const vaultsAddresses = Object.keys(allVaults ?? {})

  useEffect(() => {
    setGeneralError(allVaultsError)
    setGeneralLoading(isAllVaultsLoading)
  }, [allVaultsError, isAllVaultsLoading])

  const getContent = () => {
    switch (true) {
      case !isAddressValidForStarknet(vaultIdFromUrl): {
        return <ErrorPanel />
      }
      case generalError: {
        return <ErrorPanel />
      }
      case generalLoading: {
        return <JediSwapLoader />
      }
      case !vaultsAddresses?.length: {
        return <ErrorPanel />
      }
      case vaultsAddresses?.length && !currentVault: {
        return <ErrorPanel />
      }
      case !(currentVault.token0 && currentVault.token1): {
        return <ErrorPanel />
      }
      default: {
        const shareTokenAddress = currentVault?.share?.address
        const performanceData = currentVault.performance[currentVault.mainAssetKey]
        const token0 = new Token(
          currentVault.token0.chainId,
          currentVault.token0.address,
          currentVault.token0.decimals,
          currentVault.token0.symbol,
          currentVault.token0.name
        )
        token0.logoURI = currentVault.token0.logoURI

        const token1 = new Token(
          currentVault.token1.chainId,
          currentVault.token1.address,
          currentVault.token1.decimals,
          currentVault.token1.symbol,
          currentVault.token1.name
        )
        token1.logoURI = currentVault.token1.logoURI

        let tvl
        let apr
        let feeApr
        let totalApr
        let shareTokenPriceUsd

        if (!isEmpty(performanceData)) {
          const mainTokenDecimals = currentVault[currentVault.mainAssetKey].decimals
          const tvlInMainToken = performanceData.tvl / 10 ** mainTokenDecimals
          const tokenPrice = currentVault.prices[currentVault.mainAssetKey]
          const shareTokenDecimals = currentVault?.share?.decimals
          const shareTokenPriceInUnits = performanceData.shareTokenPrice / 10 ** (18 + shareTokenDecimals)
          tvl = tvlInMainToken * tokenPrice
          apr = Number(performanceData.shareTokenApr / 10 ** 4)?.toFixed(2)
          feeApr = Number(performanceData.feeApr / 10 ** 4)?.toFixed(2)
          totalApr = Number((performanceData?.shareTokenApr + performanceData?.feeApr) / 10 ** 4)?.toFixed(2)
          shareTokenPriceUsd = shareTokenPriceInUnits * tokenPrice
        }

        return (
          <AutoColumn gap={'12px'}>
            <PageTitle token0={token0} token1={token1} />
            <PageContentWrapper>
              <VaultDetailsContainer>
                <AutoColumn gap="37px">
                  <AutoRow>
                    <AutoColumn gap="15px" grow={true}>
                      <VaultDataHeaders>PROVIDER</VaultDataHeaders>
                      <ThemedText.BodySmall>{currentVault.provider.name}</ThemedText.BodySmall>
                    </AutoColumn>
                    <AutoColumn gap="15px" grow={true}>
                      <VaultDataHeaders>TVL</VaultDataHeaders>
                      <ThemedText.BodySmall fontWeight={500}>{tvl ? formatUsdPrice(tvl) : '-'}</ThemedText.BodySmall>
                    </AutoColumn>
                    <ProviderLogo src={currentVault.provider.logo} />
                  </AutoRow>
                  <AutoRow>
                    <AutoColumn gap="15px" grow={true}>
                      <VaultDataHeaders>APR RANGE</VaultDataHeaders>
                      <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                        {totalApr ? formatPercent(Number(totalApr)) : '-'}
                      </ThemedText.BodySmall>
                    </AutoColumn>
                    <VerticalDivider />
                    <AutoColumn gap="15px" grow={true}>
                      <AutoRow justify="space-between">
                        <ThemedText.BodySmall fontWeight={500}>Fee APR:</ThemedText.BodySmall>
                        <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                          {feeApr !== undefined ? formatPercent(Number(feeApr)) : '-'}
                        </ThemedText.BodySmall>
                      </AutoRow>
                      <AutoRow justify="space-between">
                        <ThemedText.BodySmall fontWeight={500}>STRK APR:</ThemedText.BodySmall>
                        <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                          {apr ? formatPercent(Number(apr)) : '-'}
                        </ThemedText.BodySmall>
                      </AutoRow>
                    </AutoColumn>
                  </AutoRow>
                </AutoColumn>
                <Divider />
                <AutoColumn gap="16px">
                  <VaultName>{currentVault.provider.name}</VaultName>
                  <img src={currentVault.lpStrategyGraph} />
                  {/* update later - img takes time to load issue */}
                  <VaultStrategyType>{currentVault.strategyType}</VaultStrategyType>
                  <VaultStrategyDetail dangerouslySetInnerHTML={{ __html: currentVault.details }} />
                  <VaultStrategyLinks gap="24px">
                    <a href={currentVault.links.details} target={'_blank'}>
                      View Contract
                    </a>
                    <a href={currentVault.links.details} target={'_blank'}>
                      View Details
                    </a>
                  </VaultStrategyLinks>
                </AutoColumn>
              </VaultDetailsContainer>
              <VaultElement />
            </PageContentWrapper>
          </AutoColumn>
        )
      }
    }
  }

  return (
    <PageWrapper>
      <BreadcrumbsRow>
        <Breadcrumbs>
          <ArrowLeft width={20} />
          <BreadcrumbsNavLink to={'/vaults/'}>Back to vaults</BreadcrumbsNavLink>
        </Breadcrumbs>
      </BreadcrumbsRow>
      {getContent()}
    </PageWrapper>
  )
}

export function VaultElement() {
  const [activeButton, setActiveButton] = useState<string>('Deposit')

  const vaultElement = (
    <VaultWrapper>
      <VaultHeader activeButton={activeButton} setActiveButton={setActiveButton} />
      <FullDivider />
    </VaultWrapper>
  )

  return vaultElement
}
