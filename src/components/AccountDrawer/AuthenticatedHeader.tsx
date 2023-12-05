import { Trans } from '@lingui/macro';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { ThemeButton } from 'components/Button';
import Column from 'components/Column';
import { Power } from 'components/Icons/Power';
import { Settings } from 'components/Icons/Settings';
import { AutoRow } from 'components/Row';
import { LoadingBubble } from 'components/Tokens/loading';
import { DeltaArrow } from 'components/Tokens/TokenDetails/Delta';
import { getConnection } from 'connection';
import useENSName from 'hooks/useENSName';
import { useAppDispatch } from 'state/hooks';
import { updateSelectedWallet } from 'state/user/reducer';
import { CopyHelper, ExternalLink, ThemedText } from 'theme/components';
import { shortenAddress } from 'utils';
import { NumberType, useFormatter } from 'utils/formatNumbers';
import { useCloseModal, useFiatOnrampAvailability, useOpenModal, useToggleModal } from '../../state/application/hooks';
import { ApplicationModal } from '../../state/application/reducer';
import StatusIcon from '../Identicon/StatusIcon';
import { useCachedPortfolioBalancesQuery } from '../PrefetchBalancesWrapper/PrefetchBalancesWrapper';
import { useToggleAccountDrawer } from '.';
import IconButton, { IconHoverText, IconWithConfirmTextButton } from './IconButton';
import MiniPortfolio from './MiniPortfolio';
import { portfolioFadeInAnimation } from './MiniPortfolio/PortfolioRow';
import { useDisconnect } from '@starknet-react/core';

const AuthenticatedHeaderWrapper = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`;

const StatusWrapper = styled.div`
  width: 70%;
  max-width: 70%;
  padding-right: 8px;
  display: inline-flex;
`;

const AccountNamesWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  margin-left: 8px;
`;

const HeaderWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CopyText = styled(CopyHelper).attrs({
  iconSize: 14,
  iconPosition: 'right',
})``;

const FadeInColumn = styled(Column)`
  ${portfolioFadeInAnimation}
`;

const PortfolioDrawerContainer = styled(Column)`
  flex: 1;
`;

export default function AuthenticatedHeader({ account, openSettings }: { account: string; openSettings: () => void }) {
  const { connector } = useWeb3React();
  const { ENSName } = useENSName(account);
  const dispatch = useAppDispatch();
  const { formatNumber, formatDelta } = useFormatter();
  const { disconnect } = useDisconnect();

  const connection = getConnection(connector);
  const disconnectWallet = useCallback(() => {
    if (connector) {
      disconnect();
    }
    connector.resetState();
    dispatch(updateSelectedWallet({ wallet: undefined }));
  }, [connector, dispatch]);

  const toggleWalletDrawer = useToggleAccountDrawer();

  const openFiatOnrampModal = useOpenModal(ApplicationModal.FIAT_ONRAMP);
  const openFoRModalWithAnalytics = useCallback(() => {
    toggleWalletDrawer();
    openFiatOnrampModal();
  }, [openFiatOnrampModal, toggleWalletDrawer]);

  const [shouldCheck, setShouldCheck] = useState(false);
  const { available: fiatOnrampAvailable,
    availabilityChecked: fiatOnrampAvailabilityChecked,
    error,
    loading: fiatOnrampAvailabilityLoading } = useFiatOnrampAvailability(shouldCheck, openFoRModalWithAnalytics);

  const handleBuyCryptoClick = useCallback(() => {
    if (!fiatOnrampAvailabilityChecked) {
      setShouldCheck(true);
    } else if (fiatOnrampAvailable) {
      openFoRModalWithAnalytics();
    }
  }, [fiatOnrampAvailabilityChecked, fiatOnrampAvailable, openFoRModalWithAnalytics]);
  const disableBuyCryptoButton = Boolean(
    error || (!fiatOnrampAvailable && fiatOnrampAvailabilityChecked) || fiatOnrampAvailabilityLoading,
  );

  const { data: portfolioBalances } = useCachedPortfolioBalancesQuery({ account });
  const portfolio = portfolioBalances?.portfolios?.[0];
  const totalBalance = portfolio?.tokensTotalDenominatedValue?.value;
  const absoluteChange = portfolio?.tokensTotalDenominatedValueChange?.absolute?.value;
  const percentChange = portfolio?.tokensTotalDenominatedValueChange?.percentage?.value;
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const addressShort = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <StatusIcon account={account} connection={connection} size={40} />
          {account && (
            <AccountNamesWrapper>
              <ThemedText.SubHeader>
                <CopyText toCopy={ENSName ?? account}>{ENSName ?? addressShort}</CopyText>
              </ThemedText.SubHeader>
              {/* Displays smaller view of account if ENS name was rendered above */}
              {ENSName && (
                <ThemedText.BodySmall color="neutral2">
                  <CopyText toCopy={account}>{shortenAddress(account)}</CopyText>
                </ThemedText.BodySmall>
              )}
            </AccountNamesWrapper>
          )}
        </StatusWrapper>
        <IconContainer>
          <IconButton
            hideHorizontal={showDisconnectConfirm}
            data-testid="wallet-settings"
            onClick={openSettings}
            Icon={Settings}
          />
          <IconWithConfirmTextButton
            data-testid="wallet-disconnect"
            onConfirm={disconnectWallet}
            onShowConfirm={setShowDisconnectConfirm}
            Icon={Power}
            text="Disconnect"
            dismissOnHoverOut
          />
        </IconContainer>
      </HeaderWrapper>
      {/*  <PortfolioDrawerContainer>
        {totalBalance !== undefined ? (
          <FadeInColumn gap="xs">
            <ThemedText.HeadlineLarge fontWeight={535} data-testid="portfolio-total-balance">
              {formatNumber({
                input: totalBalance,
                type: NumberType.PortfolioBalance,
              })}
            </ThemedText.HeadlineLarge>
            <AutoRow>
              {absoluteChange !== 0 && percentChange && (
                <>
                  <DeltaArrow delta={absoluteChange} />
                  <ThemedText.BodySecondary>
                    {`${formatNumber({
                      input: Math.abs(absoluteChange as number),
                      type: NumberType.PortfolioBalance,
                    })} (${formatDelta(percentChange)})`}
                  </ThemedText.BodySecondary>
                </>
              )}
            </AutoRow>
          </FadeInColumn>
        ) : (
          <Column gap="xs">
            <LoadingBubble height="44px" width="170px" />
            <LoadingBubble height="16px" width="100px" margin="4px 0 20px 0" />
          </Column>
        )}
        <MiniPortfolio account={account} />
        {isUnclaimed && (
          <UNIButton onClick={openClaimModal} size={ButtonSize.medium} emphasis={ButtonEmphasis.medium}>
            <Trans>Claim</Trans> {unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} <Trans>reward</Trans>
          </UNIButton>
        )}
        {isClaimAvailable && (
          <UNIButton size={ButtonSize.medium} emphasis={ButtonEmphasis.medium} onClick={openNftModal}>
            <Trans>Claim Uniswap NFT Airdrop</Trans>
          </UNIButton>
        )}
      </PortfolioDrawerContainer> */}
    </AuthenticatedHeaderWrapper>
  );
}
