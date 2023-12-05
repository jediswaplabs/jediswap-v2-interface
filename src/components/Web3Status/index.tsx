import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import PortfolioDrawer, { useAccountDrawer } from 'components/AccountDrawer'
import { usePendingActivity } from 'components/AccountDrawer/MiniPortfolio/Activity/hooks'
import Loader from 'components/Icons/LoadingSpinner'
import StatusIcon, { IconWrapper } from 'components/Identicon/StatusIcon'
import PrefetchBalancesWrapper from 'components/PrefetchBalancesWrapper/PrefetchBalancesWrapper'
import { getConnection } from 'connection'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { ConnectionMeta, getPersistedConnectionMeta, setPersistedConnectionMeta } from 'connection/meta'
import useENSName from 'hooks/useENSName'
import useLast from 'hooks/useLast'
import { Portal } from 'nft/components/common/Portal'
import { useAppSelector } from 'state/hooks'
import { flexRowNoWrap } from 'theme/styles'
import { shortenAddress } from 'utils'
import { BaseButton, ButtonSecondary, ButtonSize, ThemeButton } from '../Button'
import { RowBetween } from '../Row'
import { useAccountDetails } from 'hooks/starknet-react'

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${flexRowNoWrap};
  width: 100%;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  height: 38px;
  font-size: 16px;
  font-weight: 600;

  :focus {
    outline: none;
  }
`

const Web3StatusConnectWrapper = styled.div``

const Web3StatusConnected = styled(Web3StatusGeneric)<{
  pending?: boolean
  isClaimAvailable?: boolean
}>`
  font-family: 'Avenir LT Std';
  background-color: ${({ theme }) => theme.surface5};
  border: none;
  color: ${({ theme }) => theme.white};
  padding: 10px 24px;
  :hover,
  :focus {
    border: 2px solid ${({ theme }) => theme.white};
  }
`

const Web3StatusConnecting = styled(Web3StatusConnected)`
  &:disabled {
    opacity: 1;
  }
`

const AddressAndChevronContainer = styled.div<{ loading?: boolean }>`
  display: flex;
  opacity: ${({ loading, theme }) => loading && theme.opacity.disabled};
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: 16px;
  width: fit-content;
  font-weight: 600;
`

const StyledConnectButton = styled(ThemeButton)`
  font-family: 'Avenir LT Std';
  width: 200px;
  line-height: 18px;
  :hover,
  :focus {
    background: ${({ theme }) => theme.brandedGradientReversed};
  }
`

function Web3StatusInner() {
  const switchingChain = useAppSelector((state) => state.wallets.switchingChain)
  const ignoreWhileSwitchingChain = useCallback(() => !switchingChain, [switchingChain])
  const connectionReady = useConnectionReady()
  const activeWeb3 = useAccountDetails()
  const lastWeb3 = useLast(useAccountDetails(), ignoreWhileSwitchingChain)
  const { account, connector } = useMemo(() => (activeWeb3.account ? activeWeb3 : lastWeb3), [activeWeb3, lastWeb3])
  const { address } = useAccountDetails()
  const { ENSName, loading: ENSLoading } = useENSName(account)
  const connection = getConnection(connector)

  const [, toggleAccountDrawer] = useAccountDrawer()
  const handleWalletDropdownClick = useCallback(() => {
    toggleAccountDrawer()
  }, [toggleAccountDrawer])

  const { hasPendingActivity, pendingActivityCount } = usePendingActivity()

  // Display a loading state while initializing the connection, based on the last session's persisted connection.
  // The connection will go through three states:
  // - startup:       connection is not ready
  // - initializing:  account is available, but ENS (if preset on the persisted initialMeta) is still loading
  // - initialized:   account and ENS are available
  // Subsequent connections are always considered initialized, and will not display startup/initializing states.
  const initialConnection = useRef(getPersistedConnectionMeta())
  const isConnectionInitializing = Boolean(
    initialConnection.current?.address === account && initialConnection.current?.ENSName && ENSLoading
  )
  const isConnectionInitialized = connectionReady && !isConnectionInitializing
  // Clear the initial connection once initialized so it does not interfere with subsequent connections.
  useEffect(() => {
    if (isConnectionInitialized) {
      initialConnection.current = undefined
    }
  }, [isConnectionInitialized])
  // Persist the connection if it changes, so it can be used to initialize the next session's connection.
  useEffect(() => {
    if (account || ENSName) {
      const meta: ConnectionMeta = {
        type: connection.type,
        address: account,
        ENSName: ENSName ?? undefined,
      }
      setPersistedConnectionMeta(meta)
    }
  }, [ENSName, account, connection.type])

  if (!isConnectionInitialized) {
    return (
      <Web3StatusConnecting disabled={!isConnectionInitializing} onClick={handleWalletDropdownClick}>
        <IconWrapper size={24}>
          <Loader size="24px" stroke="white" />
        </IconWrapper>
        <AddressAndChevronContainer loading>
          <Text>{initialConnection.current?.ENSName ?? shortenAddress(initialConnection.current?.address)}</Text>
        </AddressAndChevronContainer>
      </Web3StatusConnecting>
    )
  }

  if (address) {
    const addressShort = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

    return (
      <Web3StatusConnected
        disabled={Boolean(switchingChain)}
        data-testid="web3-status-connected"
        onClick={handleWalletDropdownClick}
        pending={hasPendingActivity}
      >
        {!hasPendingActivity && connection && (
          <StatusIcon account={address} size={24} connection={connection} showMiniIcons={false} />
        )}
        {hasPendingActivity ? (
          <RowBetween>
            <Text>
              <Trans>{pendingActivityCount} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <AddressAndChevronContainer>
            <Text>{ENSName ?? addressShort}</Text>
          </AddressAndChevronContainer>
        )}
      </Web3StatusConnected>
    )
  }
  return (
    <Web3StatusConnectWrapper
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleWalletDropdownClick()}
      onClick={handleWalletDropdownClick}
    >
      <StyledConnectButton tabIndex={-1} data-testid="navbar-connect-wallet" size={ButtonSize.small}>
        <Trans>Connect Wallet</Trans>
      </StyledConnectButton>
    </Web3StatusConnectWrapper>
  )
}

export default function Web3Status() {
  const [isDrawerOpen] = useAccountDrawer()
  return (
    <PrefetchBalancesWrapper shouldFetchOnAccountUpdate={isDrawerOpen}>
      <Web3StatusInner />
      <Portal>
        <PortfolioDrawer />
      </Portal>
    </PrefetchBalancesWrapper>
  )
}
