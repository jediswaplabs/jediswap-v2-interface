import { Trans } from '@lingui/macro';
import { Percent } from '@vnaysn/jediswap-sdk-core';
import { useCallback, useMemo, useRef } from 'react';
import { X } from 'react-feather';
import styled from 'styled-components';

import { useAccountDetails } from 'hooks/starknet-react';
import { Scrim } from 'components/AccountDrawer';
import AnimatedDropdown from 'components/AnimatedDropdown';
import { Column, AutoColumn } from 'components/Column';
import Row from 'components/Row';
import { isSupportedChain, isUniswapXSupportedChain } from 'constants/chains';
import useDisableScrolling from 'hooks/useDisableScrolling';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { Portal } from 'nft/components/common/Portal';
import { useIsMobile } from 'nft/hooks';
import { useCloseModal, useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks';
import { ApplicationModal } from 'state/application/reducer';
import { InterfaceTrade } from 'state/routing/types';
import { isUniswapXTrade } from 'state/routing/utils';
import { Divider, ThemedText } from 'theme/components';
import { Z_INDEX } from 'theme/zIndex';
import MaxSlippageSettings from './MaxSlippageSettings';
import MenuButton from './MenuButton';
import RouterPreferenceSettings from './RouterPreferenceSettings';
import TransactionDeadlineSettings from './TransactionDeadlineSettings';

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.neutral1};
  cursor: pointer;
  height: 24px;
  padding: 0;
  width: 24px;
`;

const Menu = styled.div`
  position: relative;
`;

const MenuFlyout = styled(AutoColumn)`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.surface1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  position: absolute;
  top: 100%;
  margin-top: 10px;
  right: 0;
  z-index: 100;
  color: ${({ theme }) => theme.neutral1};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
  `};
  user-select: none;
  padding: 16px;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(200.98deg, #EF35FF 1.04%, #50D5FF 55.28%);


    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    padding: 2px;
  }
`;

const ExpandColumn = styled(AutoColumn)`
  gap: 16px;
  padding-top: 0;
`;

const MobileMenuContainer = styled(Row)`
  overflow: visible;
  position: fixed;
  height: 100%;
  top: 100vh;
  left: 0;
  right: 0;
  width: 100%;
  z-index: ${Z_INDEX.fixed};
`;

const MobileMenuWrapper = styled(Column) <{ $open: boolean }>`
  height: min-content;
  width: 100%;
  padding: 8px 16px 24px;
  background-color: ${({ theme }) => theme.surface1};
  overflow: hidden;
  position: absolute;
  bottom: ${({ $open }) => ($open ? '100vh' : 0)};
  transition: bottom ${({ theme }) => theme.transition.duration.medium};
  border: ${({ theme }) => `1px solid ${theme.surface3}`};
  border-radius: 12px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  font-size: 16px;
  box-shadow: unset;
  z-index: ${Z_INDEX.modal};
`;

const MobileMenuHeader = styled(Row)`
  margin-bottom: 16px;
`;

const Settings = ({ trade, closeMenu, autoSlippage }: {
  trade?: InterfaceTrade,
  closeMenu: () => void,
  autoSlippage: Percent
}) => (
  <AnimatedDropdown open={!isUniswapXTrade(trade)}>
    <ExpandColumn>
      <MaxSlippageSettings closeMenu={closeMenu} autoSlippage={autoSlippage} />
    </ExpandColumn>
  </AnimatedDropdown>
);

export default function SettingsTab({ autoSlippage,
  chainId,
  trade,
  hideRoutingSettings = false }: {
    autoSlippage: Percent
    chainId?: string
    trade?: InterfaceTrade
    hideRoutingSettings?: boolean
  }) {
  const { chainId: connectedChainId } = useAccountDetails();
  const node = useRef<HTMLDivElement | null>(null);
  const isOpen = useModalIsOpen(ApplicationModal.SETTINGS);

  const closeModal = useCloseModal();
  const closeMenu = useCallback(() => closeModal(ApplicationModal.SETTINGS), [closeModal]);
  const toggleMenu = useToggleSettingsMenu();

  const isMobile = useIsMobile();
  const isOpenMobile = isOpen && isMobile;
  const isOpenDesktop = isOpen && !isMobile;

  useOnClickOutside(node, isOpenDesktop ? closeMenu : undefined);
  useDisableScrolling(isOpen);

  const isChainSupported = isSupportedChain(connectedChainId);

  return (
    <Menu ref={node}>
      <MenuButton
        disabled={!isChainSupported || chainId !== connectedChainId}
        isActive={isOpen}
        onClick={toggleMenu}
        trade={trade}
      />
      {isOpenDesktop && <MenuFlyout><Settings autoSlippage={autoSlippage} closeMenu={closeMenu} trade={trade} /></MenuFlyout>}
      {isOpenMobile && (
        <Portal>
          <MobileMenuContainer data-testid="mobile-settings-menu">
            <Scrim onClick={closeMenu} $open />
            <MobileMenuWrapper $open>
              <Settings autoSlippage={autoSlippage} closeMenu={closeMenu} trade={trade} />
            </MobileMenuWrapper>
          </MobileMenuContainer>
        </Portal>
      )}
    </Menu>
  );
}
