import { useAccountDetails } from 'hooks/starknet-react'
import { useEffect } from 'react'
import styled from 'styled-components'

import IconButton from 'components/AccountDrawer/IconButton'
import { AutoColumn } from 'components/Column'
import { Settings } from 'components/Icons/Settings'
import { AutoRow } from 'components/Row'
import { connections, deprecatedNetworkConnection, networkConnection } from 'connection'
import { ActivationStatus, useActivationState } from 'connection/activate'
import { isSupportedChain } from 'constants/chains'
import { useFallbackProviderEnabled } from 'featureFlags/flags/fallbackProvider'
import { ThemedText } from 'theme/components'
import { flexColumnNoWrap } from 'theme/styles'
import ConnectionErrorView from './ConnectionErrorView'
import Option from './Option'
import PrivacyPolicyNotice from './PrivacyPolicyNotice'
import { SUPPORTED_WALLETS, WalletInfo } from '../swap/constants'
import { useConnectors } from 'hooks/starknet-react'

const Wrapper = styled.div`
  ${flexColumnNoWrap};
  background: ${({ theme }) => theme.bgdGradient};
  width: 100%;
  padding: 14px 16px 16px;
  flex: 1;
  margin-top: 10px;
`

export const BorderWrapper = styled.div`
  padding: 1px;
  border-radius: 8px;
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 12px;
  border-radius: 8px;
  overflow: hidden;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    grid-template-columns: 1fr;
  `};
`

const PrivacyPolicyWrapper = styled.div`
  padding: 0 4px;
`

export default function WalletModal({ openSettings }: { openSettings: () => void }) {
  const { connector, chainId } = useAccountDetails()
  const { connect } = useConnectors()
  const { activationState } = useActivationState()
  const fallbackProviderEnabled = useFallbackProviderEnabled()
  // Keep the network connector in sync with any active user connector to prevent chain-switching on wallet disconnection.
  useEffect(() => {
    if (chainId && isSupportedChain(chainId)) {
      if (fallbackProviderEnabled) {
        networkConnection.connector.activate(chainId)
      } else {
        deprecatedNetworkConnection.connector.activate(chainId)
      }
    }
  }, [chainId, connector, fallbackProviderEnabled])

  return (
    <Wrapper data-testid="wallet-modal">
      <AutoRow justify="space-between" width="100%" marginBottom="24px">
        <ThemedText.SubHeader>Connect to a wallet</ThemedText.SubHeader>
        <IconButton Icon={Settings} onClick={openSettings} data-testid="wallet-settings" />
      </AutoRow>
      {activationState.status === ActivationStatus.ERROR ? (
        <ConnectionErrorView />
      ) : (
        <AutoColumn gap="16px">
          <OptionGrid data-testid="option-grid">
            {Object.keys(SUPPORTED_WALLETS).map((key) => {
              const option = SUPPORTED_WALLETS[key]
              return (
                <BorderWrapper key={key}>
                  <Option
                    id={`connect-${key}`}
                    clickable={true}
                    color={option.color}
                    header={option.name}
                    subheader={option.subHeader}
                    icon={option.icon}
                    connector={option.connector}
                  />
                </BorderWrapper>
              )
            })}
          </OptionGrid>
          <PrivacyPolicyWrapper>
            <PrivacyPolicyNotice />
          </PrivacyPolicyWrapper>
        </AutoColumn>
      )}
    </Wrapper>
  )
}
