// import { BigNumber } from '@ethersproject/bignumber'
// import type { TransactionResponse } from '@ethersproject/providers'
// import { Trans } from '@lingui/macro'
// import { BrowserEvent, InterfaceElementName, InterfaceEventName, LiquidityEventName } from '@uniswap/analytics-events'
// import { Currency, CurrencyAmount, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, Percent } from '@uniswap/sdk-core'
// import { FeeAmount, NonfungiblePositionManager } from '@uniswap/v3-sdk'
// import { useWeb3React } from '@web3-react/core'
// import { sendAnalyticsEvent, TraceEvent, useTrace } from 'analytics'
// import { useToggleAccountDrawer } from 'components/AccountDrawer'
// import OwnershipWarning from 'components/addLiquidity/OwnershipWarning'
// import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import { isSupportedChain } from 'constants/chains'
// import usePrevious from 'hooks/usePrevious'
// import { useSingleCallResult } from 'lib/hooks/multicall'
// import { PositionPageUnsupportedContent } from 'pages/Pool/PositionPage'
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "react-feather";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Text } from "rebass";
// import {
//   useRangeHopCallbacks,
//   useV3DerivedMintInfo,
//   useV3MintActionHandlers,
//   useV3MintState,
// } from 'state/mint/v3/hooks'
import styled, { useTheme } from "styled-components";
import { ThemedText } from "theme/components";
// import { addressesAreEquivalent } from 'utils/addressesAreEquivalent'
// import { WrongChainError } from 'utils/errors'

import {
  ButtonError,
  ButtonLight,
  ButtonPrimary,
  ButtonText
} from "../../components/Button";
import { BlueCard, OutlineCard, YellowCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import FeeSelector from "../../components/FeeSelector";
import HoverInlineText from "../../components/HoverInlineText";
// import LiquidityChartRangeInput from "../../components/LiquidityChartRangeInput";
import { AddRemoveTabs } from "../../components/NavigationTabs";
// import { PositionPreview } from "../../components/PositionPreview";
import RangeSelector from "../../components/RangeSelector";
import PresetsButtons from "../../components/RangeSelector/PresetsButtons";
import RateToggle from "../../components/RateToggle";
import Row, { RowBetween, RowFixed } from "../../components/Row";
// import { SwitchLocaleLink } from "../../components/SwitchLocaleLink";
import TransactionConfirmationModal, {
  ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
// import { ZERO_PERCENT } from '../../constants/misc'
// // import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
// // import { useCurrency } from '../../hooks/Tokens'
// // // import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
// // // import { useArgentWalletContract } from '../../hooks/useArgentWalletContract'
// // // import { useV3NFTPositionManagerContract } from '../../hooks/useContract'
// // // import { useDerivedPositionInfo } from '../../hooks/useDerivedPositionInfo'
// // // import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
// // // import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
// // // import useTransactionDeadline from '../../hooks/useTransactionDeadline'
// // // import { useV3PositionFromTokenId } from '../../hooks/useV3Positions'
// // // import { Bound, Field } from '../../state/mint/v3/actions'
// // // import { useTransactionAdder } from '../../state/transactions/hooks'
// // // import { TransactionInfo, TransactionType } from '../../state/transactions/types'
// // // import { useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
// import approveAmountCalldata from '../../utils/approveAmountCalldata'
// import { calculateGasMargin } from '../../utils/calculateGasMargin'
// import { currencyId } from '../../utils/currencyId'
// import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { Dots } from "../Pool/styled";
// import { Review } from "./Review";
import {
  DynamicSection,
  MediumOnly,
  ResponsiveTwoColumns,
  ScrollablePage,
  StyledInput,
  Wrapper
} from "./styled";
import { BodyWrapper } from "pages/AppBody";
import { useTokenList } from "state/lists/hooks";
import { Currency } from "@jediswap/sdk";
import { Review } from "./Review";

// const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const StyledBodyWrapper = styled(BodyWrapper)<{
  $hasExistingPosition: boolean;
}>`
  padding: ${({ $hasExistingPosition }) => ($hasExistingPosition ? "10px" : 0)};
  max-width: 600px;
`;

export default function AddLiquidityWrapper() {
  // const { chainId } = useWeb3React()
  // if (isSupportedChain(chainId)) {
  //   return <AddLiquidity />
  // } else {
  //   return <PositionPageUnsupportedContent />
  // }
  return <AddLiquidity />;
}

function AddLiquidity() {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const Buttons = () => (
    <AutoColumn gap="md">
      <ButtonError onClick={() => setShowConfirm(true)}>
        <Text fontWeight={535}>Preview</Text>
      </ButtonError>
    </AutoColumn>
  );

  const handleCurrencyASelect = useCallback((currencyANew: Currency) => {}, []);
  const handleCurrencyBSelect = useCallback((currencyANew: Currency) => {}, []);
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const { defaultList: currencies } = useTokenList();

  return (
    <>
      <ScrollablePage>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          // attemptingTxn={attemptingTxn}
          // hash={txHash}
          reviewContent={() => (
            <ConfirmationModalContent
              title={<>Add Liquidity</>}
              onDismiss={handleDismissConfirmation}
              topContent={() => (
                <Review
                // parsedAmounts={parsedAmounts}
                // position={position}
                // existingPosition={existingPosition}
                // priceLower={priceLower}
                // priceUpper={priceUpper}
                // outOfRange={outOfRange}
                // ticksAtLimit={ticksAtLimit}
                />
              )}
              bottomContent={() => (
                <ButtonPrimary
                  style={{ marginTop: "1rem" }}
                  // onClick={onAdd}
                >
                  <Text fontWeight={535} fontSize={20}>
                    <>Add</>
                  </Text>
                </ButtonPrimary>
              )}
            />
          )}
          // pendingText={pendingText}
        />
        <StyledBodyWrapper>
          <AddRemoveTabs
            creating={false}
            adding={true}
            // positionID={tokenId}
            // autoSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
            // showBackLink={!hasExistingPosition}
          >
            <Row
              justifyContent="flex-end"
              style={{ width: "fit-content", minWidth: "fit-content" }}
            >
              <MediumOnly>
                <ButtonText>
                  <ThemedText.DeprecatedBlue fontSize="12px">
                    <>Clear all</>
                  </ThemedText.DeprecatedBlue>
                </ButtonText>
              </MediumOnly>
            </Row>
          </AddRemoveTabs>
          <Wrapper>
            <ResponsiveTwoColumns wide={false}>
              <AutoColumn gap="lg">
                <>
                  <AutoColumn gap="md">
                    <RowBetween paddingBottom="20px">
                      <ThemedText.DeprecatedLabel>
                        <>Select pair</>
                      </ThemedText.DeprecatedLabel>
                    </RowBetween>
                    <RowBetween gap="md">
                      <CurrencyInputPanel
                        // value={formattedAmounts[Field.CURRENCY_A]}
                        // onUserInput={}
                        hideInput
                        // onMax={() => {
                        //   onFieldAInput(
                        //     maxAmounts[Field.CURRENCY_A]?.toExact() ?? ""
                        //   );
                        // }}
                        onCurrencySelect={handleCurrencyASelect}
                        // showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                        currency={currencies?.list?.tokens[1] ?? null}
                        id="add-liquidity-input-tokena"
                        showCommonBases
                      />

                      <CurrencyInputPanel
                        // value={formattedAmounts[Field.CURRENCY_B]}
                        hideInput
                        // onUserInput={onFieldBInput}
                        onCurrencySelect={handleCurrencyBSelect}
                        // onMax={() => {
                        //   onFieldBInput(
                        //     maxAmounts[Field.CURRENCY_B]?.toExact() ?? ""
                        //   );
                        // }}
                        // showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                        currency={currencies?.list?.tokens[0] ?? null}
                        id="add-liquidity-input-tokenb"
                        showCommonBases
                      />
                    </RowBetween>

                    <FeeSelector
                    // disabled={!quoteCurrency || !baseCurrency}
                    // feeAmount={feeAmount}
                    // handleFeePoolSelect={handleFeePoolSelect}
                    // currencyA={baseCurrency ?? undefined}
                    // currencyB={quoteCurrency ?? undefined}
                    />
                  </AutoColumn>{" "}
                </>
                {/* {hasExistingPosition && existingPosition && (
                  <PositionPreview
                    position={existingPosition}
                    title={<Trans>Selected range</Trans>}
                    inRange={!outOfRange}
                    ticksAtLimit={ticksAtLimit}
                  />
                )} */}
              </AutoColumn>

              <>
                <DynamicSection gap="md" disabled={false}>
                  <RowBetween>
                    <ThemedText.DeprecatedLabel>
                      <>Set price range</>
                    </ThemedText.DeprecatedLabel>

                    {/* {Boolean(baseCurrency && quoteCurrency) && ( */}
                    <RowFixed gap="8px">
                      <PresetsButtons />
                    </RowFixed>
                    {/* )} */}
                  </RowBetween>

                  <RangeSelector
                  // priceLower={priceLower}
                  // priceUpper={priceUpper}
                  // getDecrementLower={getDecrementLower}
                  // getIncrementLower={getIncrementLower}
                  // getDecrementUpper={getDecrementUpper}
                  // getIncrementUpper={getIncrementUpper}
                  // onLeftRangeInput={onLeftRangeInput}
                  // onRightRangeInput={onRightRangeInput}
                  // currencyA={baseCurrency}
                  // currencyB={quoteCurrency}
                  // feeAmount={feeAmount}
                  // ticksAtLimit={ticksAtLimit}
                  />

                  {/*  {outOfRange && (
                    <YellowCard padding="8px 12px" $borderRadius="12px">
                      <RowBetween>
                        <AlertTriangle
                          stroke={theme.deprecated_yellow3}
                          size="16px"
                        />
                        <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                          <Trans>
                            Your position will not earn fees or be used in
                            trades until the market price moves into your range.
                          </Trans>
                        </ThemedText.DeprecatedYellow>
                      </RowBetween>
                    </YellowCard>
                  )} */}

                  {/* {invalidRange && (
                    <YellowCard padding="8px 12px" $borderRadius="12px">
                      <RowBetween>
                        <AlertTriangle
                          stroke={theme.deprecated_yellow3}
                          size="16px"
                        />
                        <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                          <Trans>
                            Invalid range selected. The min price must be lower
                            than the max price.
                          </Trans>
                        </ThemedText.DeprecatedYellow>
                      </RowBetween>
                    </YellowCard>
                  )} */}
                </DynamicSection>
              </>

              <div>
                <DynamicSection disabled={false}>
                  <AutoColumn gap="md">
                    <CurrencyInputPanel
                      // value={formattedAmounts[Field.CURRENCY_A]}
                      // onUserInput={onFieldAInput}
                      // onMax={() => {
                      //   onFieldAInput(
                      //     maxAmounts[Field.CURRENCY_A]?.toExact() ?? ""
                      //   );
                      // }}
                      // showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                      // currency={currencies[Field.CURRENCY_A] ?? null}
                      id="add-liquidity-input-tokena"
                      // fiatValue={currencyAFiat}
                      showCommonBases
                      // locked={depositADisabled}
                    />

                    <CurrencyInputPanel
                      // value={formattedAmounts[Field.CURRENCY_B]}
                      // onUserInput={onFieldBInput}
                      // onMax={() => {
                      //   onFieldBInput(
                      //     maxAmounts[Field.CURRENCY_B]?.toExact() ?? ""
                      //   );
                      // }}
                      // showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                      // fiatValue={currencyBFiat}
                      // currency={currencies[Field.CURRENCY_B] ?? null}
                      id="add-liquidity-input-tokenb"
                      showCommonBases
                      // locked={depositBDisabled}
                    />
                  </AutoColumn>
                </DynamicSection>
              </div>
              <Buttons />
            </ResponsiveTwoColumns>
          </Wrapper>
        </StyledBodyWrapper>
        {/* {showOwnershipWarning && <OwnershipWarning ownerAddress={owner} />}
        {addIsUnsupported && (
          <UnsupportedCurrencyFooter
            show={addIsUnsupported}
            currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          />
        )} */}
      </ScrollablePage>
    </>
  );
}
