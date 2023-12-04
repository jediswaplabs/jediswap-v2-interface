import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Token, currencyEquals } from '@jediswap/sdk'
import { useWeb3React } from '@web3-react/core'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { Check } from 'react-feather'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'

import { TraceEvent } from 'analytics'
import Loader from 'components/Icons/LoadingSpinner'
import { useCachedPortfolioBalancesQuery } from 'components/PrefetchBalancesWrapper/PrefetchBalancesWrapper'
// import TokenSafetyIcon from 'components/TokenSafety/TokenSafetyIcon'
import { checkWarning } from 'constants/tokenSafety'
import { TokenBalances } from 'lib/hooks/useTokenList/sorting'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ThemedText } from 'theme/components'
import { useIsUserAddedToken } from '../../../hooks/Tokens'
import Column, { AutoColumn } from '../../Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Row, { RowFixed } from '../../Row'
import { MouseoverTooltip } from '../../Tooltip'
import { LoadingRows, MenuItem } from '../styled'
import { scrollbarStyle } from './index.css'
import { WrappedTokenInfo, useSelectedLPTokenList, useSelectedTokenList } from 'state/lists/hooks'
import { useAccountDetails } from 'hooks/starknet-react'
import { isTokenOnList } from 'utils/getContract'
import { useCurrencyBalance } from 'state/wallet/hooks'

function currencyKey(currency: Currency): string {
  // return currency.isToken ? currency.address : 'ETHER';
  return 'ETHER'
}

const CheckIcon = styled(Check)`
  height: 20px;
  width: 20px;
  margin-left: 4px;
  color: ${({ theme }) => theme.accent1};
`

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const CurrencyName = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const WarningContainer = styled.div`
  margin-left: 0.3em;
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return null
  }

  const { tags } = currency
  if (!tags || tags.length === 0) {
    return <span />
  }

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

export function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  showCurrencyAmount,
  eventProperties,
  balance,
}: {
  currency: Currency
  onSelect: (hasWarning: boolean) => void
  isSelected: boolean
  otherSelected: boolean
  style?: CSSProperties
  showCurrencyAmount?: boolean
  eventProperties?: Record<string, unknown>
  balance?: CurrencyAmount
}) {
  const { account, address } = useAccountDetails()

  const key = currencyKey(currency)
  const selectedTokenList = useSelectedTokenList()
  const selectedLPTokenList = useSelectedLPTokenList()

  const isTokenOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const isLPTokenOnSelectedList = isTokenOnList(selectedLPTokenList, currency)

  const isOnSelectedList = isTokenOnSelectedList || isLPTokenOnSelectedList

  const customAdded = useIsUserAddedToken(currency)
  // const balance = useCurrencyBalance(address ?? undefined, currency)

  // const removeToken = useRemoveUserAddedToken()
  // const addToken = useAddUserToken()

  // const addTokenToWallet = useAddTokenToWallet()

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      tabIndex={0}
      style={style}
      className={`token-item-${key}`}
      onKeyPress={(e) => (!isSelected && e.key === 'Enter' ? onSelect(false) : null)}
      onClick={() => (isSelected ? null : onSelect(false))}
      disabled={isSelected}
      selected={otherSelected}
    >
      <Column>
        <CurrencyLogo currency={currency} size={36} />
      </Column>
      <AutoColumn>
        <Row>
          <CurrencyName title={currency.name}>{currency.name}</CurrencyName>
          <WarningContainer>{/* <TokenSafetyIcon warning={warning} /> */}</WarningContainer>
        </Row>
        <ThemedText.LabelMicro ml="0px">{currency.symbol}</ThemedText.LabelMicro>
      </AutoColumn>
      <Column>
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          <TokenTags currency={currency} />
        </RowFixed>
      </Column>
      {showCurrencyAmount ? (
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          {account ? balance ? <Balance balance={balance} /> : <Loader /> : null}
          {isSelected && <CheckIcon />}
        </RowFixed>
      ) : (
        isSelected && (
          <RowFixed style={{ justifySelf: 'flex-end' }}>
            <CheckIcon />
          </RowFixed>
        )
      )}
    </MenuItem>
  )
}

interface TokenRowProps {
  data: Array<Currency>
  index: number
  style: CSSProperties
}

export const formatAnalyticsEventProperties = (
  token: Token,
  index: number,
  data: any[],
  searchQuery: string,
  isAddressSearch: string | false
) => ({
  token_symbol: token?.symbol,
  token_address: token?.address,
  is_suggested_token: false,
  is_selected_from_list: true,
  scroll_position: '',
  token_list_index: index,
  token_list_length: data.length,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

const LoadingRow = () => (
  <LoadingRows data-testid="loading-rows">
    <div />
    <div />
    <div />
  </LoadingRows>
)

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH,
}: {
  height: number
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showETH: boolean
}) {
  const itemData = useMemo(() => (showETH ? [Currency.ETHER, ...currencies] : currencies), [currencies, showETH])

  const Row = useCallback(
    ({ data, index, style }: { data: any; index: any; style: any }) => {
      const currency: Currency = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
