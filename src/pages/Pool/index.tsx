import { Trans } from '@lingui/macro'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useAccountDetails } from 'hooks/starknet-react'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, ChevronDown, ChevronsRight, Inbox, Layers } from 'react-feather'
import Switch from 'react-switch'
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
import Pools from 'components/Pools'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { formattedNum, formattedPercent, get2DayPercentChange, getPercentChange } from 'utils/dashboard'
import { REWARDS_SELECTOR, STARKNET_REWARDS_API_URL } from 'constants/misc'
import { HISTORICAL_GLOBAL_DATA } from 'graphql/data/queries'
import { apiTimeframeOptions } from 'constants/dashboardApi'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { providerInstance } from 'utils/getLibrary'
import { cairo, hash, num, uint256 } from 'starknet'
import JSBI from 'jsbi'
import { getClient } from 'apollo/client'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useDefaultActiveTokens } from 'hooks/Tokens'

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 1020px;
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
  font-family: 'DM Sans';
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

const ResponsiveButtonTabs = styled(ButtonPrimary) <{ secondary: boolean; active: boolean }>`
  font-family: 'DM Sans';
  border-radius: 4px;
  font-size: 16px;
  padding: 6px 8px;
  background: ${({ theme, active }) => (!active ? 'transparent' : theme.jediWhite)};
  box-shadow: 0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset;
  color: ${({ theme, active }) => (!active ? theme.jediWhite : theme.jediPink)};
  width: 121px;
  margin-left: 0;
  height: 38px;
  &:hover {
    background: ${({ theme, active }) => (!active ? 'transparent' : theme.jediWhite)};
    color: ${({ theme, active }) => (!active ? theme.jediWhite : theme.jediPink)};
  }
  &:active {
    background: ${({ theme, active }) => (!active ? 'transparent' : theme.jediWhite)};
    color: ${({ theme, active }) => (!active ? theme.jediWhite : theme.jediPink)};
  }
  &:focus {
    background: ${({ theme, active }) => (!active ? 'transparent' : theme.jediWhite)};
    color: ${({ theme, active }) => (!active ? theme.jediWhite : theme.jediPink)};
  }
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 50%;
    margin-bottom: 10px;
  }
`

const MainContentWrapper = styled.main<{ isWalletConnected?: boolean; filteredPositions?: any }>`
  background-color: ${({ theme, isWalletConnected, filteredPositions }) =>
    isWalletConnected && filteredPositions ? 'rgba(196, 196, 196, 0.01)' : 'transparent'};
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

const Panel = styled(RebassBox) <{
  hover?: boolean
  background?: boolean
  area?: boolean
  grouped?: boolean
  rounded?: boolean
  last?: boolean
}>`
  position: relative;
  // background-color: ${({ theme }) => theme.advancedBG};
  border-radius: 8px;
  padding: 1.25rem;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset;

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
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset, 0px 5.388px 8.467px -3.079px #fff inset,
    0px 30.021px 43.107px -27.712px rgba(255, 255, 255, 0.5) inset;
`

const PageHeader = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: "Avenir LT Std";
  font-size: 24px;
  font-weight: 750;
  margin-bottom: 20px;
`

const OnlyRewardedSwitcherContainer = styled.div`
display: flex;
align-items: center;
gap: 16px;
margin: 15px 0;
`

const OnlyRewardedSwitcherLabel = styled.div`
font-family: Avenir LT Std;
font-size: 18px;
font-weight: 750;
line-height: 18px;
text-align: left;
`

const OnlyRewardedSwitcher = styled(Switch)``


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

export function PositionDetails(props: any) {
  const { address } = useAccountDetails()
  const { tokenIds, showConnectAWallet, toggleWalletDrawer, token0, token1 } = props
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
  const { positions, loading: positionsLoading } = useV3PositionsFromTokenId(tokenIds, address)
  let filteredPositions = positions
  if (token0 && token1) {
    filteredPositions = positions?.filter(pos => {
      //@ts-ignore
      //@ts-ignore
      if (pos?.token0.toString(16) === token0.slice(2) && pos?.token1.toString(16) === token1.slice(2)) {
        return true
      }
      //@ts-ignore
      if (pos?.token0.toString(16) === token1.slice(2) && pos?.token1.toString(16) === token0.slice(2)) {
        return true
      }
      return false
    })
  }
  const theme = useTheme()
  const [openPositions, closedPositions] = filteredPositions?.reduce<[FlattenedPositions[], FlattenedPositions[]]>(
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
  const [showRewardedOnly, setShowRewardedOnly] = useState(false)
  const [globalPoolsData, setGlobalPoolsData] = useState<any>({})

  //fetch Token Ids
  useEffect(() => {
    const getTokenIds = async () => {
      if (address && chainId) {
        setLoadingPositions(true)
        const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
        const contract_address = NONFUNGIBLE_POOL_MANAGER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID]
        const tokenIdsResults = await provider.callContract({
          entrypoint: 'get_all_tokens_for_owner',
          contractAddress: contract_address,
          calldata: [address],
        })
        if (tokenIdsResults && tokenIdsResults.result) {
          // Slice the first index
          const tokenIdsResultsArr = tokenIdsResults.result

          //converting array of uint256 tokenids into bn
          const tokenIdsResultsArrWithoutLength = tokenIdsResultsArr.slice(1)
          const returnDataIterator = tokenIdsResultsArrWithoutLength.flat()[Symbol.iterator]()
          const tokenIdsArray = [...Array(tokenIdsResultsArrWithoutLength.length / 2)].map(() => {
            return Number(
              uint256.uint256ToBN({ low: returnDataIterator.next().value, high: returnDataIterator.next().value })
            )
          })
          setTokenIds(tokenIdsArray)
        }
        setLoadingPositions(false)
      }
    }

    getTokenIds()
  }, [chainId, address])


  //TODO add sepolia site chainId
  const chainIdFinal = chainId || ChainId.MAINNET
  const allTokens = useDefaultActiveTokens(chainIdFinal)
  const whitelistedIds = Object.keys(allTokens)
  const graphqlClient = getClient(chainIdFinal)
  //fetch pools data
  useEffect(() => {
    let ignore = false;
    const getPoolsData = async () => {
      if (whitelistedIds.length === 0) {
        return
      }
      const poolsDataRaw = await getAllPools(graphqlClient, [...whitelistedIds, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7']) //add ETH token
      const rewardsResp = await fetch(STARKNET_REWARDS_API_URL)
      const rewardsRespStr = await rewardsResp.text()
      const rewardsRespStrClean = rewardsRespStr.replace(/\bNaN\b/g, "null")
      const rewardsRespJson = JSON.parse(rewardsRespStrClean)
      const jediRewards = rewardsRespJson[REWARDS_SELECTOR]

      const poolsData: any = {}
      poolsDataRaw?.forEach((data) => {
        const rewardName = data?.token0?.symbol + '/' + data?.token1?.symbol
        const rewardsDataList = jediRewards[rewardName]
        const rewardsData = rewardsDataList?.length ? rewardsDataList[rewardsDataList.length - 1] : null

        if (rewardsData) {
          data.aprStarknet = rewardsData.apr
        }

        data.rewarded = data.aprStarknet ? true : false

        poolsData[data.poolAddress] = data
      })
      if (!ignore) {
        setpoolsData(poolsData)
      }
    }

    getPoolsData()
    return () => {
      ignore = true
    }
  }, [Object.keys(allTokens).join(','), chainIdFinal])

  //fetch global pools data data
  useEffect(() => {
    let ignore = false;
    const getGlobalPoolsData = async () => {
      try {
        const historicalData = await graphqlClient.query({
          query: HISTORICAL_GLOBAL_DATA(),
          fetchPolicy: 'cache-first',
        })
        const oneDayData = historicalData.data.factoriesData[0][apiTimeframeOptions.oneDay]
        const twoDaysData = historicalData.data.factoriesData[0][apiTimeframeOptions.twoDays]
        if (!ignore) {
          setGlobalPoolsData({
            totalValueLockedUSD: oneDayData.totalValueLockedUSD,
            totalValueLockedUSDChange: getPercentChange(oneDayData.totalValueLockedUSD, oneDayData.totalValueLockedUSDFirst),
            volumeUSD: oneDayData.volumeUSD,
            volumeUSDChange: get2DayPercentChange(oneDayData.volumeUSD, twoDaysData.volumeUSD),
            feesUSD: oneDayData.feesUSD,
            feesUSDChange: get2DayPercentChange(oneDayData.feesUSD, twoDaysData.feesUSD),
          })
        }
      } catch (e) {
        console.log(e)
      }
    }

    getGlobalPoolsData()
    return () => {
      ignore = true
    }
  }, [chainIdFinal])

  const toggleWalletDrawer = useToggleAccountDrawer()
  // const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!address)
  const poolsTable = (
    <div>
      <OnlyRewardedSwitcherContainer>
        <OnlyRewardedSwitcherLabel>Only Pools with Rewards</OnlyRewardedSwitcherLabel>
        <OnlyRewardedSwitcher
          onChange={(checked) => setShowRewardedOnly(checked)}
          checked={showRewardedOnly}
          handleDiameter={20}
          uncheckedIcon={false}
          checkedIcon={false}
          width={35}
          height={14}
          offHandleColor={'#959595'}
          onHandleColor={'#50D5FF'}
          offColor={'#372554'}
          onColor={'#26346d'}
        />
      </OnlyRewardedSwitcherContainer>
      <Panel style={{ padding: '0' }}>
        <Pools pairs={poolsData} disbaleLinks={true} showRewardedOnly={showRewardedOnly} />
      </Panel>
    </div>
  )

  return (
    <PageWrapper>
      <PageHeader>
        POOLS
      </PageHeader>
      {/* <PageSection> */}
      <AutoColumn style={{ gap: '12px' }}>
        <PanelWrapper>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                Total Liquidity
              </RowBetween>
              <RowBetween align="baseline">
                <div>
                  {formattedNum(globalPoolsData.totalValueLockedUSD, true)}
                </div>
                <div>
                  {formattedPercent(globalPoolsData.totalValueLockedUSDChange)}
                </div>
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                Volume (24hr)
                <div />
              </RowBetween>
              <RowBetween align="baseline">
                <div>
                  {formattedNum(globalPoolsData.volumeUSD, true)}
                </div>
                <div>
                  {formattedPercent(globalPoolsData.volumeUSDChange)}
                </div>
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                Total fees (24hr)
              </RowBetween>
              <RowBetween align="baseline">
                <div>
                  {formattedNum(globalPoolsData.feesUSD, true)}
                </div>
                <div>
                  {formattedPercent(globalPoolsData.feesUSDChange)}
                </div>
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
        </PanelWrapper>
      </AutoColumn>
      {/* </PageSection> */}
      <AutoColumn gap="lg" justify="center" style={{ marginTop: 24 }}>
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <ButtonRow justifyContent={'space-between'}>
            {/* <PositionsText>My Positions</PositionsText> */}
            <ResponsiveButtonTabs secondary={false} active={!showMyPositions} onClick={() => setShowMyPositions(false)}>
              <Trans>Top Pools</Trans>
            </ResponsiveButtonTabs>
            <ResponsiveButtonTabs secondary={true} active={showMyPositions} onClick={() => setShowMyPositions(true)}>
              <Trans>My Positions</Trans>
            </ResponsiveButtonTabs>
            <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
              + <Trans>New position</Trans>
            </ResponsiveButtonPrimary>
          </ButtonRow>
          <MainContentWrapper>
            {showMyPositions ? (
              loadingPositions ? (
                <PositionsLoadingPlaceholder />
              ) : (
                <PositionDetails
                  tokenIds={tokenIds}
                  showConnectAWallet={showConnectAWallet}
                  toggleWalletDrawer={toggleWalletDrawer}
                />
              )
            ) : (
              poolsTable
            )}
          </MainContentWrapper>
          {/* {userSelectedPositionSet.length ? null : <CTACards />} */}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
