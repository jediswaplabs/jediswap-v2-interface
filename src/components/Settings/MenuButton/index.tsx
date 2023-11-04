import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';

import { Settings } from 'components/Icons/Settings';
import Row from 'components/Row';
import { InterfaceTrade } from 'state/routing/types';
import { isUniswapXTrade } from 'state/routing/utils';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { SlippageTolerance } from 'state/user/types';
import { ThemedText } from 'theme/components';
import { useFormatter } from 'utils/formatNumbers';
import validateUserSlippageTolerance, { SlippageValidationResult } from 'utils/validateUserSlippageTolerance';

const Icon = styled(Settings)`
  color: ${({ theme }) => theme.neutral1};
  height: 40px;
  width: 40px;
`;

const Button = styled.button<{ isActive: boolean }>`
  display: flex;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;

  :not([disabled]):hover {
    opacity: 0.7;
  }

  ${({ isActive }) => isActive && 'opacity: 0.7'}
`;

const IconContainer = styled(Row)`
  padding: 0 6px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid transparent;
`;

const IconContainerWithSlippage = styled(IconContainer)<{ displayWarning?: boolean }>`
  div {
    color: ${({ theme, displayWarning }) => (displayWarning ? theme.deprecated_accentWarning : theme.neutral1)};
  }
  border-color: #fff;
`;

const ButtonContent = ({ trade }: { trade?: InterfaceTrade }) => {
  const [userSlippageTolerance] = useUserSlippageTolerance();
  const { formatPercent } = useFormatter();

  if (userSlippageTolerance === SlippageTolerance.Auto || isUniswapXTrade(trade)) {
    return (
      <IconContainer>
        <Icon />
      </IconContainer>
    );
  }

  const isInvalidSlippage = validateUserSlippageTolerance(userSlippageTolerance) !== SlippageValidationResult.Valid;

  return (
    <IconContainerWithSlippage data-testid="settings-icon-with-slippage" gap="sm" displayWarning={isInvalidSlippage}>
      <ThemedText.BodySmall>
        <Trans>{formatPercent(userSlippageTolerance)} slippage</Trans>
      </ThemedText.BodySmall>
      <Icon />
    </IconContainerWithSlippage>
  );
};

export default function MenuButton({ disabled,
  onClick,
  isActive,
  trade }: {
  disabled: boolean
  onClick: () => void
  isActive: boolean
  trade?: InterfaceTrade
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      isActive={isActive}
      id="open-settings-dialog-button"
      data-testid="open-settings-dialog-button"
      aria-label={t`Transaction Settings`}
    >
      <ButtonContent trade={trade} />
    </Button>
  );
}
