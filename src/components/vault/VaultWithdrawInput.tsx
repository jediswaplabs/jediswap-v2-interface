import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useAccountDetails } from 'hooks/starknet-react'
import { loadingOpacityMixin } from 'components/Loader/styled'
import PrefetchBalancesWrapper from 'components/PrefetchBalancesWrapper/PrefetchBalancesWrapper'
import { isSupportedChain } from 'constants/chains'
import { ThemedText } from 'theme/components'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { ButtonGray } from '../Button'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween, RowFixed } from '../Row'
import { useUserShares } from './hooks'
import formatBalance from 'utils/formatBalance'
import { useCurrency } from 'hooks/Tokens'
import { useVaultState } from 'state/vaults/hooks'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import JSBI from 'jsbi'
import { BigNumber } from 'ethers'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${flexColumnNoWrap};
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  // background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.surface2)};

  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const Container = styled.div<{ hideInput: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '8px')};
  background-color: rgba(196, 196, 196, 0.01);
  padding: 16px;
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset;
  width: ${({ hideInput }) => (hideInput ? '90%' : 'initial')};
  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
    :focus,
    :hover {
      border: 1px solid ${hideInput ? ' transparent' : theme.surface2};
    }
  `}
`

const CurrencySelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
  pointerEvents?: string
}>`
  align-items: center;
  // background-color: ${({ selected, theme }) => (selected ? theme.surface1 : theme.accent1)};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ theme }) => theme.deprecated_shallowShadow};
  color: ${({ selected, theme }) => (selected ? theme.neutral1 : theme.white)};
  cursor: pointer;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 535;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  border-radius: 8px;
  ${({ pointerEvents }) => pointerEvents && 'pointer-events: none'}
`

const InputRow = styled.div<{ selected: boolean }>`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.neutral1};
  font-size: 0.75rem;
  line-height: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.neutral2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  height: 32px;
`

// note the line height 0 ensures even if we change font/font-size it doesn't break centering
const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  line-height: 0px;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.neutral1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 14px;
  font-weight: 700;
  font-family: 'DM Sans';
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  // background-color: ${({ theme }) => theme.accent2};
  border: 1px solid #444;
  border-radius: 4px;
  color: ${({ theme }) => theme.jediWhite};
  cursor: pointer;
  font-size: 11px;
  font-weight: 535;
  margin-right: 0.5rem;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
`

const StyledPrefetchBalancesWrapper = styled(PrefetchBalancesWrapper)`
  width: 50%;
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  vaultPair?: any
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: { data?: number; isLoading: boolean }
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  hideShadow?: boolean
  currentVault: any
}

export default function VaultWithdrawInput({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  hideBalance = false,
  vaultPair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  hideShadow = false,
  currentVault,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { address: account, chainId } = useAccountDetails()
  const currency0 = useCurrency(currentVault.token0.address)
  const currency1 = useCurrency(currentVault.token1.address)
  const vaultState = useVaultState()
  const { totalShares } = useUserShares(vaultState, currency0 ?? undefined, currency1 ?? undefined)
  let sharesInDecimals = ''
  if (totalShares) {
    const bigNumber = BigNumber.from(totalShares.toString())
    const divisor = BigNumber.from('1000000000000000000')

    // Scale the numerator
    const scaleFactor = BigNumber.from('1000000000000000000')
    const scaledNumerator = bigNumber.mul(scaleFactor)

    // Perform the division
    const result = scaledNumerator.div(divisor)

    // Adjust the result to get the correct decimal places
    const resultString = result.toString()
    const integerPart = resultString.slice(0, -18) || '0'
    const fractionalPart = resultString.slice(-18).padStart(18, '0')

    sharesInDecimals = `${integerPart}.${fractionalPart}`
  }

  const formattedShares = formatBalance(sharesInDecimals ?? 0)

  const theme = useTheme()

  const chainAllowed = isSupportedChain(chainId)

  const handleMaxAmount = () => {
    if (totalShares && sharesInDecimals) {
      onUserInput(sharesInDecimals)
    }
  }

  const containerStyles = hideShadow ? { boxShadow: 'none' } : {}
  //   const showMax = sharesInDecimals !== null && Number(value) !== Number(sharesInDecimals)
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {!locked && (
        <Container hideInput={hideInput} disabled={!chainAllowed} style={containerStyles}>
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected>
            <StyledPrefetchBalancesWrapper shouldFetchOnAccountUpdate={modalOpen}>
              <CurrencySelect
                disabled={!chainAllowed}
                visible
                selected={!!currency}
                hideInput={hideInput}
                className="open-currency-select-button"
                pointerEvents={'none'}
              >
                <Aligner>
                  <RowFixed>
                    <span style={{ marginRight: '0.5rem' }}>
                      <DoubleCurrencyLogo
                        currency0={vaultPair?.token0Currency}
                        currency1={vaultPair?.token1Currency}
                        size={24}
                        margin
                      />
                    </span>

                    <StyledTokenName className="pair-name-container">
                      {vaultPair?.token0Currency?.symbol}-{vaultPair?.token1Currency?.symbol}
                    </StyledTokenName>
                  </RowFixed>
                </Aligner>
              </CurrencySelect>
            </StyledPrefetchBalancesWrapper>
            {!hideInput && (
              <StyledNumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={onUserInput}
                disabled={!chainAllowed}
                $loading={loading}
                style={{ width: 'auto', textAlign: 'right' }}
              />
            )}
          </InputRow>
          {Boolean(!hideInput && !hideBalance) && (
            <FiatRow>
              <RowBetween>
                {account && (
                  <RowFixed style={{ height: '17px' }}>
                    {true && formattedShares && (
                      <StyledBalanceMax onClick={handleMaxAmount}>
                        <Trans>MAX</Trans>
                      </StyledBalanceMax>
                    )}
                    <ThemedText.DeprecatedBody
                      onClick={handleMaxAmount}
                      color={theme.neutral3}
                      fontWeight={535}
                      fontSize={14}
                      style={{ display: 'inline', cursor: 'pointer' }}
                    >
                      {formattedShares && <>Bal: {formattedShares}</>}
                    </ThemedText.DeprecatedBody>
                  </RowFixed>
                )}
              </RowBetween>
            </FiatRow>
          )}
        </Container>
      )}
    </InputPanel>
  )
}
