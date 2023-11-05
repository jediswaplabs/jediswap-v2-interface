/* eslint-disable no-nested-ternary */

import { Trans } from '@lingui/macro';
import { ChainId, Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import { ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ArrowDown } from 'react-feather';
import { useLocation, useNavigate } from 'react-router-dom';
import { Text } from 'rebass';
import styled, { useTheme } from 'styled-components';
import { InterfaceSectionName } from '@uniswap/analytics-events';

import { useToggleAccountDrawer } from 'components/AccountDrawer';
import AddressInputPanel from 'components/AddressInputPanel';
import { ButtonEmphasis,
  ButtonError,
  ButtonGray,
  ButtonLight,
  ButtonPrimary,
  ButtonSize,
  ThemeButton } from 'components/Button';
import { GrayCard } from 'components/Card';
import { AutoColumn } from 'components/Column';
import SwapCurrencyInputPanel from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { AutoRow } from 'components/Row';
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee';
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal';
import PriceImpactModal from 'components/swap/PriceImpactModal';
import PriceImpactWarning from 'components/swap/PriceImpactWarning';
import { ArrowWrapper, PageWrapper, SwapWrapper } from 'components/swap/styled';
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown';
import SwapHeader from 'components/swap/SwapHeader';
import { SwitchLocaleLink } from 'components/SwitchLocaleLink';
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal';
import { useConnectionReady } from 'connection/eagerlyConnect';
import { getChainInfo } from 'constants/chainInfo';
import { asSupportedChain, isSupportedChain } from 'constants/chains';
import { getSwapCurrencyId, TOKEN_SHORTHANDS } from 'constants/tokens';
import { useUniswapXDefaultEnabled } from 'featureFlags/flags/uniswapXDefault';
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens';
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported';
import { useMaxAmountIn } from 'hooks/useMaxAmountIn';
import usePermit2Allowance, { AllowanceState } from 'hooks/usePermit2Allowance';
import usePrevious from 'hooks/usePrevious';
import { SwapResult, useSwapCallback } from 'hooks/useSwapCallback';
import { useSwitchChain } from 'hooks/useSwitchChain';
import { useUSDPrice } from 'hooks/useUSDPrice';
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback';
import { formatSwapQuoteReceivedEventProperties } from 'lib/utils/analytics';
import { useAppSelector } from 'state/hooks';
import { InterfaceTrade, TradeState } from 'state/routing/types';
import { isClassicTrade, isPreviewTrade } from 'state/routing/utils';
import { Field, forceExactInput, replaceSwapState } from 'state/swap/actions';
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks';
import swapReducer, { initialState as initialSwapState, SwapState } from 'state/swap/reducer';
import { LinkStyledButton, ThemedText } from 'theme/components';
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact';
import { NumberType, useFormatter } from 'utils/formatNumbers';
import { maxAmountSpend } from 'utils/maxAmountSpend';
import { computeRealizedPriceImpact, warningSeverity } from 'utils/prices';
import { didUserReject } from 'utils/swapErrorToUserReadableMessage';
import { useScreenSize } from '../../hooks/useScreenSize';
import { OutputTaxTooltipBody } from './TaxTooltipBody';

export const ArrowContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`;

const SwapSection = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  border-radius: 8px;
  color: ${({ theme }) => theme.neutral2};
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.20) inset, 0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.30) inset, 0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.30) inset, 0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.30) inset;
  font-size: 14px;
  font-weight: 500;
  //height: 120px;
  line-height: 20px;
  padding: 16px;
  position: relative;
 
  &:before {
    box-sizing: border-box;
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid ${({ theme }) => theme.surface2};
  }
`;

const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.surface1}`};
`;

function getIsReviewableQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode,
): boolean {
  if (swapInputError) { return false; }
  // if the current quote is a preview quote, allow the user to progress to the Swap review screen
  if (isPreviewTrade(trade)) { return true; }

  return Boolean(trade && tradeState === TradeState.VALID);
}

function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b;
  } if (a) {
    return a;
  } if (b) {
    return b;
  }
  return undefined;
}

export default function SwapPage({ className }: { className?: string }) {
  const { chainId: connectedChainId } = useWeb3React();
  const loadedUrlParams = useDefaultsFromURLSearch();

  const supportedChainId = asSupportedChain(connectedChainId);

  return (
    <PageWrapper>
      <Swap
        className={className}
        chainId={supportedChainId ?? ChainId.MAINNET}
        initialInputCurrencyId={loadedUrlParams?.[Field.INPUT]?.currencyId}
        initialOutputCurrencyId={loadedUrlParams?.[Field.OUTPUT]?.currencyId}
        disableTokenInputs={supportedChainId === undefined}
      />
    </PageWrapper>
  );
}

/**
 * The swap component displays the swap interface, manages state for the swap, and triggers onchain swaps.
 *
 * In most cases, chainId should refer to the connected chain, i.e. `useWeb3React().chainId`.
 * However if this component is being used in a context that displays information from a different, unconnected
 * chain (e.g. the TDP), then chainId should refer to the unconnected chain.
 */
export function Swap({ className,
  initialInputCurrencyId,
  initialOutputCurrencyId,
  chainId,
  onCurrencyChange,
  disableTokenInputs = false }: {
  className?: string
  initialInputCurrencyId?: string | null
  initialOutputCurrencyId?: string | null
  chainId?: ChainId
  onCurrencyChange?: (selected: Pick<SwapState, Field.INPUT | Field.OUTPUT>) => void
  disableTokenInputs?: boolean
}) {
  const connectionReady = useConnectionReady();
  const { account, chainId: connectedChainId, connector } = useWeb3React();

  // token warning stuff
  const prefilledInputCurrency = useCurrency(initialInputCurrencyId, chainId);
  const prefilledOutputCurrency = useCurrency(initialOutputCurrencyId, chainId);

  const [loadedInputCurrency, setLoadedInputCurrency] = useState(prefilledInputCurrency);
  const [loadedOutputCurrency, setLoadedOutputCurrency] = useState(prefilledOutputCurrency);

  useEffect(() => {
    setLoadedInputCurrency(prefilledInputCurrency);
    setLoadedOutputCurrency(prefilledOutputCurrency);
  }, [prefilledInputCurrency, prefilledOutputCurrency]);

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const [showPriceImpactModal, setShowPriceImpactModal] = useState<boolean>(false);

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useDefaultActiveTokens(chainId);
  const importTokensNotInDefault = useMemo(
    () => urlLoadedTokens
      && urlLoadedTokens
        .filter((token: Token) => !(token.address in defaultTokens))
        .filter((token: Token) => {
          // Any token addresses that are loaded from the shorthands map do not need to show the import URL
          const supported = asSupportedChain(chainId);
          if (!supported) { return true; }
          return !Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
            const shorthandTokenAddress = TOKEN_SHORTHANDS[shorthand][supported];
            return shorthandTokenAddress && shorthandTokenAddress === token.address;
          });
        }),
    [chainId, defaultTokens, urlLoadedTokens],
  );

  const theme = useTheme();

  // toggle wallet when disconnected
  const toggleWalletDrawer = useToggleAccountDrawer();

  // swap state
  const prefilledState = useMemo(
    () => ({
      [Field.INPUT]: { currencyId: initialInputCurrencyId },
      [Field.OUTPUT]: { currencyId: initialOutputCurrencyId },
    }),
    [initialInputCurrencyId, initialOutputCurrencyId],
  );
  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState });
  const { typedValue, recipient, independentField } = state;

  const previousConnectedChainId = usePrevious(connectedChainId);
  const previousPrefilledState = usePrevious(prefilledState);
  useEffect(() => {
    const combinedInitialState = { ...initialSwapState, ...prefilledState };
    const chainChanged = previousConnectedChainId && previousConnectedChainId !== connectedChainId;
    const prefilledInputChanged = previousPrefilledState
      && previousPrefilledState?.[Field.INPUT]?.currencyId !== prefilledState?.[Field.INPUT]?.currencyId;
    const prefilledOutputChanged = previousPrefilledState
      && previousPrefilledState?.[Field.OUTPUT]?.currencyId !== prefilledState?.[Field.OUTPUT]?.currencyId;
    if (chainChanged || prefilledInputChanged || prefilledOutputChanged) {
      dispatch(
        replaceSwapState({
          ...initialSwapState,
          ...prefilledState,
          field: combinedInitialState.independentField ?? Field.INPUT,
          inputCurrencyId: combinedInitialState.INPUT.currencyId ?? undefined,
          outputCurrencyId: combinedInitialState.OUTPUT.currencyId ?? undefined,
        }),
      );
      // reset local state
      setSwapState({
        tradeToConfirm: undefined,
        swapError: undefined,
        showConfirm: false,
        swapResult: undefined,
      });
    }
  }, [connectedChainId, prefilledState, previousConnectedChainId, previousPrefilledState]);

  const swapInfo = useDerivedSwapInfo(state, chainId);
  const { trade: { state: tradeState, trade, swapQuoteLatency },
    allowedSlippage,
    autoSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    inputTax,
    outputTax,
    outputFeeFiatValue } = swapInfo;

  const [inputTokenHasTax, outputTokenHasTax] = useMemo(
    () => [!inputTax.equalTo(0), !outputTax.equalTo(0)],
    [inputTax, outputTax],
  );

  useEffect(() => {
    // Force exact input if the user switches to an output token with tax
    if (outputTokenHasTax && independentField === Field.OUTPUT) { dispatch(forceExactInput()); }
  }, [independentField, outputTokenHasTax, trade?.outputAmount]);

  const { wrapType,
    execute: onWrap,
    inputError: wrapInputError } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

  const parsedAmounts = useMemo(
    () => (showWrap
      ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
      : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.postTaxOutputAmount,
      }),
    [independentField, parsedAmount, showWrap, trade],
  );

  const showFiatValueInput = Boolean(parsedAmounts[Field.INPUT]);
  const showFiatValueOutput = Boolean(parsedAmounts[Field.OUTPUT]);
  const getSingleUnitAmount = (currency?: Currency) => {
    if (!currency) { return; }
    return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(10 ** currency.decimals));
  };

  const fiatValueInput = useUSDPrice(
    parsedAmounts[Field.INPUT] ?? getSingleUnitAmount(currencies[Field.INPUT]),
    currencies[Field.INPUT],
  );
  const fiatValueOutput = useUSDPrice(
    parsedAmounts[Field.OUTPUT] ?? getSingleUnitAmount(currencies[Field.OUTPUT]),
    currencies[Field.OUTPUT],
  );

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      tradeState === TradeState.NO_ROUTE_FOUND,
      tradeState === TradeState.LOADING,
      tradeState === TradeState.LOADING && Boolean(trade),
    ],
    [trade, tradeState],
  );

  const fiatValueTradeInput = useUSDPrice(trade?.inputAmount);
  const fiatValueTradeOutput = useUSDPrice(trade?.postTaxOutputAmount);
  const preTaxFiatValueTradeOutput = useUSDPrice(trade?.outputAmount);
  const [stablecoinPriceImpact, preTaxStablecoinPriceImpact] = useMemo(
    () => (routeIsSyncing || !isClassicTrade(trade)
      ? [undefined, undefined]
      : [
        computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
        computeFiatValuePriceImpact(fiatValueTradeInput.data, preTaxFiatValueTradeOutput.data),
      ]),
    [fiatValueTradeInput, fiatValueTradeOutput, preTaxFiatValueTradeOutput, routeIsSyncing, trade],
  );

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers(dispatch);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  const navigate = useNavigate();
  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT]);

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
    navigate('/swap/');
  }, [navigate]);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm?: InterfaceTrade
    swapError?: Error
    swapResult?: SwapResult
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    swapError: undefined,
    swapResult: undefined,
  });

  const { formatCurrencyAmount } = useFormatter();
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : formatCurrencyAmount({
          amount: parsedAmounts[dependentField],
          type: NumberType.SwapTradeAmount,
          placeholder: '',
        }),
    }),
    [dependentField, formatCurrencyAmount, independentField, parsedAmounts, showWrap, typedValue],
  );

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );

  const maximumAmountIn = useMaxAmountIn(trade, allowedSlippage);
  const allowance = usePermit2Allowance(
    maximumAmountIn
      ?? (parsedAmounts[Field.INPUT]?.currency.isToken
        ? (parsedAmounts[Field.INPUT] as CurrencyAmount<Token>)
        : undefined),
    isSupportedChain(chainId) ? UNIVERSAL_ROUTER_ADDRESS(chainId) : undefined,
    trade?.fillType,
  );

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances],
  );
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount));
  const swapFiatValues = useMemo(() => ({ amountIn: fiatValueTradeInput.data, amountOut: fiatValueTradeOutput.data, feeUsd: outputFeeFiatValue }), [fiatValueTradeInput.data, fiatValueTradeOutput.data, outputFeeFiatValue]);

  // the callback to execute the swap
  const swapCallback = useSwapCallback(
    trade,
    swapFiatValues,
    allowedSlippage,
    allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined,
  );

  const handleContinueToReview = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapError: undefined,
      showConfirm: true,
      swapResult: undefined,
    });
  }, [trade]);

  const clearSwapState = useCallback(() => {
    setSwapState((currentState) => ({
      ...currentState,
      swapError: undefined,
      swapResult: undefined,
    }));
  }, []);

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return;
    }
    if (preTaxStablecoinPriceImpact && !confirmPriceImpactWithoutFee(preTaxStablecoinPriceImpact)) {
      return;
    }
    swapCallback()
      .then((result) => {
        setSwapState((currentState) => ({
          ...currentState,
          swapError: undefined,
          swapResult: result,
        }));
      })
      .catch((error) => {
        setSwapState((currentState) => ({
          ...currentState,
          swapError: error,
          swapResult: undefined,
        }));
      });
  }, [swapCallback, preTaxStablecoinPriceImpact]);

  const handleOnWrap = useCallback(async () => {
    if (!onWrap) { return; }
    try {
      const txHash = await onWrap();
      setSwapState((currentState) => ({
        ...currentState,
        swapError: undefined,
        txHash,
      }));
      onUserInput(Field.INPUT, '');
    } catch (error) {
      console.error('Could not wrap/unwrap', error);
      setSwapState((currentState) => ({
        ...currentState,
        swapError: error,
        txHash: undefined,
      }));
    }
  }, [currencies, onUserInput, onWrap, wrapType]);

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    if (!isClassicTrade(trade)) {
      return { priceImpactSeverity: 0, largerPriceImpact: undefined };
    }

    const marketPriceImpact = trade?.priceImpact ? computeRealizedPriceImpact(trade) : undefined;
    const newLargerPriceImpact = largerPercentValue(marketPriceImpact, preTaxStablecoinPriceImpact);
    return { priceImpactSeverity: warningSeverity(newLargerPriceImpact), newLargerPriceImpact };
  }, [preTaxStablecoinPriceImpact, trade]);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState((currentState) => ({ ...currentState, showConfirm: false }));
    // If there was a swap, we want to clear the input
    if (swapResult) {
      onUserInput(Field.INPUT, '');
    }
  }, [onUserInput, swapResult]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState((currentState) => ({ ...currentState, tradeToConfirm: trade }));
  }, [trade]);

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(Field.INPUT, inputCurrency);
      onCurrencyChange?.({
        [Field.INPUT]: {
          currencyId: getSwapCurrencyId(inputCurrency),
        },
        [Field.OUTPUT]: state[Field.OUTPUT],
      });
    },
    [onCurrencyChange, onCurrencySelection, state],
  );
  const inputCurrencyNumericalInputRef = useRef<HTMLInputElement>(null);

  const handleMaxInput = useCallback(() => {
    if (!maxInputAmount) { return; }
    onUserInput(Field.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency);
      onCurrencyChange?.({
        [Field.INPUT]: state[Field.INPUT],
        [Field.OUTPUT]: {
          currencyId: getSwapCurrencyId(outputCurrency),
        },
      });
    },
    [onCurrencyChange, onCurrencySelection, state],
  );

  const showPriceImpactWarning = isClassicTrade(trade) && largerPriceImpact && priceImpactSeverity > 3;

  const prevTrade = usePrevious(trade);
  useEffect(() => {
    if (!trade || prevTrade === trade) { } // no new swap quote to log
  }, [prevTrade, trade, allowedSlippage, swapQuoteLatency, inputTax, outputTax, outputFeeFiatValue]);

  const showDetailsDropdown = Boolean(
    !showWrap && userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing),
  );

  const inputCurrency = currencies[Field.INPUT] ?? undefined;

  const swapElement = (
    <SwapWrapper className={className} id="swap-page">
      <TokenSafetyModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokenAddress={importTokensNotInDefault[0]?.address}
        secondTokenAddress={importTokensNotInDefault[1]?.address}
        onContinue={handleConfirmTokenWarning}
        onCancel={handleDismissTokenWarning}
        showCancel
      />
      <SwapHeader trade={trade} autoSlippage={autoSlippage} chainId={chainId} />
      {trade && showConfirm && (
        <ConfirmSwapModal
          trade={trade}
          inputCurrency={inputCurrency}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          onCurrencySelection={onCurrencySelection}
          swapResult={swapResult}
          allowedSlippage={allowedSlippage}
          clearSwapState={clearSwapState}
          onConfirm={handleSwap}
          allowance={allowance}
          swapError={swapError}
          onDismiss={handleConfirmDismiss}
          fiatValueInput={fiatValueTradeInput}
          fiatValueOutput={fiatValueTradeOutput}
        />
      )}
      {showPriceImpactModal && showPriceImpactWarning && (
        <PriceImpactModal
          priceImpact={largerPriceImpact}
          onDismiss={() => setShowPriceImpactModal(false)}
          onContinue={() => {
            setShowPriceImpactModal(false);
            handleContinueToReview();
          }}
        />
      )}

      <div style={{ display: 'relative' }}>
        <SwapSection>
          <SwapCurrencyInputPanel
            label={<Trans>From</Trans>}
            disabled={disableTokenInputs}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            currency={currencies[Field.INPUT] ?? null}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            fiatValue={showFiatValueInput ? fiatValueInput : undefined}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            showCommonBases
            id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
            loading={independentField === Field.OUTPUT && routeIsSyncing}
            ref={inputCurrencyNumericalInputRef}
          />
        </SwapSection>
        <ArrowWrapper clickable={isSupportedChain(chainId)}>
          <ArrowContainer
            data-testid="swap-currency-button"
            onClick={() => {
              if (disableTokenInputs) { return; }
              onSwitchTokens(inputTokenHasTax, formattedAmounts[dependentField]);
            }}
            color={theme.neutral1}
          >
            <ArrowDown size="16" color={theme.neutral1} />
          </ArrowContainer>
        </ArrowWrapper>
      </div>
      <AutoColumn gap="lg">
        <div>
          <OutputSwapSection>
            <SwapCurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              disabled={disableTokenInputs}
              onUserInput={handleTypeOutput}
              label={<Trans>To</Trans>}
              showMaxButton={false}
              hideBalance={false}
              fiatValue={showFiatValueOutput ? fiatValueOutput : undefined}
              priceImpact={stablecoinPriceImpact}
              currency={currencies[Field.OUTPUT] ?? null}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              showCommonBases
              id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
              loading={independentField === Field.INPUT && routeIsSyncing}
              numericalInputSettings={{
                // We disable numerical input here if the selected token has tax, since we cannot guarantee exact_outputs for FOT tokens
                disabled: outputTokenHasTax,
                // Focus the input currency panel if the user tries to type into the disabled output currency panel
                onDisabledClick: () => inputCurrencyNumericalInputRef.current?.focus(),
                disabledTooltipBody: <OutputTaxTooltipBody currencySymbol={currencies[Field.OUTPUT]?.symbol} />,
              }}
            />
            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.neutral2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove recipient</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
          </OutputSwapSection>
        </div>
        <div>
          {swapIsUnsupported ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Unsupported asset</Trans>
            </ButtonPrimary>
          ) : connectionReady && !account ? (
            <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Insufficient liquidity</Trans>
            </ButtonPrimary>
          ) : routeIsSyncing || routeIsLoading ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Fetching...</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonError
              onClick={() => {
                if (!showPriceImpactWarning) {
                  handleContinueToReview();
                  return;
                }
                setShowPriceImpactModal(true);
              }}
              id="swap-button"
              data-testid="swap-button"
              size={ButtonSize.large}
              disabled={!getIsReviewableQuote(trade, tradeState, swapInputError)}
              error={!swapInputError && priceImpactSeverity > 2 && allowance.state === AllowanceState.ALLOWED}
            >
              {swapInputError || (routeIsSyncing || routeIsLoading ? (<Trans>Swap</Trans>) : priceImpactSeverity > 2 ? (
                <Trans>Swap anyway</Trans>
              ) : (
                <Trans>Swap</Trans>
              ))}
            </ButtonError>
          )}
        </div>

        {showDetailsDropdown && (
          <SwapDetailsDropdown
            trade={trade}
            syncing={routeIsSyncing}
            loading={routeIsLoading}
            allowedSlippage={allowedSlippage}
          />
        )}
        {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
      </AutoColumn>
    </SwapWrapper>
  );

  return (
    swapElement
  );
}
