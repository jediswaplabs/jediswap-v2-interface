// @ts-nocheck
import { Trans } from '@lingui/macro'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Logo from 'assets/jedi/logo.png'
import MobileLogo from 'assets/jedi/squareLogo.png'
import { useAccountDrawer } from 'components/AccountDrawer'
import Web3Status from 'components/Web3Status'
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import { NetworkName } from './NetworkName'
import {
  ActiveMenuItem,
  ExternalMenuItem,
  LogoContainer,
  MenuContainer,
  MenuItem,
  Nav,
  StatusContainer,
} from './styled'
import { useIsVaultsPage } from '../../hooks/useIsVaultsPage'
import { useAccountDetails } from 'hooks/starknet-react'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import StarkIcon from 'assets/svg/starknet.svg'
import AuditedIcon from 'assets/images/audited.png'
import styled from 'styled-components'
import { BREAKPOINTS } from 'theme'

const MenuItemLink = ({ to, dataTestId, id, isActive, children }) => {
  const Component = isActive ? ActiveMenuItem : MenuItem
  return (
    <Component to={to} id={id} style={{ textDecoration: 'none' }} data-testid={dataTestId}>
      {children}
    </Component>
  )
}

const ExternalMenuItemLink = ({ to, children }) => (
  <ExternalMenuItem target="_blank" rel="noopener noreferrer" href={to}>
    {children}
  </ExternalMenuItem>
)

const Audit = styled.a`
  @media screen and (max-width: ${BREAKPOINTS.xxl}px) {
    display: none;
  }
`

export const PageTabs = () => {
  const { pathname } = useLocation()
  const isPoolActive = useIsPoolsPage()
  const isVaultsActive = useIsVaultsPage()
  const { chainId } = useAccountDetails()

  return (
    <>
      <MenuItemLink to="/swap" isActive={pathname.startsWith('/swap')}>
        <Trans>Trade</Trans>
      </MenuItemLink>
      <MenuItemLink to="/pools" dataTestId="pool-nav-link" isActive={isPoolActive}>
        <Trans>Pool</Trans>
      </MenuItemLink>
      <ExternalMenuItemLink to={'https://info.v2.jediswap.xyz/'}>
        <Trans>Dashboard</Trans>
      </ExternalMenuItemLink>
      <MenuItemLink to="/vaults" isActive={isVaultsActive}>
        <Trans>Vaults</Trans>
      </MenuItemLink>
      <ExternalMenuItemLink to="https://app.v1.jediswap.xyz/">
        <Trans>V1</Trans>
      </ExternalMenuItemLink>
      {/* <MenuItemLink to="/rewards" isActive={pathname.startsWith('/rewards')}>
        <img src={StarkIcon} style={{ marginRight: '2px' }} alt="starknet_logo" />
        <Trans>Rewards</Trans>
      </MenuItemLink> */}
    </>
  )
}

const Navbar = () => {
  const navigate = useNavigate()

  const [accountDrawerOpen, toggleAccountDrawer] = useAccountDrawer()

  const handleLogoIconClick = useCallback(() => {
    if (accountDrawerOpen) {
      toggleAccountDrawer()
    }
    navigate({
      pathname: '/',
    })
  }, [accountDrawerOpen, navigate, toggleAccountDrawer])

  return (
    <Nav>
      <LogoContainer>
        <img
          width={'195px'}
          height={'32px'}
          src={Logo}
          alt="logo"
          onClick={handleLogoIconClick}
          className={'desktop'}
        />
        <img
          width={'32'}
          height={'32'}
          src={MobileLogo}
          alt="logo"
          onClick={handleLogoIconClick}
          className={'mobile'}
        />
        <Audit
          href="https://github.com/NethermindEth/PublicAuditReports/blob/main/NM0180-FINAL_JEDISWAP.pdf"
          target="_blank"
        >
          <img style={{ width: '170px', marginLeft: '30px' }} src={AuditedIcon} />
        </Audit>
      </LogoContainer>

      <MenuContainer>
        <PageTabs />
      </MenuContainer>

      <StatusContainer>
        {/* <NetworkName /> */}
        <Web3Status />
      </StatusContainer>
    </Nav>
  )
}

export default Navbar
