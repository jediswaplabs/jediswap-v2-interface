import { Trans } from '@lingui/macro'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useAccountDetails } from 'hooks/starknet-react'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, ChevronDown, ChevronsRight, Inbox, Layers } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'
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
import vaultImage from '../../assets/images/vault.png'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { ThemedText } from 'theme/components'
import { LoadingRows } from './styled'
import fetchTokenIds from 'api/fetchTokenId'
import { useMedia } from 'react-use'

interface PromotionBannerContainerProps {
  noDecorations: boolean
}

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 920px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`
const PromotionBannerContainer = styled.div<PromotionBannerContainerProps>`
  display: flex;
  border-radius: 8px;
  background: linear-gradient(90deg, #141451 0%, #2c045c 52%, #64099c 100%);
  position: relative;
  padding-left: ${(props) => (props.noDecorations ? '0' : '140px')};
  overflow: hidden;
`

const PromotionBannerDecoration = styled.img`
  position: absolute;
  left: -45px;
  top: -30px;
  max-width: 190px;
  user-select: none;
`

const PromotionBannerContent = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
`
const PromotionBannerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const PromotionBannerTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  line-height: 20px;
`
const PromotionBannerDescription = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  text-align: left;
`
const PromotionBannerLink = styled.a`
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: rgba(42, 170, 254, 1);
  text-decoration: none;
`
const PromotionBannerButton = styled(ButtonPrimary)`
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

const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.neutral2};
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    padding-left: 12px;
  }
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

function PromotionalBanner({ noDecorations = false }) {
  return (
    <PromotionBannerContainer noDecorations={noDecorations}>
      {!noDecorations && <PromotionBannerDecoration src={vaultImage} draggable={false} />}
      <PromotionBannerContent>
        <PromotionBannerDetails>
          <PromotionBannerTitle>Add liquidity via our Vault strategy</PromotionBannerTitle>
          <PromotionBannerDescription>
            Let us dynamically manage your LP ranges. Enter/exit at any time.{' '}
            <PromotionBannerLink href="https://www.jediswap.xyz/" target="_blank" rel="noopener">
              Learn more.
            </PromotionBannerLink>
          </PromotionBannerDescription>
        </PromotionBannerDetails>
        <PromotionBannerButton data-cy="try-vault-button" id="try-vault-button" as={Link} to="/vaults">
          <Trans>Try Vaults</Trans>
        </PromotionBannerButton>
      </PromotionBannerContent>
    </PromotionBannerContainer>
  )
}

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
  const { address, chainId } = useAccountDetails()
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [loadingPositions, setLoadingPositions] = useState<boolean>(false)

  const below600 = useMedia('(max-width: 600px)')
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

  const toggleWalletDrawer = useToggleAccountDrawer()
  // const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!address)

  return (
    <PageWrapper>
      <AutoColumn gap="xl" justify="center">
        <AutoColumn gap="xl" style={{ width: '100%' }}>
          <PromotionalBanner noDecorations={below600} />
          <ButtonRow justifyContent={'space-between'}>
            <PositionsText>My Positions</PositionsText>
            <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
              + <Trans>New position</Trans>
            </ResponsiveButtonPrimary>
          </ButtonRow>
          <MainContentWrapper>
            {loadingPositions ? (
              <PositionsLoadingPlaceholder />
            ) : (
              <PositionDetails
                tokenIds={tokenIds}
                showConnectAWallet={showConnectAWallet}
                toggleWalletDrawer={toggleWalletDrawer}
              />
            )}
          </MainContentWrapper>
          {/* {userSelectedPositionSet.length ? null : <CTACards />} */}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
