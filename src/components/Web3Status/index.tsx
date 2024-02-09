import { Trans } from '@lingui/macro'
import { useAccountDetails } from 'hooks/starknet-react'
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
import { useStarkName } from '@starknet-react/core'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

const FULL_BORDER_RADIUS = 9999

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
`

const Web3StatusConnectWrapper = styled.div`
  font-family: 'Avenir LT Std';
  background-color: ${({ theme }) => theme.surface5};
  border: none;
  color: ${({ theme }) => theme.white};
  padding: 10px 24px;
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{
  pending?: boolean
  isClaimAvailable?: boolean
}>`
  font-family: 'Avenir LT Std';
  background-color: ${({ theme }) => theme.surface5};
  border: none;
  color: ${({ theme }) => theme.white};
  padding: 10px 24px;
`

const NetworkContainer = styled.div`
  ${flexRowNoWrap};
  width: 100%;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  height: 38px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Avenir LT Std';
  border: none;
  color: ${({ theme }) => theme.white};
  margin-right: 16px;
  padding: 10px 24px;
`

const NetworkSelected = styled(Web3StatusGeneric)<{}>`
  font-family: 'Avenir LT Std';
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border: none;
  color: ${({ theme }) => theme.white};
  margin-right: 16px;
  padding: 10px 24px;
`

const AddressAndChevronContainer = styled.div<{ loading?: boolean }>`
  display: flex;
  align-items: center;
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

const StyledConnectButton = styled.button`
  background-color: transparent;
  border: none;
  border-top-left-radius: ${FULL_BORDER_RADIUS}px;
  border-bottom-left-radius: ${FULL_BORDER_RADIUS}px;
  cursor: pointer;
  font-weight: 535;
  font-size: 16px;
  padding: 10px 12px;
  color: inherit;
`

function Web3StatusInner() {
  const [, toggleAccountDrawer] = useAccountDrawer()
  const handleWalletDropdownClick = useCallback(() => {
    toggleAccountDrawer()
  }, [toggleAccountDrawer])
  const { address, connector, chainId } = useAccountDetails()
  const { data: starkName } = useStarkName({ address })

  if (address) {
    return (
      <NetworkContainer>
        <NetworkSelected data-testid="web3-status-connected" onClick={handleWalletDropdownClick}>
          <Text>Starknet {chainId === ChainId.MAINNET ? 'Mainnet' : 'Goerli'}</Text>
        </NetworkSelected>
        <Web3StatusConnected data-testid="web3-status-connected" onClick={handleWalletDropdownClick}>
          <StatusIcon account={address} connection={connector} size={40} />
          <AddressAndChevronContainer>
            <Text>{starkName ?? shortenAddress(address)}</Text>
          </AddressAndChevronContainer>
        </Web3StatusConnected>
      </NetworkContainer>
    )
  } else {
    return (
      <Web3StatusConnectWrapper tabIndex={0} onClick={handleWalletDropdownClick}>
        <StyledConnectButton tabIndex={-1} data-testid="navbar-connect-wallet">
          <Trans>Connect</Trans>
        </StyledConnectButton>
      </Web3StatusConnectWrapper>
    )
  }
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
