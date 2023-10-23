import { CurrencyAmount, JSBI, Token, Trade } from "@jediswap/sdk";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import Settings from "../../components/Settings";

import { ArrowDown } from "react-feather";
import { Text } from "rebass";
import { ThemeContext, useTheme } from "styled-components";
// import AddressInputPanel from '../../components/AddressInputPanel'
import {
  ButtonError,
  ButtonConfirmed,
  ButtonEmpty,
  ButtonOutlined,
  ButtonPrimary
} from "../../components/Button";
// import { ButtonLight } from '../../components/Button'
// import { ButtonGradient, RedGradientButton } from '../../components/Button'
import Card, { GreyCard } from "../../components/Card";
import Column, { AutoColumn } from "../../components/Column";
// import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
// import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from "../../components/Row";

// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
// import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
// import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
// import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
// import TradePrice from '../../components/swap/TradePrice'
// import TokenWarningModal from '../../components/TokenWarningModal'
// import ProgressSteps from '../../components/ProgressSteps'

// import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
// import { useCurrency } from '../../hooks/Tokens'
// import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
// // import useENSAddress from '../../hooks/useENSAddress.ts'
// import { useSwapCallback } from '../../hooks/useSwapCallback'
// import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
// // import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
// import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
// import { Field } from '../../state/swap/actions'
// import {
//   useSwapDefaultsFromURLSearch,
//   useDerivedSwapInfo,
//   useSwapActionHandlers,
//   useSwapState
// } from '../../state/swap/hooks'
// import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
// import { DMSansText, LinkStyledButton, TYPE } from '../../theme'

// import { maxAmountSpend } from '../../utils/maxAmountSpend'
// import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from "../AppBody";
import {
  ClickableText,
  Backdrop,
  BalanceText,
  HeaderRow,
  IconWrapper,
  Icon,
  AddTokenRow,
  AddTokenText
} from "./styleds";
// import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'

import styled from "styled-components";
import HeaderIcon from "../../assets/jedi/SwapPanel_headerItem.svg";
import SwapWidget from "../../assets/jedi/SwapWidget.svg";
// import { useUserTransactionTTL } from '../../state/user/hooks'
// import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right-blue.svg'
// import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'
// import { wrappedCurrency } from '../../utils/wrappedCurrency'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'

// import { useAccountDetails } from '../../hooks'
import { LinkStyledButton } from "theme/components";
import Loader from "components/Icons/LoadingSpinner";
import { ArrowWrapper, PageWrapper, SwapWrapper } from "components/swap";

const MintSection = styled.section`
  margin-top: 3rem;
  max-width: 470px;
  width: 100%;
`;

const MintButton = styled(ButtonOutlined)`
  font-family: "DM Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  border-color: ${({ theme }) => theme.jediBlue};
  color: ${({ theme }) => theme.jediWhite};
`;

export default function Swap() {
  const theme = useTheme();

  return (
    <PageWrapper>
      {/* <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      /> */}
      <AppBody>
        <Backdrop top={"0"} left={"503px"} curveRight />
        <Backdrop
          top={"30px"}
          left={"493px"}
          curveRight
          style={{ height: "60px" }}
        />
        <Backdrop
          bottom={"30px"}
          left={"-35px"}
          curveLeft
          style={{ height: "60px" }}
        />
        <Backdrop bottom={"0px"} left={"-45px"} curveLeft />
        {/* <SwapPoolTabs active={'swap'} /> */}
        <SwapWrapper id="swap-page">
          {/* <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          /> */}
          <div style={{ marginBottom: "30px" }}>
            <HeaderRow>
              SWAP
              {/* <Icon src={HeaderIcon} /> */}
              {/* <Settings /> */}
            </HeaderRow>
          </div>
          <HeaderRow>
            <BalanceText>Swap From</BalanceText>
            {/*    {address && currencies[Field.INPUT] ? (
              <BalanceText>Balance: {currencyBalances.INPUT?.toSignificant(6) ?? <Loader />}</BalanceText>
            ) : null} */}
          </HeaderRow>
          <AutoColumn>
            <CurrencyInputPanel
              // label={independentField === Field.OUTPUT && trade ? 'From (estimated)' : 'From'}
              // value={formattedAmounts[Field.INPUT]}
              // showMaxButton={!atMaxAmountInput}
              // currency={currencies[Field.INPUT]}
              // onUserInput={handleTypeInput}
              // onMax={handleMaxInput}
              // onCurrencySelect={handleInputSelect}
              // otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={"center"} style={{ padding: "0 1rem" }}>
                <ArrowWrapper clickable>
                  <IconWrapper
                  // onClick={() => {
                  //   setApprovalSubmitted(false) // reset 2 step UI for approvals
                  //   onSwitchTokens()
                  // }}
                  >
                    <Icon noMargin unlimited src={SwapWidget} />
                  </IconWrapper>
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <HeaderRow style={{ marginTop: "25px" }}>
              <BalanceText>Swap To (est.)</BalanceText>
              {/* {address && currencies[Field.OUTPUT] ? (
                <BalanceText>Balance: {currencyBalances.OUTPUT?.toSignificant(6) ?? <Loader />}</BalanceText>
              ) : null} */}
            </HeaderRow>
            <CurrencyInputPanel
              // value={formattedAmounts[Field.OUTPUT]}
              // onUserInput={handleTypeOutput}
              // // label={independentField === Field.INPUT && trade ? 'To (estimated)' : 'To'}
              // showMaxButton={false}
              // currency={currencies[Field.OUTPUT]}
              // onCurrencySelect={handleOutputSelect}
              // otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            <Card padding={"17px 0"} borderRadius={"20px"}>
              <AutoColumn gap="10px"></AutoColumn>
            </Card>
          </AutoColumn>

          <AutoColumn gap="md">
            <ButtonError>
              <Text fontWeight={535}>Swap</Text>
            </ButtonError>
          </AutoColumn>

          {/*{account && outputToken && (*/}
          {/*  <AddTokenRow justify={'center'} onClick={() => addTokenToWallet(outputToken.address)}>*/}
          {/*    <AddTokenText>Add {outputToken.symbol} to Wallet</AddTokenText>*/}
          {/*    <ArrowRight width={16} height={15} style={{ marginBottom: '3.5px' }} />*/}
          {/*  </AddTokenRow>*/}
          {/*)}*/}
        </SwapWrapper>
      </AppBody>
      {/* TODO: FIX ADVANCED SWAP */}
      {/* <AdvancedSwapDetailsDropdown trade={trade} />*/}
    </PageWrapper>
  );
}
