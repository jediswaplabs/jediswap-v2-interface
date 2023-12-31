import '@reach/dialog/styles.css'
// import 'inter-ui'
// import 'polyfills'
// import 'connection/eagerlyConnect'

import { ApolloProvider } from '@apollo/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Helmet } from 'react-helmet'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { HashRouter, useLocation } from 'react-router-dom'

import { MulticallUpdater } from 'lib/state/multicall'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { apolloClient } from 'graphql/data/apollo'
import { FeatureFlagsProvider } from 'featureFlags'
// import { SystemThemeUpdater, ThemeColorMetaUpdater } from 'theme/components/ThemeToggle'
import Web3Provider from './components/Web3Provider'
import { LanguageProvider } from './i18n'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import LogsUpdater from './state/logs/updater'
import OrderUpdater from './state/signatures/updater'
import ThemeProvider, { ThemedGlobalStyle } from './theme'
import TransactionUpdater from './state/transactions/updater'
import RadialGradientByChainUpdater from './theme/components/RadialGradientByChainUpdater'

import { goerli } from '@starknet-react/chains'
import { StarknetConfig, publicProvider, argent, braavos } from '@starknet-react/core'

function Updaters() {
  const location = useLocation()
  const baseUrl = `${window.location.origin}${location.pathname}`
  return (
    <>
      <Helmet>
        <link rel="canonical" href={baseUrl} />
      </Helmet>
      <RadialGradientByChainUpdater />
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <OrderUpdater />
      <MulticallUpdater />
      <LogsUpdater />
    </>
  )
}

const queryClient = new QueryClient()

const container = document.getElementById('root') as HTMLElement

const chains = [goerli]
const providers = [publicProvider()]
const connectors = [argent(), braavos()]

createRoot(container).render(
  <StrictMode>
    <StarknetConfig chains={chains} providers={providers} connectors={connectors} autoConnect>
      <Provider store={store}>
        <FeatureFlagsProvider>
          <QueryClientProvider client={queryClient}>
            <HashRouter>
              <LanguageProvider>
                <Web3Provider>
                  <ApolloProvider client={apolloClient}>
                    <BlockNumberProvider>
                      <Updaters />
                      <ThemeProvider>
                        <ThemedGlobalStyle />
                        <App />
                      </ThemeProvider>
                    </BlockNumberProvider>
                  </ApolloProvider>
                </Web3Provider>
              </LanguageProvider>
            </HashRouter>
          </QueryClientProvider>
        </FeatureFlagsProvider>
      </Provider>
    </StarknetConfig>
  </StrictMode>
)
