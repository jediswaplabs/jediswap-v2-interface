import { Trans } from '@lingui/macro'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
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
import Row, { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { isSupportedChain } from 'constants/chains'
import { useFilterPossiblyMaliciousPositions } from 'hooks/useFilterPossiblyMaliciousPositions'
import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
import { useV3Positions } from 'hooks/useV3Positions'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { HideSmall, ThemedText } from 'theme/components'
import CTACards from './CTACards'
import { LoadingRows } from './styled'
import WalletIcon from '../../assets/wallets/Wallet.png'
import NoPositionsIcon from '../../assets/images/noPosition.png'

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    max-width: 800px;
    padding-top: 48px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    max-width: 500px;
    padding-top: 20px;
  }
`
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.neutral2};
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  }
`
const PoolsCard = styled.div`
  margin-right: 16px;
  align-items: center;
  width: 290px;
  height: 101px;
  display: grid;
  border-radius: 8px;
  padding: 20px;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(38.48860168457031px);
`
const PoolsCardHeader = styled.div`
  color: ${({ theme }) => theme.notice};
  font-family: DM Sans;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
`
const PoolsCardDetails = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.jediWhite};
  font-family: DM Sans;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  margin-top: 20px;
`

const PoolsCardNumbers = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: DM Sans;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
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
`
const PoolsCardPercentNegative = styled.div`
  color: ${({ theme }) => theme.signalRed};
  text-align: right;
  margin-left: auto;
  font-family: DM Sans;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
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
const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-left: 8px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
`
const PoolMenu = styled(Menu)`
  margin-left: 0;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex: 1 1 auto;
    width: 50%;
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
    flex: 1 1 auto;
    width: 50%;
  }
`

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.jediNavyBlue};
  padding: 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 902px;
`

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
  const { account, chainId } = useWeb3React()
  const [isWalletConnected, setIsWalletConnected] = useState(true)
  const networkSupportsV2 = useNetworkSupportsV2()
  const toggleWalletDrawer = useToggleAccountDrawer()

  const theme = useTheme()
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  const { positions, loading: positionsLoading } = useV3Positions(account)

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

  const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!account)

  const menuItems = [
    {
      content: (
        <PoolMenuItem>
          <Trans>Migrate</Trans>
          <ChevronsRight size={16} />
        </PoolMenuItem>
      ),
      link: '/migrate/v2',
      external: false,
    },
    {
      content: (
        <PoolMenuItem>
          <Trans>V2 liquidity</Trans>
          <Layers size={16} />
        </PoolMenuItem>
      ),
      link: '/pools/v2',
      external: false,
    },
    {
      content: (
        <PoolMenuItem>
          <Trans>Learn</Trans>
          <BookOpen size={16} />
        </PoolMenuItem>
      ),
      link: 'https://support.uniswap.org/hc/en-us/categories/8122334631437-Providing-Liquidity-',
      external: true,
    },
  ]

  return (
    <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding="0">
              <ThemedText.LargeHeader>
                <PoolsHeading>Pools</PoolsHeading>
              </ThemedText.LargeHeader>
              {/* <ButtonRow>
                {networkSupportsV2 && (
                  <PoolMenu
                    menuItems={menuItems}
                    flyoutAlignment={FlyoutAlignment.LEFT}
                    ToggleUI={(props: any) => (
                      <MoreOptionsButton {...props}>
                        <MoreOptionsText>
                          <Trans>More</Trans>
                          <ChevronDown size={15} />
                        </MoreOptionsText>
                      </MoreOptionsButton>
                    )}
                  />
                )}
                <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
                  + <Trans>New position</Trans>
                </ResponsiveButtonPrimary>
              </ButtonRow> */}
            </TitleRow>
            <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
              <AutoColumn>
                <PoolsCard>
                  <PoolsCardHeader>Total Liquidity</PoolsCardHeader>
                  <PoolsCardDetails>
                    <PoolsCardNumbers>US$16,006,030</PoolsCardNumbers>
                    <PoolsCardPercent>+0.70%</PoolsCardPercent>
                  </PoolsCardDetails>
                </PoolsCard>
              </AutoColumn>
              <AutoColumn>
                <PoolsCard>
                  <PoolsCardHeader>Total Volume (24hr)</PoolsCardHeader>
                  <PoolsCardDetails>
                    <PoolsCardNumbers>US$3,001,359</PoolsCardNumbers>
                    <PoolsCardPercent>+40.09%</PoolsCardPercent>
                  </PoolsCardDetails>
                </PoolsCard>
              </AutoColumn>
              <AutoColumn>
                <PoolsCard>
                  <PoolsCardHeader>Total Fees (24hr)</PoolsCardHeader>
                  <PoolsCardDetails>
                    <PoolsCardNumbers>US$16,006,030</PoolsCardNumbers>
                    <PoolsCardPercentNegative>-1.96%</PoolsCardPercentNegative>
                  </PoolsCardDetails>
                </PoolsCard>
              </AutoColumn>
            </Row>

            <Row>
              <PositionsText>My Positions</PositionsText>
              <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
                + <Trans>New position</Trans>
              </ResponsiveButtonPrimary>
            </Row>

            <MainContentWrapper>
              {isWalletConnected ? (
                !filteredPositions.length ? (
                  <NoPositions>
                    <IconWrapper>
                      <img src={NoPositionsIcon} alt={'Icon'} />
                    </IconWrapper>
                    <NewPositionText>
                      <Trans>Open a new position</Trans>
                    </NewPositionText>
                    <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
                      + <Trans>New position</Trans>
                    </ResponsiveButtonPrimary>
                  </NoPositions>
                ) : (
                  <PositionList
                    positions={filteredPositions}
                    setUserHideClosedPositions={setUserHideClosedPositions}
                    userHideClosedPositions={userHideClosedPositions}
                  />
                )
              ) : (
                <ErrorContainer>
                  <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
                    <IconWrapper>
                      <img src={WalletIcon} alt={'Icon'} />
                    </IconWrapper>
                    <div>
                      <Trans>Connect wallet to see your positions or open a new position</Trans>
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
                    <TraceEvent
                      events={[BrowserEvent.onClick]}
                      name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                      properties={{ received_swap_quote: false }}
                      element={InterfaceElementName.CONNECT_WALLET_BUTTON}
                    >
                      <ButtonPrimary
                        style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px', width: 'fit-content' }}
                        onClick={toggleWalletDrawer}
                      >
                        <Trans>Connect wallet</Trans>
                      </ButtonPrimary>
                    </TraceEvent>
                  )}
                </ErrorContainer>
              )}
            </MainContentWrapper>
            <HideSmall>{filteredPositions.length ? null : <CTACards />}</HideSmall>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </Trace>
  )
}
