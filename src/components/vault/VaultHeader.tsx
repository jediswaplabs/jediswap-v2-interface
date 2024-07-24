import { Trans } from '@lingui/macro'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import styled from 'styled-components'

import { InterfaceTrade } from 'state/routing/types'
import { RowBetween, RowFixed } from '../Row'
import SettingsTab from '../Settings'
import { StyledButton, ActiveStyledButton } from './styled'
import { DEFAULT_VAULT_SLIPPAGE_TOLERANCE } from 'pages/Vault'

const StyledVaultHeader = styled(RowBetween)`
  font-family: 'Avenir LT Std';
  color: ${({ theme }) => theme.neutral2};
`

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0;
  gap: 44px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
`

interface PanelButtonProps {
  isActive: boolean
  children: React.ReactNode
  onClick: () => void
}

export default function VaultHeader({
  chainId,
  trade,
  activeButton,
  setActiveButton,
}: {
  chainId?: string
  trade?: InterfaceTrade
  activeButton: string
  setActiveButton: (buttonName: string) => void
}) {
  const PanelButton: React.FC<PanelButtonProps> = ({ isActive, children, onClick }) => {
    const Component = isActive ? ActiveStyledButton : StyledButton
    return (
      <Component style={{ textDecoration: 'none' }} onClick={onClick}>
        {children}
      </Component>
    )
  }
  return (
    <StyledVaultHeader>
      <HeaderButtonContainer>
        <PanelButton isActive={activeButton === 'Deposit'} onClick={() => setActiveButton('Deposit')}>
          <Trans>Deposit</Trans>
        </PanelButton>
        <PanelButton isActive={activeButton === 'Withdraw'} onClick={() => setActiveButton('Withdraw')}>
          <Trans>Withdraw</Trans>
        </PanelButton>
      </HeaderButtonContainer>
      {/* <RowFixed>
        <SettingsTab autoSlippage={DEFAULT_VAULT_SLIPPAGE_TOLERANCE} chainId={chainId} trade={trade} />
      </RowFixed> */}
    </StyledVaultHeader>
  )
}
