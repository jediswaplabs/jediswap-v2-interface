import { Trans } from '@lingui/macro'
import { useAccountDetails } from 'hooks/starknet-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { AutoColumn } from 'components/Column'
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { isSupportedChain } from 'constants/chains'
// import { useFilterPossiblyMaliciousPositions } from 'hooks/useFilterPossiblyMaliciousPositions'
import { useTokenIds } from 'hooks/useV3Positions'
import { ThemedText } from 'theme/components'
import { ButtonRow, ErrorContainer, LoadingRows, MainContentWrapper, NetworkIcon, OnlyRewardedSwitcher, OnlyRewardedSwitcherContainer, OnlyRewardedSwitcherLabel, PageHeader, PageWrapper, Panel, PanelTopLight, PanelWrapper, ResponsiveButtonPrimary, ResponsiveButtonTabs, TitleRow } from './styled'
import { getAllPools } from 'api/PoolsData'
import Pools from 'components/Pools'
import { formattedNum, formattedPercent, get2DayPercentChange, getPercentChange } from 'utils/formatNum'
import { HISTORICAL_GLOBAL_DATA, STRK_REWARDS_DATA } from 'apollo/queries'
import { apiTimeframeOptions } from 'constants/apiTimeframeOptions'
import { ETH_ADDRESS } from 'constants/tokens'
import { getClient } from 'apollo/client'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { PositionDetails } from './PositionDetails'
import { ApolloQueryResult } from '@apollo/client'

export function PositionsLoadingPlaceholder() {
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

function getRewardsData(jediRewards: any, pool: any) {
  if (!jediRewards) {
    return
  }
  const pair1 = (`${pool?.token0.symbol}/${pool?.token1.symbol}`).toLowerCase()
  const pair2 = (`${pool?.token1.symbol}/${pool?.token0.symbol}`).toLowerCase()
  const pairKey = Object.keys(jediRewards).find(key => key.toLowerCase() === pair1 || key.toLowerCase() === pair2)
  if (pairKey && jediRewards[pairKey]) {
    return jediRewards[pairKey]
  }
}

export default function Pool() {
  const [poolsData, setpoolsData] = useState<any[] | undefined>([])
  const { address, chainId } = useAccountDetails()

  const { tokenIds, loading: loadingPositions } = useTokenIds(address, chainId);

  const [showMyPositions, setShowMyPositions] = useState<boolean>(false)
  const [showRewardedOnly, setShowRewardedOnly] = useState(false)
  const [globalPoolsData, setGlobalPoolsData] = useState<any>({})

  const chainIdFinal = chainId || ChainId.MAINNET
  const allTokens = useDefaultActiveTokens(chainIdFinal)
  const whitelistedIds = Object.keys(allTokens)
  const graphqlClient = getClient(chainIdFinal)
  //fetch pools data and rewards data
  useEffect(() => {
    let ignore = false;
    const getPoolsData = async () => {
      if (whitelistedIds.length === 0) {
        return
      }
      const requests = [
        getAllPools(graphqlClient, [...whitelistedIds, ETH_ADDRESS]), //add ETH token
        graphqlClient.query({
          query: STRK_REWARDS_DATA(),
          fetchPolicy: 'cache-first'
        })
      ];
      const [poolsDataRawResult, rewardsRespResult] = await Promise.allSettled(requests);
      let poolsDataRaw: any = null
      if (poolsDataRawResult.status === "fulfilled") {
        poolsDataRaw = poolsDataRawResult.value as ApolloQueryResult<any>;;
      }
      let jediRewards: any = null;
      if (rewardsRespResult.status === "fulfilled") {
        const rewardsResp = rewardsRespResult.value as ApolloQueryResult<any>;
        jediRewards = rewardsResp.data?.strkGrantDataV2;
      }
      const poolsData: any = {}
      poolsDataRaw?.forEach((data: any) => {
        const rewardsData = getRewardsData(jediRewards, data)
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
      <Panel style={{ padding: '0', fontWeight: 700, fontSize: '0.875rem' }}>
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
              <RowBetween style={{ fontWeight: 700 }}>
                Total Liquidity
              </RowBetween>
              <RowBetween align="baseline">
                <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
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
              <RowBetween style={{ fontWeight: 700 }}>
                Volume (24hr)
                <div />
              </RowBetween>
              <RowBetween align="baseline">
                <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
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
              <RowBetween style={{ fontWeight: 700 }}>
                Total fees (24hr)
              </RowBetween>
              <RowBetween align="baseline">
                <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
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
            <ResponsiveButtonTabs secondary={false} active={!showMyPositions} onClick={() => setShowMyPositions(false)} style={{ fontSize: "0.875rem" }}>
              <Trans>Top Pools</Trans>
            </ResponsiveButtonTabs>
            <ResponsiveButtonTabs secondary={true} active={showMyPositions} onClick={() => setShowMyPositions(true)} style={{ fontSize: "0.875rem" }}>
              <Trans>My Positions</Trans>
            </ResponsiveButtonTabs>
            <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH" style={{ fontSize: "1.125rem", fontWeight: 750 }}>
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
