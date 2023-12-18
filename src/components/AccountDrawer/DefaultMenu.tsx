/* @ts-nocheck */
/* eslint-disable */
import { useAccountDetails } from 'hooks/starknet-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import Column from 'components/Column'
import WalletModal from 'components/WalletModal'
import AuthenticatedHeader from './AuthenticatedHeader'
import LanguageMenu from './LanguageMenu'
import LocalCurrencyMenu from './LocalCurrencyMenu'
import SettingsMenu from './SettingsMenu'

const DefaultMenuWrap = styled(Column)`
  width: 100%;
  height: 100%;
`

enum MenuState {
  DEFAULT,
  SETTINGS,
  LANGUAGE_SETTINGS,
  LOCAL_CURRENCY_SETTINGS,
}

function DefaultMenu({ drawerOpen }: { drawerOpen: boolean }) {
  // const { address: account } = useAccountDetails()
  const { address } = useAccountDetails()
  const isAuthenticated = !!address

  const [menu, setMenu] = useState<MenuState>(MenuState.DEFAULT)
  const openSettings = useCallback(() => setMenu(MenuState.SETTINGS), [])
  const closeSettings = useCallback(() => setMenu(MenuState.DEFAULT), [])
  const openLanguageSettings = useCallback(() => setMenu(MenuState.LANGUAGE_SETTINGS), [])
  const openLocalCurrencySettings = useCallback(() => setMenu(MenuState.LOCAL_CURRENCY_SETTINGS), [])

  // @ts-ignore
  useEffect(() => {
    if (!drawerOpen && menu !== MenuState.DEFAULT) {
      // wait for the drawer to close before resetting the menu
      const timer = setTimeout(() => {
        closeSettings()
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [drawerOpen, menu, closeSettings])

  const SubMenu = useMemo(() => {
    switch (menu) {
      case MenuState.DEFAULT:
        return isAuthenticated ? (
          <AuthenticatedHeader account={address} openSettings={openSettings} />
        ) : (
          <WalletModal openSettings={openSettings} />
        )
      case MenuState.SETTINGS:
        return (
          <SettingsMenu
            onClose={closeSettings}
            openLanguageSettings={openLanguageSettings}
            openLocalCurrencySettings={openLocalCurrencySettings}
          />
        )
      case MenuState.LANGUAGE_SETTINGS:
        return <LanguageMenu onClose={openSettings} />
      case MenuState.LOCAL_CURRENCY_SETTINGS:
        return <LocalCurrencyMenu onClose={openSettings} />
    }
  }, [address, closeSettings, isAuthenticated, menu, openLanguageSettings, openLocalCurrencySettings, openSettings])

  return <DefaultMenuWrap>{SubMenu}</DefaultMenuWrap>
}

export default DefaultMenu
