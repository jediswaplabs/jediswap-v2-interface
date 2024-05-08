import { useAccountDetails } from 'hooks/starknet-react'
import { useAtom } from 'jotai'
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import ErrorBoundary from 'components/ErrorBoundary'
import Loader from 'components/Icons/LoadingSpinner'
import NavBar, { PageTabs } from 'components/NavBar'
import { FeatureFlag, useFeatureFlagsIsLoaded } from 'featureFlags'
import { useUniswapXDefaultEnabled } from 'featureFlags/flags/uniswapXDefault'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'
import { useAppSelector } from 'state/hooks'
import { AppState } from 'state/reducer'
import { RouterPreference } from 'state/routing/types'
import { useRouterPreference, useUserOptedOutOfUniswapX } from 'state/user/hooks'
import { flexRowNoWrap } from 'theme/styles'
import { Z_INDEX } from 'theme/zIndex'
import { RouteDefinition, routes, useRouterConfig } from './RouteDefinitions'
import {
  UK_BANNER_HEIGHT,
  UK_BANNER_HEIGHT_MD,
  UK_BANNER_HEIGHT_SM,
  WarningBanner,
} from 'components/NavBar/WarningBanner'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { parseReferralCodeURLParameter } from 'state/swap/hooks'
import { isAddressValidForStarknet } from 'utils/addresses'
import { ApolloProvider } from '@apollo/client'
import { getClient } from 'apollo/client'
// import Footer from 'components/Footer'

const BodyWrapper = styled.div<{ bannerIsVisible?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh);
  padding: ${({ theme }) => theme.navHeight}px 0px 5rem 0px;
  align-items: center;
  flex: 1;
  margin-top: 78px;
  font-family: 'DM Sans';

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    min-height: calc(100vh);
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    min-height: calc(100vh);
  }
`

const MobileBottomBar = styled.div`
  z-index: ${Z_INDEX.sticky};
  position: fixed;
  display: flex;
  bottom: 0;
  right: 0;
  left: 0;
  justify-content: space-between;
  padding: 0px 4px;
  height: ${({ theme }) => theme.mobileBottomBarHeight}px;
  background: linear-gradient(244deg, #000 0%, #000508 100%);
  border-top: 1px solid ${({ theme }) => theme.surface3};
  margin: 0;
  border-radius: 0;
  width: 100%;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`

const HeaderWrapper = styled.div<{
  transparent?: boolean
  bannerIsVisible?: boolean
  scrollY: number
}>`
  ${flexRowNoWrap};
  background-color: transparent;
  border-bottom: ${({ theme }) => `1px solid ${theme.surface3}`};
  backdrop-filter: ${({ theme, transparent }) => (!transparent ? 'blur(38px)' : 'none')};
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: ${({ bannerIsVisible }) => (bannerIsVisible ? Math.max(UK_BANNER_HEIGHT - scrollY, 0) : 0)}px;
  z-index: ${Z_INDEX.dropdown};
  transition-property: background-color;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};
  transition-timing-function: linear;
  font-family: 'Avenir LT Std';

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    top: ${({ bannerIsVisible }) => (bannerIsVisible ? Math.max(UK_BANNER_HEIGHT_MD - scrollY, 0) : 0)}px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    top: ${({ bannerIsVisible }) => (bannerIsVisible ? Math.max(UK_BANNER_HEIGHT_SM - scrollY, 0) : 0)}px;
  }
`

export default function App() {
  const isLoaded = useFeatureFlagsIsLoaded()
  const location = useLocation()
  const { pathname } = location

  const [scrollY, setScrollY] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const scrolledState = scrollY > 0
  const routerConfig = useRouterConfig()
  const { chainId } = useAccountDetails()

  const parsedQs = useParsedQueryString()
  const referralCodeFromUrl = parseReferralCodeURLParameter(parsedQs.referralCode)

  useEffect(() => {
    if (referralCodeFromUrl) {
      //set referral code in local storage if the current stored is not this one
      if (
        referralCodeFromUrl !== localStorage.getItem('referralCode') &&
        isAddressValidForStarknet(referralCodeFromUrl) !== false
      ) {
        localStorage.setItem('referralCode', referralCodeFromUrl)
      }
    }
  }, [referralCodeFromUrl])

  const isHeaderTransparent = !scrolledState

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrollY(0)
  }, [pathname])

  useEffect(() => {
    if (chainId) {
      if (chainId === ChainId.GOERLI) setShowWarning(false)
    }
  }, [chainId])

  useEffect(() => {
    const scrollListener = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', scrollListener)
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  return (
    <ApolloProvider client={getClient(chainId)}>
      <ErrorBoundary>
        {showWarning && <WarningBanner />}
        <HeaderWrapper scrollY={scrollY} transparent={isHeaderTransparent} bannerIsVisible={showWarning}>
          <NavBar />
        </HeaderWrapper>
        <BodyWrapper>
          <Suspense fallback={<Loader />}>
            {isLoaded ? (
              <Routes>
                {routes.map((route: RouteDefinition) =>
                  route.enabled(routerConfig) ? (
                    <Route key={route.path} path={route.path} element={route.getElement(routerConfig)}>
                      {route.nestedPaths.map((nestedPath) => (
                        <Route path={nestedPath} key={`${route.path}/${nestedPath}`} />
                      ))}
                    </Route>
                  ) : null
                )}
              </Routes>
            ) : (
              <Loader />
            )}
          </Suspense>
        </BodyWrapper>
        {/* <Footer /> */}
        <MobileBottomBar>
          <PageTabs />
        </MobileBottomBar>
      </ErrorBoundary>
    </ApolloProvider>
  )
}
