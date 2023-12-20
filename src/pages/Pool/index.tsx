import { Trans } from '@lingui/macro'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useAccountDetails } from 'hooks/starknet-react'
import { useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, ChevronDown, ChevronsRight, Inbox, Layers } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'
import { PositionDetails } from 'types/position'

import { Trace, TraceEvent } from 'analytics'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonGray, ButtonPrimary, ButtonText } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { FlyoutAlignment, Menu } from 'components/Menu'
import PositionList from 'components/PositionList'
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { isSupportedChain } from 'constants/chains'
// import { useFilterPossiblyMaliciousPositions } from 'hooks/useFilterPossiblyMaliciousPositions'
import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
import { useV3Positions } from 'hooks/useV3Positions'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { HideSmall, ThemedText } from 'theme/components'
import CTACards from './CTACards'
import { LoadingRows } from './styled'
import WalletIcon from '../../assets/wallets/Wallet.png'
import NoPositionsIcon from '../../assets/images/noPosition.png'
import { useContractRead } from '@starknet-react/core'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'
import { NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 920px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.neutral2};
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    padding-left: 12px;
  }
`
const PoolStats = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    grid-template-columns: 1fr;
  }
`

const PoolsCard = styled.div`
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(38px);
  background-color: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;
  color: ${({ theme }) => theme.jediWhite};
`
const PoolsCardHeader = styled.div`
  color: ${({ theme }) => theme.notice};
  font-family: DM Sans;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
  margin-bottom: 20px;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    font-size: 14px;
  }
`
const PoolsCardDetails = styled.div`
  display: flex;
  align-items: center;
`

const PoolsCardNumbers = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: DM Sans;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    font-size: 18px;
  }
`

const PoolsCardPercent = styled.div`
  color: ${({ theme }) => theme.signalGreen};
  text-align: right;
  margin-left: auto;
  font-family: DM Sans;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    font-size: 12px;
  }
`
const PoolsCardPercentNegative = styled(PoolsCardPercent)`
  color: ${({ theme }) => theme.signalRed};
`

const NoPositions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 25vh;
  height: 240px;
`

const NewPositionText = styled.div`
  margin-top: 12px;
  margin-bottom: 20px;
`

const PoolsHeading = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: 'Avenir LT Std', sans-serif;
  text-transform: uppercase;
  font-size: 24px;
  font-weight: 750;
`
const PositionsText = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: DM Sans;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 20px */
`
const ButtonRow = styled(AutoRow)``

const PoolMenu = styled(Menu)`
  margin-left: 0;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex: 1 1 auto;
  }

  a {
    width: 100%;
  }
`
const PoolMenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: 535;
`
const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  margin-right: 8px;
`

const MoreOptionsText = styled(ThemedText.BodyPrimary)`
  align-items: center;
  display: flex;
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

const IconWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`

const NetworkIcon = styled(AlertTriangle)`
  ${IconStyle}
`

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 8px;
  font-size: 16px;
  padding: 6px 8px;
  width: 175px;
  margin-left: auto;
  height: 38px;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 132px;
  }
`

const MainContentWrapper = styled.main<{ isWalletConnected?: boolean; filteredPositions?: any }>`
  background-color: ${({ theme, isWalletConnected, filteredPositions }) =>
    isWalletConnected && filteredPositions ? 'rgba(196, 196, 196, 0.01)' : theme.jediNavyBlue};
  border-radius: 8px;
  box-shadow: ${({ isWalletConnected, filteredPositions }) =>
    isWalletConnected && filteredPositions
      ? `0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
        0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
        0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
        0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset`
      : ''};
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
  }
`

const PositionWrapper = styled.div``

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  )
}

function WrongNetworkCard() {
  const theme = useTheme()

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding="0">
              <ThemedText.LargeHeader>
                <Trans>Pools</Trans>
              </ThemedText.LargeHeader>
            </TitleRow>

            <MainContentWrapper>
              <ErrorContainer>
                <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
                  <NetworkIcon strokeWidth={1.2} />
                  <div data-testid="pools-unsupported-err">
                    <Trans>Your connected network is unsupported.</Trans>
                  </div>
                </ThemedText.BodyPrimary>
              </ErrorContainer>
            </MainContentWrapper>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default function Pool() {
  const { address, chainId } = useAccountDetails()
  const toggleWalletDrawer = useToggleAccountDrawer()

  const theme = useTheme()
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  const { positions, loading: positionsLoading } = useV3Positions(address)

  const {
    data: positionsV3,
    isError,
    isLoading,
    error,
  } = useContractRead({
    functionName: 'balance_of',
    args: [address as string],
    abi: NFTPositionManagerABI,
    address: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
    watch: true,
  })

  const [openPositions, closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const userSelectedPositionSet = useMemo(
    () => [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)],
    [closedPositions, openPositions, userHideClosedPositions]
  )

  // const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!address)

  return (
    <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            {/* <TitleRow padding="0">
              <ThemedText.LargeHeader>
                <PoolsHeading>Pools</PoolsHeading>
              </ThemedText.LargeHeader>
            </TitleRow> */}
            {/* <PoolStats>
              <PoolsCard>
                <PoolsCardHeader>Total Liquidity</PoolsCardHeader>
                <PoolsCardDetails>
                  <PoolsCardNumbers>US$16,006,030</PoolsCardNumbers>
                  <PoolsCardPercent>+0.70%</PoolsCardPercent>
                </PoolsCardDetails>
              </PoolsCard>
              <PoolsCard>
                <PoolsCardHeader>Total Volume (24hr)</PoolsCardHeader>
                <PoolsCardDetails>
                  <PoolsCardNumbers>US$3,001,359</PoolsCardNumbers>
                  <PoolsCardPercent>+40.09%</PoolsCardPercent>
                </PoolsCardDetails>
              </PoolsCard>
              <PoolsCard>
                <PoolsCardHeader>Total Fees (24hr)</PoolsCardHeader>
                <PoolsCardDetails>
                  <PoolsCardNumbers>US$16,006,030</PoolsCardNumbers>
                  <PoolsCardPercentNegative>-1.96%</PoolsCardPercentNegative>
                </PoolsCardDetails>
              </PoolsCard>
            </PoolStats> */}
            <ButtonRow justifyContent={'space-between'}>
              <PositionsText>My Positions</PositionsText>
              <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
                + <Trans>New position</Trans>
              </ResponsiveButtonPrimary>
            </ButtonRow>
            <MainContentWrapper>
              {positionsLoading ? (
                <PositionsLoadingPlaceholder />
              ) : userSelectedPositionSet && userSelectedPositionSet.length > 0 ? (
                <PositionList
                  positions={userSelectedPositionSet}
                  setUserHideClosedPositions={setUserHideClosedPositions}
                  userHideClosedPositions={userHideClosedPositions}
                />
              ) : (
                <ErrorContainer>
                  <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
                    <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                    <div>
                      <Trans>Your active V3 liquidity positions will appear here.</Trans>
                    </div>
                  </ThemedText.BodyPrimary>
                  {!showConnectAWallet && closedPositions.length > 0 && (
                    <ButtonText
                      style={{ marginTop: '.5rem' }}
                      onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}
                    >
                      <Trans>Show closed positions</Trans>
                    </ButtonText>
                  )}
                  {showConnectAWallet && (
                    <ButtonPrimary
                      style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px', width: 'fit-content' }}
                      onClick={toggleWalletDrawer}
                    >
                      <Trans>Connect wallet</Trans>
                    </ButtonPrimary>
                  )}
                </ErrorContainer>
              )}
            </MainContentWrapper>
            {userSelectedPositionSet.length ? null : <CTACards />}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </Trace>
  )
}
