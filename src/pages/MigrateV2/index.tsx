import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { Trans } from '@lingui/macro'
import { Token } from '@vnaysn/jediswap-sdk-core'
import { Pair } from '@vnaysn/jediswap-sdk-v2'
import MigrateSushiPositionCard from 'components/PositionCard/Sushi'
import MigrateV2PositionCard from 'components/PositionCard/V2'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { V2Unsupported } from 'components/V2Unsupported'
import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
import { PairState, useV2Pairs } from 'hooks/useV2Pairs'
import { ReactNode, useMemo } from 'react'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'
import { BackArrowLink, StyledInternalLink, ThemedText } from 'theme/components'

import { LightCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import QuestionHelper from '../../components/QuestionHelper'
import { AutoRow } from '../../components/Row'
import { Dots } from '../../components/swap/styled'
import { useTokenBalancesWithLoadingIndicator } from '../../state/connection/hooks'
import { getLiquidityToken, toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { BodyWrapper } from '../AppBody'
import { useAccountDetails } from 'hooks/starknet-react'
import { useAllPairs } from 'state/pairs/hooks'

function EmptyState({ message }: { message: ReactNode }) {
  return (
    <AutoColumn style={{ minHeight: 200, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText.DeprecatedBody>{message}</ThemedText.DeprecatedBody>
    </AutoColumn>
  )
}

// quick hack because sushi init code hash is different
const computeSushiPairAddress = ({ tokenA, tokenB }: { tokenA: Token; tokenB: Token }): string => {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
    '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'
  )
}

/**
 * Given two tokens return the sushiswap liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
function toSushiLiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(tokenA.chainId, computeSushiPairAddress({ tokenA, tokenB }), 18, 'SLP', 'SushiSwap LP Token')
}

export default function MigrateV2() {
  const theme = useTheme()
  const { account, address } = useAccountDetails()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: getLiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )

  const allPairs = useAllPairs()

  const validatedLiquidityTokens = useMemo(
    () => liquidityTokens.map((token) => (allPairs.includes(token.address) ? token : undefined)),
    [allPairs, liquidityTokens]
  )

  const [pairsBalances, fetchingPairBalances] = useTokenBalancesWithLoadingIndicator(
    address ?? undefined,
    validatedLiquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(
        ({ liquidityToken }) => liquidityToken && pairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, pairsBalances]
  )

  const pairs = useV2Pairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const pairIsLoading =
    fetchingPairBalances ||
    pairs?.length < liquidityTokensWithBalances.length ||
    pairs?.some(([pairState]) => pairState === PairState.LOADING) ||
    pairs?.some((pair) => !pair)

  const allPairsWithLiquidity = pairs
    .map(([, pair]) => pair)
    .filter((tokenPair): tokenPair is Pair => Boolean(tokenPair))

  return (
    <>
      <BodyWrapper style={{ padding: 24, maxWidth: 600 }}>
        <AutoColumn gap="16px">
          <AutoRow style={{ alignItems: 'center', justifyContent: 'space-between' }} gap="8px">
            <BackArrowLink to="/pools" />
            <ThemedText.DeprecatedMediumHeader>
              <Trans>Migrate V1 liquidity</Trans>
            </ThemedText.DeprecatedMediumHeader>
            <div>
              <QuestionHelper text={<Trans>Migrate your liquidity tokens from Uniswap V2 to Uniswap V3.</Trans>} />
            </div>
          </AutoRow>

          <ThemedText.DeprecatedBody style={{ marginBottom: 8, fontWeight: 485 }}>
            <Trans>
              For each pool shown below, click migrate to remove your liquidity from JediSwap v1 and deposit it into
              JediSwap v2.
            </Trans>
          </ThemedText.DeprecatedBody>

          {!account ? (
            <LightCard padding="40px">
              <ThemedText.DeprecatedBody color={theme.neutral3} textAlign="center">
                <Trans>Connect to a wallet to view your V1 liquidity.</Trans>
              </ThemedText.DeprecatedBody>
            </LightCard>
          ) : pairIsLoading ? (
            <LightCard padding="40px">
              <ThemedText.DeprecatedBody color={theme.neutral3} textAlign="center">
                <Dots>
                  <Trans>Loading</Trans>
                </Dots>
              </ThemedText.DeprecatedBody>
            </LightCard>
          ) : pairs.filter(([, pair]) => !!pair).length > 0 ? (
            <>
              {allPairsWithLiquidity.map((v2Pair) => (
                <MigrateV2PositionCard key={(v2Pair as Pair).liquidityToken.address} pair={v2Pair as Pair} />
              ))}
            </>
          ) : (
            <EmptyState message={<Trans>No V1 liquidity found.</Trans>} />
          )}
        </AutoColumn>
      </BodyWrapper>
      <SwitchLocaleLink />
    </>
  )
}
