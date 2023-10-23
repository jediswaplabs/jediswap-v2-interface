// import { t, Trans } from "@lingui/macro";
import { ChainId, Currency } from "@uniswap/sdk-core";
// import { useWeb3React } from "@web3-react/core";
import Badge from "components/Badge";
// import { getChainInfo } from "constants/chainInfo";
// import { SupportedL2ChainId } from "constants/chains";
// import useCurrencyLogoURIs from "lib/hooks/useCurrencyLogoURIs";
import { ReactNode, useCallback, useState } from "react";
import { AlertCircle, ArrowUpCircle, CheckCircle } from "react-feather";
// import {
//   useIsTransactionConfirmed,
//   useTransaction
// } from "state/transactions/hooks";
import styled, { useTheme } from "styled-components";
import { ExternalLink, ThemedText } from "theme/components";
import { CloseIcon, CustomLightSpinner } from "theme/components";
// import { isL2ChainId } from "utils/chains";
// import { ExplorerDataType, getExplorerLink } from "utils/getExplorerLink";

import Circle from "../../assets/images/blue-loader.svg";
// import { TransactionSummary } from "../AccountDetails/TransactionSummary";
import { ButtonLight, ButtonPrimary } from "../Button";
import { AutoColumn, ColumnCenter } from "../Column";
import Modal from "../Modal";
import Row, { RowBetween, RowFixed } from "../Row";
import AnimatedConfirmation from "./AnimatedConfirmation";

const Wrapper = styled.div`
  border-radius: 20px;
  outline: 1px solid ${({ theme }) => theme.surface3};
  //   width: 100%;
  padding: 16px;
`;

const BottomSection = styled(AutoColumn)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? "20px 0" : "32px 0;")};
`;

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`;

const ConfirmationModalContentWrapper = styled(AutoColumn)`
  padding-bottom: 12px;
`;

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash?: string;
  reviewContent: () => ReactNode;
  attemptingTxn?: boolean;
  pendingText?: ReactNode;
  currencyToAdd?: Currency;
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
  headerContent
}: {
  title: ReactNode;
  onDismiss: () => void;
  topContent: () => ReactNode;
  bottomContent?: () => ReactNode;
  headerContent?: () => ReactNode;
}) {
  return (
    <Wrapper>
      <AutoColumn gap="sm">
        <Row>
          {headerContent?.()}
          <Row justify="center" marginLeft="24px">
            <ThemedText.SubHeader>{title}</ThemedText.SubHeader>
          </Row>
          <CloseIcon
            onClick={onDismiss}
            data-testid="confirmation-close-icon"
          />
        </Row>
        {topContent()}
      </AutoColumn>
      {bottomContent && (
        <BottomSection gap="12px">{bottomContent()}</BottomSection>
      )}
    </Wrapper>
  );
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  reviewContent,
  currencyToAdd
}: ConfirmationModalProps) {
  //   const { chainId } = useWeb3React();

  // confirmation screen
  return (
    <Modal
      isOpen={isOpen}
      $scrollOverlay={true}
      onDismiss={onDismiss}
      maxHeight={90}
    >
      {/* {isL2ChainId(chainId) && (hash || attemptingTxn) ? (
        <L2Content
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : attemptingTxn ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : ( */}
      {reviewContent()}
      {/* )} */}
    </Modal>
  );
}
