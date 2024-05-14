/* eslint-disable comma-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable semi */
// @ts-nocheck

import { Trans } from '@lingui/macro'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { AlertTriangle, ArrowLeft } from 'react-feather'
import { useMedia } from 'react-use'
import styled, { css } from 'styled-components'
import { Flex } from 'rebass'
import { ChainId, Currency, CurrencyAmount, Fraction, ONE, Percent, Token } from '@vnaysn/jediswap-sdk-core'
import { isEmpty } from 'lodash'
import { Link, useParams } from 'react-router-dom'
import { useBalance } from '@starknet-react/core'
import { useSelector } from 'react-redux'

import { useAccountDetails } from 'hooks/starknet-react'
import { AutoColumn } from 'components/Column'
import { StyledRouterLink, ThemedText } from 'theme/components'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import JediSwapLoader from '../../components/Loader/JediSwapLoader'
import noPositionsBg from '../../assets/svg/no-positions-bg.svg'
import { useFormatter } from '../../utils/formatNumbers.ts'
import { formatUsdPrice } from '../../nft/utils'
import { isAddressValidForStarknet } from '../../utils/addresses'
import Row, { AutoRow } from 'components/Row'
import { FullDivider, VaultWrapper } from 'components/vault/styled'
import VaultHeader from 'components/vault/VaultHeader'
import { useAllVaults, useVaultDerivedInfo } from 'state/vaults/hooks'
import VaultDeposit from 'components/vault/VaultDeposit'
import { ButtonError, ButtonPrimary, ButtonSize } from 'components/Button'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { Z_INDEX } from 'theme/zIndex'
import { useCurrency } from 'hooks/Tokens'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { cairo, Call, CallData, num } from 'starknet'
import { useContractWrite } from '@starknet-react/core'
import { Field } from 'state/vaults/actions'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import JSBI from 'jsbi'
import { useApprovalCall } from 'hooks/useApproveCall'
import { calculateMaximumAmountWithSlippage } from 'utils/calculateSlippage'
import { decimalToBigInt } from 'utils/decimalToBigint'

export const DEFAULT_VAULT_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 920px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`

const NoPositionsContainer = styled.div`
  background: url(${noPositionsBg}) no-repeat;
  background-color: #141451;
  background-position: center 20px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 100px;
  width: 100%;
  border-radius: 8px;
  padding: 2rem;
  // @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
  //   padding: 0px 52px;
  // }
  //
  // @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
  //   padding: 0px 52px;
  // }
`

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 25vh;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 0px 52px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding: 0px 52px;
  }
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const NetworkIcon = styled(AlertTriangle)`
  ${IconStyle}
`

const PageTitleRow = styled.div`
  display: flex;
  gap: 10px;

  align-items: center;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(217, 217, 217, 0.1);
`

const VerticalDivider = styled.div`
  height: 1px;
  width: 50px;
  background: rgba(217, 217, 217, 0.1);
  transform: rotate(90deg);
`

const List = styled.div``

const StyledTokenName = styled.span<{ active?: boolean }>`
  font-size: 20px;
  font-weight: 700;
  font-family: 'DM Sans';
`

const Arrow = styled.div`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;

  :hover {
    cursor: pointer;
  }
`

const VaultDetailsContainer = styled(Flex)`
  flex-direction: column;
  padding: 17px 20px 32px 20px;
  background-color: #141451;
  width: 416px;
  border-radius: 4px;
  gap: 20px;
`
const VaultName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`
const VaultStrategyType = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`

const VaultStrategyDetail = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #d9d9d9;
`
const VaultStrategyLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  font-size: 14px;
  font-weight: 700;
  color: #50d5ff;
  &:hover {
    cursor: pointer;
  }
  & a {
    color: inherit;
    text-decoration: none;
  }
`
const ProviderLogo = styled.img`
  user-select: none;
  max-width: 100%;
`

const VaultDataHeaders = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d9d9d9;
`
const VaultInputWrapper = styled(AutoColumn)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  margin-bottom: 20px;
`

const VaultTransactionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const MyDepositWrapperOuter = styled.div`
  position: relative;
  z-index: ${Z_INDEX.default};
  transition: transform 250ms ease;
  border-radius: 8px;
  height: fit-content;
`
const MyDepositWrapperInner = styled.div`
  border-radius: 8px;
  z-index: -1;
  position: relative;
  padding: 24px 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  backdrop-filter: blur(38px);
  background-color: rgba(196, 196, 196, 0.01);
  box-shadow: 0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset, 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset;
  font-size: 20px;
`

function ErrorPanel({ text }) {
  return (
    <ErrorContainer>
      <ThemedText.BodyPrimary textAlign="center">
        <NetworkIcon strokeWidth={1} style={{ marginTop: '2em' }} />
        <div>
          <Trans>{text || 'An error has occurred. Please try again later.'}</Trans>
        </div>
      </ThemedText.BodyPrimary>
    </ErrorContainer>
  )
}

function NoVaultsPanel() {
  return (
    <NoPositionsContainer>
      <ThemedText.BodyPrimary textAlign="center" fontSize={20}>
        <Trans>No Liquidity has been found. Please deposit in any of our Vaults.</Trans>
      </ThemedText.BodyPrimary>
    </NoPositionsContainer>
  )
}

const noop = () => {}
const UserBalance = ({ tokenAddress, vaultAddress, tokenPrice, getResult = noop }) => {
  const { address, isConnected } = useAccountDetails()

  const {
    data: userBalanceData,
    isLoading: isUserBalanceLoading,
    isError: isUserBalanceError,
    isSuccess: isUserBalanceSuccess,
  } = useBalance({
    token: tokenAddress,
    address,
    watch: true,
  })
  let result
  const balanceInUsd = Number(userBalanceData?.formatted ?? 0) * (tokenPrice ?? 0)
  useEffect(() => {
    if (isConnected && isUserBalanceSuccess) {
      getResult({ vaultAddress, balance: balanceInUsd })
    }
  }, [userBalanceData, isUserBalanceSuccess, isConnected])

  switch (true) {
    case !isConnected:
    case isUserBalanceError: {
      result = formatUsdPrice(0)
      break
    }
    case isUserBalanceLoading: {
      result = '...'
      break
    }
    case isUserBalanceSuccess: {
      result = formatUsdPrice(balanceInUsd)
      break
    }
    default: {
      result = 0
    }
  }
  return result
}

const BreadcrumbsRow = styled(Flex)``
const Breadcrumbs = styled(Flex)`
  gap: 6px;
  align-items: center;
`

const BreadcrumbsNavLink = styled(StyledRouterLink)`
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
`

const PageContentWrapper = styled(Flex)`
  gap: 20px;
  flex-direction: row;
`

const PageTitle = ({ token0, token1 }) => {
  const below600 = useMedia('(max-width: 600px)')
  if (!(token0 && token1)) {
    return null
  }
  return (
    <PageTitleRow>
      <DoubleCurrencyLogo size={below600 ? 24 : 30} currency0={token0} currency1={token1} margin />
      <StyledTokenName className="pair-name-container">
        {token0?.symbol}-{token1?.symbol}
      </StyledTokenName>
    </PageTitleRow>
  )
}

export default function Vault({ className }: { className?: string }) {
  const { vaultId: vaultIdFromUrl } = useParams()
  const { address, isConnected, chainId } = useAccountDetails()
  const { formatPercent } = useFormatter()
  const [generalError, setGeneralError] = useState(null)
  const [generalLoading, setGeneralLoading] = useState(true)

  const { data: allVaults, error: allVaultsError, isLoading: isAllVaultsLoading } = useAllVaults()

  const getCurrentVault = () => {
    if (!allVaults) {
      return
    }
    const result = allVaults[vaultIdFromUrl]
    return result
  }
  const currentVault = getCurrentVault()
  const vaultsAddresses = Object.keys(allVaults ?? {})

  useEffect(() => {
    setGeneralError(allVaultsError)
    setGeneralLoading(isAllVaultsLoading)
  }, [allVaultsError, isAllVaultsLoading])

  const getContent = () => {
    switch (true) {
      case !isAddressValidForStarknet(vaultIdFromUrl): {
        return <ErrorPanel />
      }
      case generalError: {
        return <ErrorPanel />
      }
      case generalLoading: {
        return <JediSwapLoader />
      }
      case !vaultsAddresses?.length: {
        return <ErrorPanel />
      }
      case vaultsAddresses?.length && !currentVault: {
        return <ErrorPanel />
      }
      case !(currentVault.token0 && currentVault.token1): {
        return <ErrorPanel />
      }
      default: {
        const shareTokenAddress = currentVault?.share?.address
        const performanceData = currentVault.performance[currentVault.mainAssetKey]
        const token0 = new Token(
          currentVault.token0.chainId,
          currentVault.token0.address,
          currentVault.token0.decimals,
          currentVault.token0.symbol,
          currentVault.token0.name
        )
        token0.logoURI = currentVault.token0.logoURI

        const token1 = new Token(
          currentVault.token1.chainId,
          currentVault.token1.address,
          currentVault.token1.decimals,
          currentVault.token1.symbol,
          currentVault.token1.name
        )
        token1.logoURI = currentVault.token1.logoURI

        let tvl
        let apr
        let feeApr
        let totalApr
        let shareTokenPriceUsd

        if (!isEmpty(performanceData)) {
          const mainTokenDecimals = currentVault[currentVault.mainAssetKey].decimals
          const tvlInMainToken = performanceData.tvl / 10 ** mainTokenDecimals
          const tokenPrice = currentVault.prices[currentVault.mainAssetKey]
          const shareTokenDecimals = currentVault?.share?.decimals
          const shareTokenPriceInUnits = performanceData.shareTokenPrice / 10 ** (18 + shareTokenDecimals)
          tvl = tvlInMainToken * tokenPrice
          apr = Number(performanceData.shareTokenApr / 10 ** 4)?.toFixed(2)
          feeApr = Number(performanceData.feeApr / 10 ** 4)?.toFixed(2)
          totalApr = Number((performanceData?.shareTokenApr + performanceData?.feeApr) / 10 ** 4)?.toFixed(2)
          shareTokenPriceUsd = shareTokenPriceInUnits * tokenPrice
        }
        return (
          <AutoColumn gap={'12px'}>
            <PageTitle token0={token0} token1={token1} />
            <PageContentWrapper>
              <VaultDetailsContainer>
                <AutoColumn gap="37px">
                  <AutoRow>
                    <AutoColumn gap="15px" grow>
                      <VaultDataHeaders>PROVIDER</VaultDataHeaders>
                      <ThemedText.BodySmall>{currentVault.provider.name}</ThemedText.BodySmall>
                    </AutoColumn>
                    <AutoColumn gap="15px" grow>
                      <VaultDataHeaders>TVL</VaultDataHeaders>
                      <ThemedText.BodySmall fontWeight={500}>{tvl ? formatUsdPrice(tvl) : '-'}</ThemedText.BodySmall>
                    </AutoColumn>
                    <ProviderLogo src={currentVault.provider.logo} />
                  </AutoRow>
                  <AutoRow>
                    <AutoColumn gap="15px" grow>
                      <VaultDataHeaders>APR RANGE</VaultDataHeaders>
                      <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                        {totalApr ? formatPercent(Number(totalApr)) : '-'}
                      </ThemedText.BodySmall>
                    </AutoColumn>
                    <VerticalDivider />
                    <AutoColumn gap="15px" grow>
                      <AutoRow justify="space-between">
                        <ThemedText.BodySmall fontWeight={500}>Fee APR:</ThemedText.BodySmall>
                        <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                          {feeApr !== undefined ? formatPercent(Number(feeApr)) : '-'}
                        </ThemedText.BodySmall>
                      </AutoRow>
                      <AutoRow justify="space-between">
                        <ThemedText.BodySmall fontWeight={500}>STRK APR:</ThemedText.BodySmall>
                        <ThemedText.BodySmall color={'accent1'} fontWeight={700}>
                          {apr ? formatPercent(Number(apr)) : '-'}
                        </ThemedText.BodySmall>
                      </AutoRow>
                    </AutoColumn>
                  </AutoRow>
                </AutoColumn>
                <Divider />
                <AutoColumn gap="16px">
                  <VaultName>{currentVault.provider.name}</VaultName>
                  <img src={currentVault.lpStrategyGraph} />
                  {/* update later - img takes time to load issue */}
                  <VaultStrategyType>{currentVault.strategyType}</VaultStrategyType>
                  <VaultStrategyDetail dangerouslySetInnerHTML={{ __html: currentVault.details }} />
                  <VaultStrategyLinks gap="24px">
                    <a href={currentVault.links.details} target={'_blank'} rel="noreferrer">
                      View Contract
                    </a>
                    <a href={currentVault.links.details} target={'_blank'} rel="noreferrer">
                      View Details
                    </a>
                  </VaultStrategyLinks>
                </AutoColumn>
              </VaultDetailsContainer>
              <VaultTransactionPanel>
                <VaultElement chainId={chainId} currentVault={currentVault} />
                <MyDepositWrapperOuter>
                  <MyDepositWrapperInner>
                    <span>My Deposits</span>
                    <span>$16.89</span>
                  </MyDepositWrapperInner>
                </MyDepositWrapperOuter>
              </VaultTransactionPanel>
            </PageContentWrapper>
          </AutoColumn>
        )
      }
    }
  }

  return (
    <PageWrapper>
      <BreadcrumbsRow>
        <Breadcrumbs>
          <ArrowLeft width={20} />
          <BreadcrumbsNavLink to={'/vaults/'}>Back to vaults</BreadcrumbsNavLink>
        </Breadcrumbs>
      </BreadcrumbsRow>
      {getContent()}
    </PageWrapper>
  )
}

export function VaultElement({
  chainId,
  currentVault,
}: //   className,
//   onCurrencyChange,
//   disableTokenInputs = false,
{
  chainId?: ChainId
  currentVault: any
  //   className?: string
  //   onCurrencyChange?: (selected: Pick<SwapState, Field.INPUT | Field.OUTPUT>) => void
  //   disableTokenInputs?: boolean
}) {
  const [callData, setCallData] = useState<Call[]>([])
  const [activeButton, setActiveButton] = useState<string>('Deposit')
  const connectionReady = useConnectionReady()
  const { address: account } = useAccountDetails()

  const vaultState = useSelector((state) => state.vaults)
  // Vault Input state
  const baseCurrency = useCurrency(currentVault.token0.address)
  const currencyB = useCurrency(currentVault.token1.address)

  // toggle wallet when disconnected
  const toggleWalletDrawer = useToggleAccountDrawer()

  const vaultInfo = useVaultDerivedInfo(vaultState, baseCurrency ?? undefined, currencyB ?? undefined)
  const { inputError: vaultInputError, insufficientBalance, parsedAmounts, token0All, totalSupply } = vaultInfo
  const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts

  const {
    writeAsync,
    data: txData,
    error,
  } = useContractWrite({
    calls: callData,
  })

  useEffect(() => {
    if (callData) {
      writeAsync()
        .then((response) => {
          if (response?.transaction_hash) {
          }
        })
        .catch((err) => {
          console.log(err?.message)
        })
    }
  }, [callData])

  const vaultAddress = '0x033bb35548c9cfcfdafe1c18cf8040644a52881f8fd2f4be56770767c12e3a41' // check - replace vault address
  const defaultDepositSlippage = new Percent(101, 10000)
  const amountAToApprove = useMemo(
    () => (parsedAmountA ? calculateMaximumAmountWithSlippage(parsedAmountA, defaultDepositSlippage) : undefined),
    [parsedAmountA, defaultDepositSlippage]
  )
  const amountBToApprove = useMemo(
    () => (parsedAmountB ? calculateMaximumAmountWithSlippage(parsedAmountB, defaultDepositSlippage) : undefined),
    [parsedAmountB, defaultDepositSlippage]
  )

  // check whether the user has approved the router on the tokens
  const approvalACallback = useApprovalCall(amountAToApprove, vaultAddress)
  const approvalBCallback = useApprovalCall(amountBToApprove, vaultAddress)

  const onDeposit = () => {
    if (!chainId || !account || !parsedAmountA || !parsedAmountB) {
      return
    }
    const callData = []
    const adjustedAmountAWithSlippage = calculateMaximumAmountWithSlippage(parsedAmountA, defaultDepositSlippage)
    const adjustedAmountBWithSlippage = calculateMaximumAmountWithSlippage(parsedAmountB, defaultDepositSlippage)

    let approvalA = undefined
    let approvalB = undefined

    if (parsedAmountA && parsedAmountA?.raw.toString() > 0) approvalA = approvalACallback()
    if (parsedAmountB && parsedAmountB?.raw.toString() > 0) approvalB = approvalBCallback()

    const derivedShares = decimalToBigInt(
      parseFloat(parsedAmountA.toSignificant() / parseFloat(token0All)) * parseFloat(totalSupply)
    )

    const callParams = {
      shares: cairo.uint256(derivedShares),
      amount0_max: cairo.uint256(adjustedAmountAWithSlippage?.raw.toString()),
      amount1_max: cairo.uint256(adjustedAmountBWithSlippage?.raw.toString()),
    }

    const compiledDepositCalls = CallData.compile(callParams)
    const calls = {
      contractAddress: vaultAddress,
      entrypoint: 'deposit',
      calldata: compiledDepositCalls,
    }

    if (approvalA && approvalB) {
      callData.push(approvalA, approvalB, calls)
    } else {
      if (approvalA) {
        callData.push(approvalA, calls)
      } else if (approvalB) {
        callData.push(approvalB, calls)
      }
    }
    setCallData(callData)
  }
  const getActionContent = () => {
    switch (true) {
      case connectionReady && !account:
        return (
          <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
            <Trans>Connect wallet</Trans>
          </ButtonPrimary>
        )

      default:
        return (
          <ButtonError
            disabled={vaultInputError}
            size={ButtonSize.large}
            error={insufficientBalance}
            id="deposit-button"
            data-testid="deposit-button"
            onClick={activeButton === 'Deposit' ? onDeposit : () => {}}
          >
            {vaultInputError ? vaultInputError : <Trans>{activeButton === 'Deposit' ? 'Deposit' : 'Withdraw'}</Trans>}
          </ButtonError>
        )
    }
  }

  const vaultElement = (
    <VaultWrapper>
      <VaultHeader activeButton={activeButton} setActiveButton={setActiveButton} chainId={chainId} />
      <FullDivider />
      <VaultInputWrapper>
        {activeButton === 'Deposit' && <VaultDeposit currentVault={currentVault} />}
      </VaultInputWrapper>
      {getActionContent()}
    </VaultWrapper>
  )

  return vaultElement
}
