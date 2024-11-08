import { Trans } from '@lingui/macro';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { headlineMedium } from 'nft/css/common.css';
import { ThemedText } from 'theme/components';
import { EmptyActivityIcon, EmptyNftsIcon, EmptyPoolsIcon, EmptyTokensIcon } from './icons';
import { ButtonPrimary } from '../../../../components/Button';

const EmptyWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
`;

const EmptyWalletText = styled(ThemedText.SubHeader)`
  white-space: normal;
  margin-top: 12px;
  text-align: center;
`;

const EmptyWalletSubtitle = styled(ThemedText.BodySmall)`
  white-space: normal;
  text-align: center;
  margin-top: 8px;
`;

const ActionButton = styled(ButtonPrimary)`
  color: ${({ theme }) => theme.white};
  width: min-content;
  border: none;
  outline: none;
  border-radius: 12px;
  white-space: nowrap;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 535;
  font-size: 16px;
  line-height: 24px;
`;

type EmptyWalletContent = {
  title: React.ReactNode
  subtitle: React.ReactNode
  actionText?: React.ReactNode
  urlPath?: string
  icon: React.ReactNode
}
type EmptyWalletContentType = 'token' | 'activity' | 'pool'
const EMPTY_WALLET_CONTENT: { [key in EmptyWalletContentType]: EmptyWalletContent } = {
  token: {
    title: <Trans>No tokens yet</Trans>,
    subtitle: <Trans>Buy or transfer tokens to this wallet to get started.</Trans>,
    icon: <EmptyTokensIcon />,
  },
  activity: {
    title: <Trans>No activity yet</Trans>,
    subtitle: <Trans>Your onchain transactions and crypto purchases will appear here.</Trans>,
    icon: <EmptyActivityIcon />,
  },
  pool: {
    title: <Trans>No pools yet</Trans>,
    subtitle: <Trans>Open a new position or create a pool to get started.</Trans>,
    actionText: <Trans>Create Auto-Pool</Trans>,
    urlPath: '/pool',
    icon: <EmptyPoolsIcon />,
  },
};

interface EmptyWalletContentProps {
  type?: EmptyWalletContentType
  onNavigateClick?: () => void
}

const EmptyWalletContent = ({ type = 'token', onNavigateClick }: EmptyWalletContentProps) => {
  const navigate = useNavigate();

  const content = EMPTY_WALLET_CONTENT[type];

  const actionButtonClick = useCallback(() => {
    if (content.urlPath) {
      onNavigateClick?.();
      navigate(content.urlPath);
    }
  }, [content.urlPath, navigate, onNavigateClick]);

  return (
    <>
      {content.icon}
      <EmptyWalletText className={headlineMedium}>{content.title}</EmptyWalletText>
      <EmptyWalletSubtitle color="neutral2">{content.subtitle}</EmptyWalletSubtitle>
      {content.actionText && (
        <ActionButton data-testid="nft-explore-nfts-button" onClick={actionButtonClick}>
          {content.actionText}
        </ActionButton>
      )}
    </>
  );
};

export const EmptyWalletModule = (props?: EmptyWalletContentProps) => (
  <EmptyWalletContainer>
    <EmptyWalletContent {...props} />
  </EmptyWalletContainer>
);
