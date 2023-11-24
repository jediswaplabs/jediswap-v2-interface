import { BigNumber } from '@ethersproject/bignumber';
import { Trans } from '@lingui/macro';
import { Percent, Price, Token } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import RangeBadge from 'components/Badge/RangeBadge';
import DoubleCurrencyLogo from 'components/DoubleLogo';
import HoverInlineText from 'components/HoverInlineText';
import Loader from 'components/Icons/LoadingSpinner';
import { RowBetween } from 'components/Row';
import { useToken } from 'hooks/Tokens';
import useIsTickAtLimit from 'hooks/useIsTickAtLimit';
import { usePool } from 'hooks/usePools';
import { Bound } from 'state/mint/v3/actions';
import { MEDIA_WIDTHS } from 'theme';
import { HideSmall, MediumOnly, SmallOnly, ThemedText } from 'theme/components';
import { useFormatter } from 'utils/formatNumbers';
import { unwrappedToken } from 'utils/unwrappedToken';
import { DAI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens';

const LinkRow = styled(Link)`
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.neutral1};
  padding: 16px;
  text-decoration: none;
  font-weight: 535;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.deprecated_hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`;

const PositionListItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.5fr 0.5fr 1fr;
  grid-template-areas: "MyPositions Liqidity Fee Range";
  text-align: right;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    grid-template-areas: "MyPositions MyPositions MyPositions Range";
  }
`;

const DataLineItem = styled.div`
  font-size: 14px;
`;
const CurrencyText = styled.div`
  font-size: 14px;
  font-family: 'DM Sans';
  font-weight: 700;
`;

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  width: 100%;
`;

const DoubleArrow = styled.span`
  font-size: 12px;
  margin: 0 2px;
  color: ${({ theme }) => theme.neutral1};
`;

const RangeText = styled(ThemedText.BodySmall)`
  font-size: 12px !important;
  word-break: break-word;
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
  font-family: 'DM Sans';
  font-weight: 400;
`;
const PositionListItemText = styled.div`
  grid-area: Liqidity;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`;

const PositionListItemFee = styled.div`
  grid-area: Fee;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`;

const RangeBadgeWrapper = styled.div`
  grid-area: Range;
`;

const ExtentsText = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.neutral2};
  display: inline-block;
  line-height: 16px;
  margin-right: 4px !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`;

const PrimaryPositionIdData = styled.div`
  grid-area: MyPositions;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`;
const PositionListItemHeading = styled.div`
  color: ${({ theme }) => theme.neutral2};
  font-family: DM Sans;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px;
  flex: 0.3;
`;
const PositionListItemMobileWrapper = styled.div`
  display: flex;
`;
const PositionListItemMobile = styled.div`
  font-family: DM Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px;
  flex: 0.3;
  margin-top: 4px;
`;

const FeeTierText = styled(ThemedText.UtilityBadge)`

`;

interface PositionListItemProps {
  token0: string
  token1: string
  tokenId: BigNumber
  fee: number
  liquidity: BigNumber
  tickLower: number
  tickUpper: number
}

export function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {};
  }

  const token0 = position.amount0.currency;
  const token1 = position.amount1.currency;

  // if token0 is a dollar-stable asset, set it as the quote token
  const stables = [DAI, USDC_MAINNET, USDT];
  if (stables.some((stable) => stable.equals(token0))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  const bases = [...Object.values(WRAPPED_NATIVE_CURRENCY), WBTC];
  if (bases.some((base) => base && base.equals(token1))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  };
}

export default function PositionListItem({ token0: token0Address,
  token1: token1Address,
  tokenId,
  fee: feeAmount,
  liquidity,
  tickLower,
  tickUpper }: PositionListItemProps) {
  const { formatTickPrice } = useFormatter();

  const token0 = useToken(token0Address);
  const token1 = useToken(token1Address);

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount);

  const position = useMemo(() => {
    if (pool) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper });
    }
    return undefined;
  }, [liquidity, pool, tickLower, tickUpper]);

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper);

  // prices
  const { priceLower, priceUpper, quote, base } = getPriceOrderingFromPositionForUI(position);

  const currencyQuote = quote && unwrappedToken(quote);
  const currencyBase = base && unwrappedToken(base);

  // check if price is within range
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false;

  const positionSummaryLink = `/pools/${tokenId}`;

  const removed = liquidity?.eq(0);

  return (
    <LinkRow to={positionSummaryLink}>
      <PositionListItemWrapper>
        <PrimaryPositionIdData>
          <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={24} margin />
          <ThemedText.SubHeader>
            <CurrencyText>
              &nbsp;{currencyQuote?.symbol}&nbsp;/&nbsp;{currencyBase?.symbol}
            </CurrencyText>
          </ThemedText.SubHeader>
        </PrimaryPositionIdData>
        <PositionListItemText>$16.89</PositionListItemText>
        <PositionListItemFee>$0</PositionListItemFee>
        <RangeBadgeWrapper>
          <RangeBadge removed={removed} inRange={!outOfRange} />
        </RangeBadgeWrapper>
      </PositionListItemWrapper>

      {priceLower && priceUpper ? (
        <RangeLineItem>
          <RangeText>
            <ExtentsText>
              <Trans>Min: </Trans>
            </ExtentsText>
            <Trans>
              <span>
                {formatTickPrice({
                  price: priceLower,
                  atLimit: tickAtLimit,
                  direction: Bound.LOWER,
                })}{' '}
              </span>
              <HoverInlineText text={currencyQuote?.symbol} /> per <HoverInlineText text={currencyBase?.symbol ?? ''} />
            </Trans>
          </RangeText>{' '}
          <HideSmall>
            <DoubleArrow>↔</DoubleArrow>{' '}
          </HideSmall>
          <MediumOnly>
            <DoubleArrow>↔</DoubleArrow>{' '}
          </MediumOnly>
          <RangeText>
            <ExtentsText>
              <Trans>Max:</Trans>
            </ExtentsText>
            <Trans>
              <span>
                {formatTickPrice({
                  price: priceUpper,
                  atLimit: tickAtLimit,
                  direction: Bound.UPPER,
                })}{' '}
              </span>
              <HoverInlineText text={currencyQuote?.symbol} /> per{' '}
              <HoverInlineText maxCharacters={10} text={currencyBase?.symbol} />
            </Trans>
          </RangeText>
        </RangeLineItem>
      ) : (
        <Loader />
      )}
      <MediumOnly>
        <PositionListItemMobileWrapper>
          <PositionListItemHeading>Liquidity</PositionListItemHeading>
          <PositionListItemHeading>Fees earned</PositionListItemHeading>
        </PositionListItemMobileWrapper>
        <PositionListItemMobileWrapper>
          <PositionListItemMobile>$16.89</PositionListItemMobile>
          <PositionListItemMobile>$3467.26</PositionListItemMobile>
        </PositionListItemMobileWrapper>
      </MediumOnly>
    </LinkRow>
  );
}
