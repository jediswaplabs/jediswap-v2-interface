import React, { useState, useEffect, useMemo } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
// import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import { renderToStaticMarkup } from 'react-dom/server'
import { Tooltip as ReactTooltip } from 'react-tooltip'

// import { CustomLink } from '../Link'
import { Link as CustomLink, Link } from 'react-router-dom'
import { Divider } from '../../components'
// import { withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils/dashboard.js'
import DoubleTokenLogo from '../DoubleLogo'

import FormattedName from '../FormattedName'
// import { TYPE } from '../../Theme'
import { AutoColumn } from '../Column'
// import { useWhitelistedTokens } from '../../contexts/Application'
import Row, { AutoRow, RowFixed } from '../Row'
import FeeBadge from 'components/FeeBadge'
import { darkTheme } from 'theme/colors'
import { MEDIA_WIDTHS } from 'theme'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAccountDetails } from 'hooks/starknet-react'
import { validateAndParseAddress } from 'starknet'
import { WETH } from 'constants/tokens'
import StarknetIcon from 'assets/svg/starknet.svg'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div<{ faded?: boolean }>`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.jediBlue)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;
  :hover {
    cursor: pointer;
  }
`
const ViewAll = styled.div`
  text-align: center;
  margin: 15px 0;
  a {
    color: ${({ theme }) => theme.jediBlue};
    text-decoration: none;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`
const PlaceholderContainer = styled.div`
  padding: 20px;
`

const DashGrid = styled.div<{ fade?: boolean; disbaleLinks?: boolean; focus?: boolean; center?: boolean }>`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';
  padding: 0 1.125rem;

  opacity: ${({ fade }) => (fade ? '0.6' : '1')};

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 740px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.7fr 1fr 1fr};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    padding: 0 1.125rem;
    grid-template-columns: 2.7fr 1fr 1fr  1fr 1fr;
    grid-template-areas: ' name liq vol  fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 2.7fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol fees apy';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text) <{ area: string }>`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`

const DataText = styled(Flex) <{ area?: string }>`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const LinkRow = styled(Link)`
  align-items: center;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.neutral1};
  padding: 16px;
  text-decoration: none;
  font-weight: 535;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.deprecated_hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`
const Rewards = styled.div`
  display: flex;
  flex-direction: row;
`
const StrkBadgeOuter = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 2px;
  border: 1px solid #EC796B;
  background: #0C0C4F;
  padding: 3px;
  width: 48px;
  height: 16px;
  // flex-shrink: 0;
  align-items: center;
`
const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = (field: number) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return 'totalValueLockedUSD'
    case SORT_FIELD.VOL:
      return 'oneDayVolumeUSD'
    case SORT_FIELD.VOL_7DAYS:
      return 'oneWeekVolumeUSD'
    case SORT_FIELD.FEES:
      return 'oneDayFeesUSD'
    default:
      return 'totalValueLockedUSD'
  }
}

const formatDataText = (
  value: string | 0 | JSX.Element,
  trackedValue: string,
  supressWarning = false,
  textAlign: CanvasTextAlign = 'right'
) => {
  return (
    <AutoColumn gap="2px">
      <div style={{ textAlign }}>{value}</div>
    </AutoColumn>
  )
}

const DEFAULT_NO_PAIRS_PLACEHOLDER_TEXT = 'Pairs will appear here'

function PairList({
  pairs,
  color,
  disbaleLinks,
  maxItems = 10,
  useTracked = false,
  waitForData = true,
  noPairsPlaceholderText = DEFAULT_NO_PAIRS_PLACEHOLDER_TEXT,
}: {
  pairs: any
  color?: string
  disbaleLinks?: boolean
  maxItems?: number
  useTracked?: boolean
  waitForData?: boolean
  noPairsPlaceholderText?: string
}) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')
  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems
  const { chainId } = useAccountDetails()
  const allTokens = useDefaultActiveTokens(chainId)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  const filteredPairsAddresses = useMemo(() => {
    return (
      pairs &&
      Object.keys(pairs).filter((address) => {
        return true
      })
    )
  }, [pairs])

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (filteredPairsAddresses) {
      let extraPages = 1
      if (filteredPairsAddresses.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(filteredPairsAddresses.length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, filteredPairsAddresses])

  const ListItem = ({
    pairAddress,
    pairData,
    index,
    doubleCurrencyImageData,
  }: {
    pairAddress: string
    pairData: any
    index: number
    doubleCurrencyImageData: any
  }) => {
    const feePercent = (pairData ? parseFloat(pairData.fee) / 10000 : 0) + '%'
    let rewardsBadges = null;
    const strkBadge = <StrkBadgeOuter>
      <div>
        <img src={StarknetIcon} style={{ width: '10px' }} />
      </div>
      <div>STRK</div>
    </StrkBadgeOuter>
    if (pairData.rewarded) {
      rewardsBadges = <Rewards>
        <div style={{ marginRight: '4px', fontSize: '0.75rem' }}>Rewards:</div>
        {pairData.aprStarknet && strkBadge}
      </Rewards>
    }
    if (pairData && pairData.token0 && pairData.token1) {
      const feeTier = pairData.fee / 10 ** 6
      const liquidity = formattedNum(pairData.totalValueLockedUSD, true)

      const volume = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked,
        true
      )

      const fees = formattedNum(pairData.oneDayFeesUSD, true)

      const feeRatio24H = pairData.oneDayFeesUSD / pairData.totalValueLockedUSD
      const apy = ((1 + feeRatio24H) ** 365 - 1) * 100
      const cleanedApy = isNaN(apy) || !isFinite(apy) ? 0 : apy
      const displayApy = formattedPercent(cleanedApy, true)
      const getTooltipMarkup = () => {
        return (
          <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Flex style={{ gap: '20px', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>Fee APR:</span> {displayApy}</Flex>
            <Flex style={{ gap: '20px', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>STRK APR:</span> {displayApy}</Flex>
          </div>
        )
      }

      const weekVolume = formattedNum(
        pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked,
        true
      )

      // const weekVolume = Math.round(pairData.oneWeekVolumeUSD)
      if (below1080) {
        return (
          <Link to={'/expore/pools/' + pairAddress} style={{ color: 'unset', textDecoration: 'none' }}>
            <div style={{ margin: '10px 0', padding: '20px', borderRadius: '8px', border: '1px solid #959595' }}>
              <div style={{ display: 'flex' }}>
                {doubleCurrencyImageData && (
                  <DoubleTokenLogo
                    size={below600 ? 16 : 20}
                    currency0={doubleCurrencyImageData.token0}
                    currency1={doubleCurrencyImageData.token1}
                    margin
                  />
                )}
                <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap', marginLeft: '10px' }}>
                  {/* <LinkRow to={'/pool/' + pairAddress}> */}
                  <FormattedName
                    text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                    maxCharacters={below600 ? 8 : 16}
                    adjustSize={true}
                    link={false}
                  />
                  {/* </LinkRow> */}
                  <FeeBadge>{feePercent}</FeeBadge>
                </AutoRow>
              </div>
              <div style={{ color: 'white', display: 'flex', columnGap: '30px', marginTop: '10px' }}>
                <div>
                  <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Liquidity</div>
                  <div>{formatDataText(liquidity, pairData.totalValueLockedUSD, false, 'left')}</div>
                </div>
                <div>
                  <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Volume (24H)</div>
                  <div>{formatDataText(volume, pairData.oneDayVolumeUSD, false, 'left')}</div>
                </div>
                <div>
                  <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Fees (24H)</div>
                  <div>{formatDataText(fees, pairData.oneDayVolumeUSD, false, 'left')}</div>
                </div>
              </div>
            </div>
          </Link>
        )
      }
      return (
        <Link to={'/expore/pools/' + pairAddress} style={{ color: 'unset', textDecoration: 'none' }}>
          <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
            <DataText area="name" fontWeight="500">
              {/* {!below600 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>} */}
              {doubleCurrencyImageData && (
                <DoubleTokenLogo
                  size={below600 ? 16 : 20}
                  currency0={doubleCurrencyImageData.token0}
                  currency1={doubleCurrencyImageData.token1}
                  margin
                />
              )}
              <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap', marginLeft: '10px' }}>
                <FormattedName
                  text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                  maxCharacters={below600 ? 8 : 16}
                  adjustSize={true}
                  link={false}
                />
                <FeeBadge>{feePercent}</FeeBadge>
              </AutoRow>
              {rewardsBadges}
            </DataText>
            <DataText area="liq">{formatDataText(liquidity, pairData.totalValueLockedUSD)}</DataText>
            <DataText area="vol">{formatDataText(volume, pairData.oneDayVolumeUSD)}</DataText>
            {/* {!below1080 && <DataText area="volWeek">{formatDataText(weekVolume, pairData.oneWeekVolumeUSD)}</DataText>} */}
            {!below1080 && <DataText area="fees">{formatDataText(fees, pairData.oneDayVolumeUSD)}</DataText>}
            {!below1080 && (
              <DataText area="apy" color={darkTheme.jediBlue} className="apr-wrapper" data-tooltip-html={pairData.rewarded ? renderToStaticMarkup(getTooltipMarkup()) : null} data-tooltip-place="bottom-start" data-tooltip-offset={-20}>
                {formatDataText(displayApy, pairData.oneDayVolumeUSD, pairData.oneDayVolumeUSD === 0)}
              </DataText>
            )}
          </DashGrid>
        </Link>
      )
    } else {
      return null
    }
  }

  const pairList =
    filteredPairsAddresses &&
    filteredPairsAddresses
      .filter((address: string) => (useTracked ? !!pairs[address].totalValueLockedUSD : true))
      .sort((addressA: string, addressB: string) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        if (pairA.rewarded && !pairB.rewarded) {
          return -1
        }
        if (!pairA.rewarded && pairB.rewarded) {
          return 1
        }
        if (sortedColumn === SORT_FIELD.APY) {
          const pairAFeeRation24H = pairA.oneDayFeesUSD / pairA.totalValueLockedUSD
          const pairBFeeRation24H = pairB.oneDayFeesUSD / pairB.totalValueLockedUSD
          const apy0 = ((1 + pairAFeeRation24H) ** 365 - 1) * 100
          const apy1 = ((1 + pairBFeeRation24H) ** 365 - 1) * 100
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn)]) > parseFloat(pairB[FIELD_TO_VALUE(sortedColumn)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress: string, index: number) => {
        const pairData = pairs[pairAddress]
        let doubleCurrencyImageData = undefined
        if (pairData && pairData.token0 && pairData.token1 && chainId) {
          doubleCurrencyImageData = {
            token0:
              pairData.token0.symbol === 'ETH'
                ? WETH[chainId]
                : allTokens[validateAndParseAddress(pairData.token0.tokenAddress)],
            token1:
              pairData.token1.symbol === 'ETH'
                ? WETH[chainId]
                : allTokens[validateAndParseAddress(pairData.token1.tokenAddress)],
          }
          console.log('doubleCurrencyImageData', doubleCurrencyImageData)
        }
        return (
          pairAddress && (
            <div key={index}>
              <ListItem
                key={index}
                index={(page - 1) * ITEMS_PER_PAGE + index + 1}
                pairData={pairData}
                pairAddress={pairAddress}
                doubleCurrencyImageData={doubleCurrencyImageData}
              />
              {!below1080 && <Divider />}
            </div>
          )
        )
      })

  //   if (!pairList) {
  //     return <LocalLoader />
  //   }

  //   if (waitForData && !pairList.length) {
  //     return <LocalLoader />
  //   }

  if (!waitForData && !pairList.length) {
    return (
      <PlaceholderContainer>
        {/* <TYPE.main fontSize={'16px'} fontWeight={'400'}> */}
        {noPairsPlaceholderText}
        {/* </TYPE.main> */}
      </PlaceholderContainer>
    )
  }

  return (
    <ListWrapper>
      {!below1080 && (
        <>
          <DashGrid
            center={true}
            disbaleLinks={disbaleLinks}
            style={{ height: 'fit-content', padding: '1rem 1.125rem 1rem 1.125rem', backgroundColor: '#ffffff33' }}
          >
            <Flex alignItems="center" justifyContent="flexStart">
              {/* <TYPE.main area="name"> */}
              Pool Name
              {/* </TYPE.main> */}
            </Flex>
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="liq"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.LIQ)
                  setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
                }}
              >
                Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area="vol"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.VOL)
                  setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
                }}
              >
                Volume (24H)
                {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            {/* {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="volWeek"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.VOL_7DAYS)
                    setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
                  }}
                >
                  Volume (7D) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )} */}
            {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="fees"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.FEES)
                    setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
                  }}
                >
                  Fees (24H) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
            {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="apy"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.APY)
                    setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection)
                  }}
                >
                  1 yr Fee/Liquidity {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
          </DashGrid>
          <Divider />
        </>
      )}
      <List p={0}>{pairList}</List>
      <ViewAll>
        <a href="https://info.v2.jediswap.xyz/pools" target="_blank">
          View all
        </a>
      </ViewAll>
      <ReactTooltip
        anchorSelect=".apr-wrapper"
        style={{
          background: '#141451',
          color: '#ffffff',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.20)'
        }}
        // arrowColor="#763daf"
        noArrow={true}
        opacity={1}
      />
    </ListWrapper>
  )
}

// export default withRouter(PairList)
export default PairList