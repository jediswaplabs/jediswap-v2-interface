import styled, { css, useTheme } from 'styled-components'
import { Box as RebassBox } from 'rebass'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { validateAndParseAddress } from 'starknet'

import { AutoColumn } from "components/Column";
import Row, { AutoRow, RowBetween, RowFixed } from "components/Row";
import { formattedNum, formattedPercent } from "utils/dashboard";
import { getAllPools } from 'graphql/data/PoolsData';
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAccountDetails } from 'hooks/starknet-react'
import { WETH } from 'constants/tokens'
import DoubleTokenLogo from '../../components/DoubleLogo'
import FeeBadge from 'components/FeeBadge'
import { ButtonGray, ButtonPrimary, ButtonText } from 'components/Button'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import fetchTokenIds from 'api/fetchTokenId'
import { PositionDetails } from 'pages/Pool'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { getClient } from 'apollo/client'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { providerInstance } from 'utils/getLibrary'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { cairo, hash, num, uint256 } from 'starknet'
import { useTokenIds } from 'hooks/useV3Positions'

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 1020px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`

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
const ResponsiveButtonTabs = styled(ButtonPrimary) <{ secondary: boolean; active: boolean }>`
  font-family: 'DM Sans';
  border-radius: 4px;
  font-size: 16px;
  padding: 6px 12px;
  background: ${({ theme, active }) => (!active ? 'transparent' : theme.jediWhite)};
  box-shadow: 0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset;
  color: ${({ theme, active }) => (!active ? theme.jediWhite : theme.jediPink)};
  // width: 121px;
  margin-left: 0;
  height: 26px;
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
const FixedPanel = styled.div`
  width: fit-content;
  padding: 12px 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
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

export default function PoolDetails() {
  const { poolId } = useParams<{ poolId?: string }>()
  const [poolData, setpoolData] = useState<any | undefined>({})
  const { address, chainId } = useAccountDetails()

  const { tokenIds, loading: loadingPositions } = useTokenIds(address, chainId);

  const toggleWalletDrawer = useToggleAccountDrawer()
  const showConnectAWallet = Boolean(!address)

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
      const poolsDataRaw: any = await getAllPools(graphqlClient, [...whitelistedIds, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7']) //add ETH token
      if (poolId && poolsDataRaw) {
        const poolData: any = poolsDataRaw.find((data: any) => data?.poolAddress === poolId)
        if (!ignore) {
          if (poolData) {
            setpoolData(poolData)
          }
        }
      }
    }

    getPoolsData()
    return () => {
      ignore = true
    }
  }, [Object.keys(allTokens).join(','), chainIdFinal])


  const {
    poolAddress,
    token0,
    token1,
    fee,
    totalValueLockedUSD,
    liquidityChangeUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayFeesUSD,
    feesChangeUSD,
    totalValueLockedToken0,
    totalValueLockedToken1,
    token0Price,
    token1Price,
    loadingEnd,
  } = poolData
  let doubleCurrencyImageData = undefined
  if (poolData && poolData.token0 && poolData.token1 && chainIdFinal) {
    doubleCurrencyImageData = {
      token0:
        poolData.token0.symbol === 'ETH'
          ? WETH[chainIdFinal]
          : allTokens[validateAndParseAddress(poolData.token0.tokenAddress)],
      token1:
        poolData.token1.symbol === 'ETH'
          ? WETH[chainIdFinal]
          : allTokens[validateAndParseAddress(poolData.token1.tokenAddress)],
    }
  }
  const feePercent = (fee ? parseFloat(fee) / 10000 : 0) + '%'
  const [currentPriceDisplayMode, setCurrentPriceDisplayMode] = useState('token0')
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol

  return (
    <PageWrapper>
      <Link
        data-cy="visit-pool"
        style={{ textDecoration: 'none', width: 'fit-content', marginBottom: '0.5rem', color: '#fff' }}
        to="/pools"
      >
        ← <span style={{ color: '#50D5FF', fontWeight: 500 }}>Back to top pools</span>
      </Link>
      <Row align="center" style={{ gap: '8px', marginTop: '10px', fontSize: '1.25rem', fontWeight: 700  }}>
        {doubleCurrencyImageData && (
          <DoubleTokenLogo
            // size={below600 ? 16 : 20}
            size={20}
            currency0={doubleCurrencyImageData.token0}
            currency1={doubleCurrencyImageData.token1}
            margin
          />
        )}
        {poolData?.token0?.symbol} - {poolData?.token1?.symbol}
        <FeeBadge>{feePercent}</FeeBadge>
        <ResponsiveButtonPrimary as={Link} to={`/add/${poolData?.token0?.tokenAddress}/${poolData?.token1?.tokenAddress}/${poolData?.fee}`} style={{fontSize: "1.125rem", fontWeight: 750 }}>
          + New position
        </ResponsiveButtonPrimary>
      </Row>
      <AutoColumn gap="12px">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#141451', padding: '15px', margin: '20px 0', gap: '30px', fontWeight: 700 }}>
          {/* <TYPE.main fontSize="16px" fontWeight={500}> */}
          Current Price:
          {/* </TYPE.main> */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '1.125rem', fontWeight: 700 }}>
            {currentPriceDisplayMode === 'token0' && (
              <FixedPanel style={{ width: '100%', display: 'flex', gap: '10px' }}>
                <CurrencyLogo currency={doubleCurrencyImageData?.token0} />
                <RowFixed>{token0 && token1 ? `1 ${formattedSymbol0} = ${formattedNum(token1Price)} ${formattedSymbol1}` : '-'}</RowFixed>
              </FixedPanel>
            )}
            {currentPriceDisplayMode === 'token1' && (
              <FixedPanel style={{ width: '100%', display: 'flex', gap: '10px' }}>
                <CurrencyLogo currency={doubleCurrencyImageData?.token1} />
                <RowFixed>{token0 && token1 ? `1 ${formattedSymbol1} = ${formattedNum(token0Price)} ${formattedSymbol0}` : '-'}</RowFixed>
              </FixedPanel>
            )}
          </div>
          <div style={{ display: 'flex' }}>
            <ResponsiveButtonTabs active={currentPriceDisplayMode === 'token0'} onClick={() => setCurrentPriceDisplayMode('token0')} style={{fontSize: '0.875rem', borderRadius: "4px 0px 0px 4px"}}>
              {poolData?.token0?.symbol}
            </ResponsiveButtonTabs>
            <ResponsiveButtonTabs active={currentPriceDisplayMode === 'token1'} onClick={() => setCurrentPriceDisplayMode('token1')} style={{fontSize: '0.875rem', borderRadius: "0px 4px 4px 0px"}}>
              {poolData?.token1?.symbol}
            </ResponsiveButtonTabs>
          </div>
        </div>
      </AutoColumn>

      <AutoColumn style={{ gap: '12px', marginBottom: '15px' }}>
        <PanelWrapper>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween style={{ fontWeight: 700 }}>
                Total Liquidity
              </RowBetween>
              <RowBetween align="baseline">
                <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  {formattedNum(totalValueLockedUSD, true)}
                </div>
                <div>
                  {formattedPercent(liquidityChangeUSD)}
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
                  {formattedNum(oneDayVolumeUSD, true)}
                </div>
                <div>
                  {formattedPercent(volumeChangeUSD)}
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
                  {formattedNum(oneDayFeesUSD, true)}
                </div>
                <div>
                  {formattedPercent(feesChangeUSD)}
                </div>
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
        </PanelWrapper>
      </AutoColumn>
      {loadingPositions ? (
        <div></div>
      ) : (
        <PositionDetails
          tokenIds={tokenIds}
          token0={poolData?.token0?.tokenAddress}
          token1={poolData?.token1?.tokenAddress}
          fee={poolData?.fee}
          showConnectAWallet={showConnectAWallet}
          toggleWalletDrawer={toggleWalletDrawer}
        />
      )
      }
    </PageWrapper >
  )
}