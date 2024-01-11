import { useAccountDetails } from 'hooks/starknet-react'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import Column from 'components/Column'
import { Power } from 'components/Icons/Power'
import { Redirect } from 'components/Icons/Redirect'
import { CopyHelper, ThemedText } from 'theme/components'
import { shortenAddress } from 'utils'
import { useOpenModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import StatusIcon from '../Identicon/StatusIcon'
import { useToggleAccountDrawer } from '.'
import IconButton, { IconHoverText, IconWithConfirmTextButton } from './IconButton'
import { portfolioFadeInAnimation } from './MiniPortfolio/PortfolioRow'
import { useDisconnect, useStarkName } from '@starknet-react/core'
import { NONFUNGIBLE_POOL_MANAGER_ADDRESS, STARKSCAN_PREFIXES } from 'constants/tokens'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

const AuthenticatedHeaderWrapper = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`

const StatusWrapper = styled.div`
  width: 70%;
  max-width: 70%;
  padding-right: 8px;
  display: inline-flex;
`

const AccountNamesWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  margin-left: 8px;
`

const HeaderWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CopyText = styled(CopyHelper).attrs({
  iconSize: 14,
  iconPosition: 'right',
})``

const FadeInColumn = styled(Column)`
  ${portfolioFadeInAnimation}
`

const PortfolioDrawerContainer = styled(Column)`
  flex: 1;
`

export default function AuthenticatedHeader({ account }: { account: string }) {
  const { connector, address, chainId } = useAccountDetails()
  const { data: starkName } = useStarkName({ address })
  const { disconnect } = useDisconnect()

  // const connection = getConnection(connector)
  const disconnectWallet = useCallback(() => {
    if (connector) {
      disconnect()
    }
  }, [connector])

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  const addressShort = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null

  const handleStarkScanRedirect = () => {
    const prefix = `https://${STARKSCAN_PREFIXES[chainId] || STARKSCAN_PREFIXES[ChainId.MAINNET]}starkscan.co`
    window.open(`${prefix}/contract/${address}`, '_blank')
  }

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <StatusIcon account={account} connection={connector} size={40} />
          {account && (
            <AccountNamesWrapper>
              <ThemedText.SubHeader>
                <CopyText toCopy={starkName ?? account}>{starkName ?? addressShort}</CopyText>
              </ThemedText.SubHeader>
              {/* Displays smaller view of account if ENS name was rendered above */}
              {starkName && (
                <ThemedText.BodySmall color="neutral2">
                  <CopyText toCopy={account}>{shortenAddress(account)}</CopyText>
                </ThemedText.BodySmall>
              )}
            </AccountNamesWrapper>
          )}
        </StatusWrapper>
        <IconContainer>
          <IconButton
            hideHorizontal={showDisconnectConfirm}
            data-testid="wallet-settings"
            onClick={handleStarkScanRedirect}
            Icon={Redirect}
          />
          <IconWithConfirmTextButton
            data-testid="wallet-disconnect"
            onConfirm={disconnectWallet}
            onShowConfirm={setShowDisconnectConfirm}
            Icon={Power}
            text="Disconnect"
            dismissOnHoverOut
          />
        </IconContainer>
      </HeaderWrapper>
      <PortfolioDrawerContainer></PortfolioDrawerContainer>
    </AuthenticatedHeaderWrapper>
  )
}
