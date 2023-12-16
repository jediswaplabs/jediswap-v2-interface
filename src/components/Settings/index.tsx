import { Trans } from '@lingui/macro'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Settings, X } from 'react-feather'
import { Text } from 'rebass'

import { Scrim } from 'components/AccountDrawer'
import AnimatedDropdown from 'components/AnimatedDropdown'
import Column, { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { isSupportedChain, isUniswapXSupportedChain } from 'constants/chains'
import useDisableScrolling from 'hooks/useDisableScrolling'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { Portal } from 'nft/components/common/Portal'
import { useIsMobile } from 'nft/hooks'
import { useCloseModal, useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { InterfaceTrade } from 'state/routing/types'
import { isUniswapXTrade } from 'state/routing/utils'
import { Divider, ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'
// import MaxSlippageSettings from './MaxSlippageSettings'
// import MenuButton from './MenuButton'
import RouterPreferenceSettings from './RouterPreferenceSettings'
import TransactionDeadlineSettings from './TransactionDeadlineSettings'
import TransactionSettings from './TransactionSettings'
import { useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.neutral1};
  cursor: pointer;
  height: 24px;
  padding: 0;
  width: 24px;
`

const Menu = styled.div`
  position: relative;
`

const ExpandColumn = styled(AutoColumn)`
  gap: 16px;
  padding-top: 0;
`

const MobileMenuContainer = styled(Row)`
  overflow: visible;
  position: fixed;
  height: 100%;
  top: 100vh;
  left: 0;
  right: 0;
  width: 100%;
  z-index: ${Z_INDEX.fixed};
`

const MobileMenuWrapper = styled(Column)<{ $open: boolean }>`
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
`

const MobileMenuHeader = styled(Row)`
  margin-bottom: 16px;
`

const StyledMenuButtonTransparent = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  /* height: 35px; */
  width: 100%;
  height: auto;

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`
const MenuGradientWrapper = styled.span`
  background: linear-gradient(200.98deg, #ef35ff 1.04%, #50d5ff 55.28%);
  padding: 2px;
  border-radius: 8px;
  position: absolute;
  top: 2.75rem;
  right: 0.5rem;
  z-index: 100;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    right: -2rem;
  `};
`

const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    min-width: 18.125rem;
    right: -46px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
    top: -22rem;
  `};
`

const StyledMenuIcon = styled(Settings)<{ unlimited?: boolean; noMargin?: boolean }>`
  width: 100%;
  height: auto;
  max-width: ${({ unlimited }) => (unlimited ? 'auto' : '27px')};
  > * {
    stroke: ${({ theme }) => theme.jediWhite};
  }
`

export default function SettingsTab({
  autoSlippage,
  chainId,
  trade,
  hideRoutingSettings = false,
}: {
  autoSlippage: Percent
  chainId?: string
  trade?: InterfaceTrade
  hideRoutingSettings?: boolean
}) {
  const { chainId: connectedChainId } = useAccountDetails()
  const node = useRef<HTMLDivElement | null>(null)
  const isOpen = useModalIsOpen(ApplicationModal.SETTINGS)

  const closeModal = useCloseModal()
  const closeMenu = useCallback(() => closeModal(ApplicationModal.SETTINGS), [closeModal])
  const toggleMenu = useToggleSettingsMenu()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const isMobile = useIsMobile()
  const isOpenMobile = isOpen && isMobile
  const isOpenDesktop = isOpen && !isMobile

  useOnClickOutside(node, isOpenDesktop ? closeMenu : undefined)
  useDisableScrolling(isOpen)

  const isChainSupported = isSupportedChain(connectedChainId)
  // const Settings = useMemo(
  //   () => (
  //     <AnimatedDropdown open={!isUniswapXTrade(trade)}>
  //       <ExpandColumn>
  //         <MaxSlippageSettings autoSlippage={autoSlippage} />
  //       </ExpandColumn>
  //     </AnimatedDropdown>
  //   ),
  //   [autoSlippage, trade]
  // )

  return (
    <Menu ref={node}>
      <StyledMenuButtonTransparent onClick={toggleMenu} id="open-settings-dialog-button">
        <StyledMenuIcon />

        {/* {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null} */}
      </StyledMenuButtonTransparent>
      {isOpen && (
        <MenuGradientWrapper>
          <MenuFlyout>
            <AutoColumn gap="md" style={{ padding: '1rem' }}>
              <Text fontWeight={700} fontSize={16}>
                Settings
              </Text>
              <TransactionSettings
                rawSlippage={userSlippageTolerance}
                setRawSlippage={setUserslippageTolerance}
                deadline={ttl}
                setDeadline={setTtl}
              />
              {/* <Text fontWeight={600} fontSize={14}>
              Interface Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Toggle Expert Mode
                </TYPE.black>
                <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
              </RowFixed>
              <Toggle
                id="toggle-expert-mode-button"
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode()
                        setShowConfirmation(false)
                      }
                    : () => {
                        toggle()
                        setShowConfirmation(true)
                      }
                }
              />
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Toggle Dark Mode
                </TYPE.black>
              </RowFixed>
              <Toggle isActive={darkMode} toggle={toggleDarkMode} />
            </RowBetween> */}
            </AutoColumn>
          </MenuFlyout>
        </MenuGradientWrapper>
      )}
    </Menu>
  )
}
