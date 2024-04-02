import { Trans } from '@lingui/macro'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useAccountDetails } from 'hooks/starknet-react'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, ChevronDown, ChevronsRight, Inbox, Layers } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'
import { Box as RebassBox } from 'rebass'
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
import { FlattenedPositions, useV3PositionsFromTokenId } from 'hooks/useV3Positions'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { ThemedText } from 'theme/components'
import { LoadingRows } from './styled'
import fetchTokenIds from 'api/fetchTokenId'
import { getAllPools } from 'graphql/data/PoolsData'
import { useAllLists } from 'state/lists/hooks'
import Pools from 'components/Pools'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { formattedNum, formattedPercent } from 'utils/dashboard'

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
const PanelWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
`
const panelPseudo = css`
  :after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
  }

  @media only screen and (min-width: 40em) {
    :after {
      content: unset;
    }
  }
`

const Panel = styled(RebassBox)`
  position: relative;
  background-color: ${({ theme }) => theme.advancedBG};
  border-radius: 8px;
  padding: 1.25rem;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset, 0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset, 0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset;

  :hover {
    cursor: ${({ hover }) => hover && 'pointer'};
    border: ${({ hover, theme }) => hover && '1px solid' + theme.bg5};
  }

  ${(props) => props.background && `background-color: ${props.theme.advancedBG};`}

  ${(props) => (props.area ? `grid-area: ${props.area};` : null)}

  ${(props) =>
    props.grouped &&
    css`
      @media only screen and (min-width: 40em) {
        &:first-of-type {
          border-radius: 20px 20px 0 0;
        }
        &:last-of-type {
          border-radius: 0 0 20px 20px;
        }
      }
    `}

  ${(props) =>
    props.rounded &&
    css`
      border-radius: 8px;
      @media only screen and (min-width: 40em) {
        border-radius: 10px;
      }
    `};

  ${(props) => !props.last && panelPseudo}
`
const PanelTopLight = styled(Panel)`
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.20) inset, 0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.30) inset, 0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.30) inset, 0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.30) inset, 0px 5.388px 8.467px -3.079px #FFF inset, 0px 30.021px 43.107px -27.712px rgba(255, 255, 255, 0.50) inset;
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

function PositionDetails(props: any) {
  const { address } = useAccountDetails()
  const { tokenIds, showConnectAWallet, toggleWalletDrawer } = props
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
  const { positions, loading: positionsLoading } = useV3PositionsFromTokenId(tokenIds, address)
  const theme = useTheme()
  const [openPositions, closedPositions] = positions?.reduce<[FlattenedPositions[], FlattenedPositions[]]>(
    (acc, p) => {
      acc[!parseInt(p.liquidity.toString()) ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const userSelectedPositionSet = useMemo(
    () => [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)],
    [closedPositions, openPositions, userHideClosedPositions]
  )

  return (
    <>
      <>
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
                <Trans>Your active liquidity positions will appear here.</Trans>
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
      </>
      {/* {userSelectedPositionSet.length ? null : <CTACards />} */}
    </>
  )
}

export default function Pool() {
  const [poolsData, setpoolsData] = useState<any[] | undefined>([])
  const { address, chainId } = useAccountDetails()
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [loadingPositions, setLoadingPositions] = useState<boolean>(false)
  const [showMyPositions, setShowMyPositions] = useState<boolean>(false)
  //fetch Token Ids
  useEffect(() => {
    const getTokenIds = async () => {
      if (address && chainId) {
        setLoadingPositions(true)
        const result = await fetchTokenIds(address, chainId)
        if (result && result.data) {
          const tokenIdsArray: number[] = result.data.map((item: any) => parseInt(item.token_id))
          setTokenIds(tokenIdsArray)
        }
        setLoadingPositions(false)
      }
    }

    getTokenIds()
  }, [chainId, address])

  const lists = useAllLists()

  //fetch pools data
  useEffect(() => {
    const getPoolsData = async () => {
      if (!lists['https://static.jediswap.xyz/tokens-list/jediswap-default.tokenlist.json'].current) {
        return
      }
      const whitelistedIds = lists['https://static.jediswap.xyz/tokens-list/jediswap-default.tokenlist.json'].current.tokens.map(token => token.address)
      whitelistedIds.push('0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7') //add ETH token
      const poolsDataRaw = await getAllPools(whitelistedIds)
      const poolsData = {}
      poolsDataRaw?.forEach(data => {
        poolsData[data.poolAddress] = data;
      });
      setpoolsData(poolsData);
    }

    getPoolsData()
  }, [lists])

  const toggleWalletDrawer = useToggleAccountDrawer()
  // const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!address)
  const poolsTable = (<Panel style={{ padding: '0' }}>
    <Pools pairs={poolsData} disbaleLinks={true} />
  </Panel>)
  const totalValueLockedUSD = 10
  const liquidityChangeUSD = 20 
  const totalVolumeUSD = 0 
  const volumeChangeUSD = 0
  const totalFeesUSD = 0
  const feesChangeUSD = 0

  return (
    <PageWrapper>
      POOLS
      {/* <PageSection> */}
        <AutoColumn style={{ gap: '12px' }}>
          <PanelWrapper>
            <PanelTopLight>
              <AutoColumn gap="20px">
                <RowBetween>
                  {/* <TYPE.subHeader> */}
                    Total Liquidity
                  {/* </TYPE.subHeader> */}
                </RowBetween>
                <RowBetween align="baseline">
                  {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                    {formattedNum(totalValueLockedUSD, true)}
                  {/* </TYPE.main> */}
                  {/* <TYPE.main fontSize="1rem"> */}
                    {formattedPercent(liquidityChangeUSD)}
                  {/* </TYPE.main> */}
                </RowBetween>
              </AutoColumn>
            </PanelTopLight>
            <PanelTopLight>
              <AutoColumn gap="20px">
                <RowBetween>
                  {/* <TYPE.subHeader> */}
                    Volume (24hr)
                  {/* </TYPE.subHeader> */}
                  <div />
                </RowBetween>
                <RowBetween align="baseline">
                  {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                    {formattedNum(totalVolumeUSD, true)}
                  {/* </TYPE.main> */}
                  {/* <TYPE.main fontSize="1rem"> */}
                    {formattedPercent(volumeChangeUSD)}
                  {/* </TYPE.main> */}
                </RowBetween>
              </AutoColumn>
            </PanelTopLight>
            <PanelTopLight>
              <AutoColumn gap="20px">
                <RowBetween>
                  {/* <TYPE.subHeader> */}
                    Total fees (24hr)
                  {/* </TYPE.subHeader> */}
                </RowBetween>
                <RowBetween align="baseline">
                  {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                    {formattedNum(totalFeesUSD, true)}
                  {/* </TYPE.main> */}
                  {/* <TYPE.main fontSize="1rem"> */}
                    {formattedPercent(feesChangeUSD)}
                  {/* </TYPE.main> */}
                </RowBetween>
              </AutoColumn>
            </PanelTopLight>
          </PanelWrapper>
        </AutoColumn>
      {/* </PageSection> */}

      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <ToggleWrapper width="fit-content">
            <ToggleElement isActive={false} fontSize="12px" style={{ borderRadius: '4px 0 0 4px' }} onClick={() => setShowMyPositions(false)}>
              Top Pools
            </ToggleElement>
            <ToggleElement isActive={true} fontSize="12px" style={{ borderRadius: '0 4px 4px 0' }} onClick={() => setShowMyPositions(true)}>
              My positions
            </ToggleElement>
          </ToggleWrapper>
          <ButtonRow justifyContent={'space-between'}>
            {/* <PositionsText>My Positions</PositionsText> */}
            <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
              + <Trans>New position</Trans>
            </ResponsiveButtonPrimary>
          </ButtonRow>
          <MainContentWrapper>
            {showMyPositions ?
              loadingPositions ? (
                <PositionsLoadingPlaceholder />
              ) : (
                <PositionDetails
                  tokenIds={tokenIds}
                  showConnectAWallet={showConnectAWallet}
                  toggleWalletDrawer={toggleWalletDrawer}
                />)
              : poolsTable
            }
          </MainContentWrapper>
          {/* {userSelectedPositionSet.length ? null : <CTACards />} */}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
