import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { TraceEvent } from 'analytics'
import { useCachedPortfolioBalancesQuery } from 'components/PrefetchBalancesWrapper/PrefetchBalancesWrapper'
import Row from 'components/Row'
import { DeltaArrow } from 'components/Tokens/TokenDetails/Delta'
import { useInfoExplorePageEnabled } from 'featureFlags/flags/infoExplore'
import { TokenBalance } from 'graphql/data/types-and-hooks'
import { getTokenDetailsURL, gqlToCurrency, logSentryErrorForUnsupportedChain } from 'graphql/data/util'
import { EmptyWalletModule } from 'nft/components/profile/view/EmptyWalletContent'
import { EllipsisStyle, ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { splitHiddenTokens } from 'utils/splitHiddenTokens'
import { useToggleAccountDrawer } from '../..'
import { hideSmallBalancesAtom } from '../../SmallBalanceToggle'
import { ExpandoRow } from '../ExpandoRow'
import { PortfolioLogo } from '../PortfolioLogo'
import PortfolioRow, { PortfolioSkeleton, PortfolioTabWrapper } from '../PortfolioRow'
import { useWalletConnect } from 'hooks/starknet-react'

export default function Tokens({ account }: { account: string }) {
  const toggleWalletDrawer = useWalletConnect()
  const hideSmallBalances = useAtomValue(hideSmallBalancesAtom)
  const [showHiddenTokens, setShowHiddenTokens] = useState(false)

  const { data } = useCachedPortfolioBalancesQuery({ account })

  const tokenBalances = data?.portfolios?.[0].tokenBalances as TokenBalance[] | undefined

  const { visibleTokens, hiddenTokens } = useMemo(
    () => splitHiddenTokens(tokenBalances ?? [], { hideSmallBalances }),
    [hideSmallBalances, tokenBalances]
  )

  if (!data) {
    return <PortfolioSkeleton />
  }

  const toggleHiddenTokens = () => setShowHiddenTokens((showHiddenTokens) => !showHiddenTokens)

  return (
    <PortfolioTabWrapper>
      {visibleTokens.map(
        (tokenBalance) =>
          tokenBalance.token && <TokenRow key={tokenBalance.id} {...tokenBalance} token={tokenBalance.token} />
      )}
      <ExpandoRow isExpanded={showHiddenTokens} toggle={toggleHiddenTokens} numItems={hiddenTokens.length}>
        {hiddenTokens.map(
          (tokenBalance) =>
            tokenBalance.token && <TokenRow key={tokenBalance.id} {...tokenBalance} token={tokenBalance.token} />
        )}
      </ExpandoRow>
    </PortfolioTabWrapper>
  )
}

const TokenBalanceText = styled(ThemedText.BodySmall)`
  ${EllipsisStyle}
`
const TokenNameText = styled(ThemedText.SubHeader)`
  ${EllipsisStyle}
`

type PortfolioToken = NonNullable<TokenBalance['token']>

function TokenRow({ token, quantity, denominatedValue, tokenProjectMarket }: TokenBalance & { token: PortfolioToken }) {
  const { formatDelta } = useFormatter()
  const percentChange = tokenProjectMarket?.pricePercentChange?.value ?? 0

  const navigate = useNavigate()
  const toggleWalletDrawer = useWalletConnect()
  const isInfoExplorePageEnabled = useInfoExplorePageEnabled()

  const navigateToTokenDetails = useCallback(async () => {
    navigate(getTokenDetailsURL({ ...token, isInfoExplorePageEnabled }))
  }, [navigate, token, isInfoExplorePageEnabled, toggleWalletDrawer])
  const { formatNumber } = useFormatter()

  const currency = gqlToCurrency(token)
  if (!currency) {
    logSentryErrorForUnsupportedChain({
      extras: { token },
      errorMessage: 'Token from unsupported chain received from Mini Portfolio Token Balance Query',
    })
    return null
  }
  return (
    <PortfolioRow
      left={<PortfolioLogo chainId={currency.chainId} currencies={[currency]} size="40px" />}
      title={<TokenNameText>{token?.name}</TokenNameText>}
      descriptor={
        <TokenBalanceText>
          {formatNumber({
            input: quantity,
            type: NumberType.TokenNonTx,
          })}{' '}
          {token?.symbol}
        </TokenBalanceText>
      }
      onClick={navigateToTokenDetails}
      right={
        denominatedValue && (
          <>
            <ThemedText.BodySmall>
              {formatNumber({
                input: denominatedValue?.value,
                type: NumberType.PortfolioBalance,
              })}
            </ThemedText.BodySmall>
            <Row justify="flex-end">
              <DeltaArrow delta={percentChange} />
              <ThemedText.BodySmall color="neutral2">{formatDelta(percentChange)}</ThemedText.BodySmall>
            </Row>
          </>
        )
      }
    />
  )
}
