import { Trans } from '@lingui/macro'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Pair } from '@vnaysn/jediswap-sdk-v2'
import { useAccountDetails } from 'hooks/starknet-react'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { ChevronsRight } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { V2Unsupported } from 'components/V2Unsupported'
import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
import { Trace } from 'analytics'
import { ExternalLink, HideSmall, ThemedText } from 'theme/components'
import { ButtonOutlined, ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import FullPositionCard from '../../components/PositionCard'
import { RowBetween, RowFixed } from '../../components/Row'
import { Dots } from '../../components/swap/styled'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { BIG_INT_ZERO } from '../../constants/misc'
import { useV2Pairs } from '../../hooks/useV2Pairs'
import { useTokenBalancesWithLoadingIndicator } from '../../state/connection/hooks'
// import { useStakingInfo } from '../../state/stake/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 0px 8px;
  `};
`

const LPFeeExplainer = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  margin: 0 0 16px 0;
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  height: 40px;
  width: fit-content;
  border-radius: 12px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  height: 40px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.neutral2};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Pool() {
  const theme = useTheme()
  const { address: account } = useAccountDetails()
  const networkSupportsV2 = useNetworkSupportsV2()

  // fetch the user's balances of all tracked V2 LP tokens
  let trackedTokenPairs = useTrackedTokenPairs()
  if (!networkSupportsV2) {
    trackedTokenPairs = []
  }
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = useV2Pairs(
    [],
    liquidityTokensWithBalances.map(({ tokens }) => tokens)
  )
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // show liquidity even if its deposited in rewards contract
  // const stakingInfo = useStakingInfo()
  // const stakingInfosWithBalance = stakingInfo?.filter((pool) =>
  //   JSBI.greaterThan(pool.stakedAmount.quotient, BIG_INT_ZERO)
  // )
  // const stakingPairs = useV2Pairs(stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens))

  // // remove any pairs that also are included in pairs with stake in mining pool
  // const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(
  //   (v2Pair) =>
  //     stakingPairs
  //       ?.map((stakingPair) => stakingPair[1])
  //       .filter((stakingPair) => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
  // )

  return <></>
}
