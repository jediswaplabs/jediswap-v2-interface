import styled, { css, useTheme } from 'styled-components'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { validateAndParseAddress } from 'starknet'

import { AutoColumn } from "components/Column";
import Row, { AutoRow, RowBetween, RowFixed } from "components/Row";
import { formattedNum, formattedPercent } from "utils/formatNum";
import { getAllPools } from 'api/PoolsData';
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAccountDetails } from 'hooks/starknet-react'
import { ETH_ADDRESS, WETH } from 'constants/tokens'
import DoubleTokenLogo from '../../components/DoubleLogo'
import FeeBadge from 'components/FeeBadge'
import { ButtonGray, ButtonPrimary, ButtonText } from 'components/Button'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { PositionDetails } from '../Pool/PositionDetails'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { getClient } from 'apollo/client'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useTokenIds } from 'hooks/useV3Positions'
import { PageWrapper, PanelWrapper, PanelTopLight, ResponsiveButtonPrimary } from 'pages/Pool/styled'

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
      const poolsDataRaw: any = await getAllPools(graphqlClient, [...whitelistedIds, ETH_ADDRESS]) //add ETH token
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