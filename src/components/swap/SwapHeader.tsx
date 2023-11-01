import { Trans } from '@lingui/macro';
import { Percent } from '@uniswap/sdk-core';
import styled from 'styled-components';

import { InterfaceTrade } from 'state/routing/types';
import { ThemedText } from 'theme/components';
import { RowBetween, RowFixed } from '../Row';
import SettingsTab from '../Settings';
import SwapBuyFiatButton from './SwapBuyFiatButton';

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 24px;
  color: ${({ theme }) => theme.neutral2};
`;

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0;
  gap: 16px;
`;

export default function SwapHeader({ autoSlippage,
  chainId,
  trade }: {
  autoSlippage: Percent
  chainId?: number
  trade?: InterfaceTrade
}) {
  return (
    <StyledSwapHeader>
      <HeaderButtonContainer>
        <ThemedText.SubHeader>
          <Trans>SWAP</Trans>
        </ThemedText.SubHeader>
        <SwapBuyFiatButton />
      </HeaderButtonContainer>
      <RowFixed>
        <SettingsTab autoSlippage={autoSlippage} chainId={chainId} trade={trade} />
      </RowFixed>
    </StyledSwapHeader>
  );
}
