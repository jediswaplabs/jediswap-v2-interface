import { Trans } from '@lingui/macro';
import { ReactNode, useCallback } from 'react';
import { NavLinkProps, useLocation, useNavigate } from 'react-router-dom';

import { useAccountDrawer } from 'components/AccountDrawer';
import Web3Status from 'components/Web3Status';
import { useIsPoolsPage } from 'hooks/useIsPoolsPage';
import { Row } from 'nft/components/Flex';
import Logo from 'assets/jedi/logo.png';
import { Nav, LogoContainer, MenuContainer, StatusContainer, MenuItem, ActiveMenuItem } from './styled';

interface MenuItemProps {
    href: string
    id?: NavLinkProps['id']
    isActive?: boolean
    children: ReactNode
    dataTestId?: string
}

const MenuItemLink = ({ href, dataTestId, id, isActive, children }: MenuItemProps) => {
  const Component = isActive ? ActiveMenuItem : MenuItem;
  return (
    <Component
      to={href}
      id={id}
      style={{ textDecoration: 'none' }}
      data-testid={dataTestId}
    >
      {children}
    </Component>
  );
};

export const PageTabs = () => {
  const { pathname } = useLocation();
  const isPoolActive = useIsPoolsPage();

  return (
    <>
      <MenuItemLink href="/swap" isActive={pathname.startsWith('/swap')}>
        <Trans>Trade</Trans>
      </MenuItemLink>
      <MenuItemLink href="/pool" dataTestId="pool-nav-link" isActive={isPoolActive}>
        <Trans>Pool</Trans>
      </MenuItemLink>
      <MenuItemLink href="https://info.jediswap.xyz/">
        <Trans>Dashboard</Trans>
      </MenuItemLink>
    </>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  const [accountDrawerOpen, toggleAccountDrawer] = useAccountDrawer();

  const handleUniIconClick = useCallback(() => {
    if (accountDrawerOpen) {
      toggleAccountDrawer();
    }
    navigate({
      pathname: '/',
    });
  }, [accountDrawerOpen, navigate, toggleAccountDrawer]);

  return (
    <Nav>
      <LogoContainer>
        <img width={'195px'} height={'32px'} src={Logo} alt="logo" onClick={handleUniIconClick} />
      </LogoContainer>

      <MenuContainer display={{ sm: 'none', lg: 'flex' }}>
        <PageTabs />
      </MenuContainer>

      <StatusContainer>
        <Row gap="12">
          <Web3Status />
        </Row>
      </StatusContainer>
    </Nav>
  );
};

export default Navbar;
