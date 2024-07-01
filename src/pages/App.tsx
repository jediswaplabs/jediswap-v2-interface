import { useAccountDetails } from 'hooks/starknet-react'
import { useAtom } from 'jotai'
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import ErrorBoundary from 'components/ErrorBoundary'
import Loader from 'components/Icons/LoadingSpinner'
import NavBar, { PageTabs } from 'components/NavBar'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import { flexRowNoWrap } from 'theme/styles'
import { Z_INDEX } from 'theme/zIndex'
import { RouteDefinition, routes, useRouterConfig } from './RouteDefinitions'
import { UK_BANNER_HEIGHT, UK_BANNER_HEIGHT_MD, UK_BANNER_HEIGHT_SM } from 'components/NavBar/WarningBanner'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { parseReferralCodeURLParameter } from 'state/swap/hooks'
import { isAddressValidForStarknet, shortenAddress } from 'utils/addresses'
import { ApolloProvider } from '@apollo/client'
import { getClient } from 'apollo/client'
import { getChecksumAddress, validateChecksumAddress } from 'starknet'
import { bannerType, WarningBanner } from './Referral/Warning'
import { getReferralInfoFromStorageForuser, ILocalStorageUserData, useReferralstate } from 'hooks/useReferral'
import fetchReferrer from 'api/fetchReferrer'
import { has } from 'immer/dist/internal'
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
  const [warningType, setWarningType] = useState<bannerType | undefined>(undefined)
  const [hasUserClosedWarning, setHasUserClosedWarning] = useState(false)
  const scrolledState = scrollY > 0
  const routerConfig = useRouterConfig()
  const { chainId, address: account } = useAccountDetails()
  const localStorageData = getReferralInfoFromStorageForuser()
  let userStorageReferralData = undefined
  if (
    localStorageData &&
    account !== undefined &&
    chainId !== undefined &&
    localStorageData[chainId] &&
    localStorageData[chainId][account]
  ) {
    userStorageReferralData = localStorageData[chainId][account]
  }
  const isHeaderTransparent = !scrolledState
  useReferralstate()

  useEffect(() => {
    if (userStorageReferralData && account && hasUserClosedWarning === false) {
      if (userStorageReferralData.isCorrect === false) {
        setWarningType('warning')
      } else {
        setWarningType('success')
      }
    } else {
      setWarningType(undefined)
    }
  }, [localStorageData, account, hasUserClosedWarning])

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrollY(0)
  }, [pathname])

  // useEffect(() => {
  //   if (chainId) {
  //     if (chainId === ChainId.MAINNET) setWarningType('error')
  //   }
  // }, [chainId])

  useEffect(() => {
    const scrollListener = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', scrollListener)
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  let content = (
    <>
      Warning: Deposit liquidity is currently paused in v2. No swap will route through v2 pools. We recommend you remove
      the liquidity from Jediswap v2.
    </>
  )
  if (warningType === 'success') {
    content = <>Referred by {shortenAddress(userStorageReferralData?.referredBy ?? '', 4, 4)}</>
  } else if (warningType === 'warning') {
    content = (
      <>Caution: The referral link doesn’t seem to be correct. Please use the correct link to get referral points.</>
    )
  }

  return (
    <ApolloProvider client={getClient(chainId)}>
      {warningType !== undefined && (
        <WarningBanner
          type={warningType}
          content={content}
          onClose={
            warningType !== 'error'
              ? () => {
                  setHasUserClosedWarning(true)
                }
              : undefined
          }
        />
      )}
      <ErrorBoundary>
        <HeaderWrapper scrollY={scrollY} transparent={isHeaderTransparent} bannerIsVisible={false}>
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
