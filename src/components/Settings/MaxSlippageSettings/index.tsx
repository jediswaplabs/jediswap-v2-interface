import { Trans } from '@lingui/macro';
import { Percent } from '@vnaysn/jediswap-sdk-core';
import { useState } from 'react';
import { X } from 'react-feather';
import styled from 'styled-components';

import { Column } from 'components/Column';
import Row, { RowBetween } from 'components/Row';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { SlippageTolerance } from 'state/user/types';
import { CautionTriangle, ThemedText } from 'theme/components';
import { useFormatter } from 'utils/formatNumbers';
import { Input, InputContainer } from '../Input';
import TransactionDeadlineSettings from '../TransactionDeadlineSettings';

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

const SettingsRect = styled(RowBetween)`
  background-color: ${({ theme }) => theme.surface4};
  box-shadow: 0px 0.7697721123695374px 30.790884017944336px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.0790884494781494px 13.8558988571167px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43766784667969px 76.97720336914062px -36.949066162109375px rgba(202, 172, 255, 0.3) inset,
    0px -63.121315002441406px 52.34450149536133px -49.26541519165039px rgba(96, 68, 144, 0.3) inset;
  padding: 17px;
`;

const CloseButton = styled.button`
  cursor: pointer;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.neutral1};
  padding: 0;
  height: 20px;
`;

export const PercentageInput = styled(Input)`
  font-size: 20px;
`;

const InternalSettingsInputButton = styled.button`
  color: ${({ theme }) => theme.jediWhite};
  background: ${({ theme }) => theme.jediNavyBlue};
  border: 1px solid ${({ theme }) => theme.jediWhite};
  height: 38px;
  border-radius: 4px;
  width: 60px;
  font-size: 20px;
`;

const ActiveInternalSettingsInputButton = styled(InternalSettingsInputButton)`
  border: 1px solid ${({ theme }) => theme.jediBlue};
`;

const SettingsInputButton = (props: { value: string, slippageInput: string, parseSlippageInput: (value: string) => void }) => {
  const { value, slippageInput, parseSlippageInput } = props;
  if (slippageInput === value) {
    return (
      <ActiveInternalSettingsInputButton onClick={() => parseSlippageInput(value)}>
        {value}%
      </ActiveInternalSettingsInputButton>
    );
  }
  return (
    <InternalSettingsInputButton onClick={() => parseSlippageInput(value)}>
      {value}%
    </InternalSettingsInputButton>
  );
};

export const SettingsInputContainer = styled(InputContainer)`
  background: ${({ theme }) => theme.jediNavyBlue};
  border: 1px solid ${({ theme }) => theme.jediWhite};
  min-width: 83px;
  height: 38px;
  margin-right: 6px;
  flex-grow: 0;
`;

const SettingsColumn = styled(Column)`
  padding 6px;
  gap: 12px;
`;

const NUMBER_WITH_MAX_TWO_DECIMAL_PLACES = /^(?:\d*\.\d{0,2}|\d+)$/;
const MINIMUM_RECOMMENDED_SLIPPAGE = new Percent(5, 10_000);
const MAXIMUM_RECOMMENDED_SLIPPAGE = new Percent(1, 100);

function useFormatPercentInput() {
  const { formatPercent } = useFormatter();

  return (slippage: Percent) => formatPercent(slippage).slice(0, -1); // remove % sign
}

export default function MaxSlippageSettings({ autoSlippage, closeMenu }: { autoSlippage: Percent, closeMenu: () => void }) {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance();
  const { formatPercent } = useFormatter();
  const formatPercentInput = useFormatPercentInput();

  // In order to trigger `custom` mode, we need to set `userSlippageTolerance` to a value that is not `auto`.
  // To do so, we use `autoSlippage` value. However, since users are likely to change that value,
  // we render it as a placeholder instead of a value.
  const defaultSlippageInputValue = userSlippageTolerance !== SlippageTolerance.Auto && !userSlippageTolerance.equalTo(autoSlippage)
    ? formatPercentInput(userSlippageTolerance)
    : '';

  // If user has previously entered a custom slippage, we want to show that value in the input field
  // instead of a placeholder.
  const [slippageInput, setSlippageInput] = useState(defaultSlippageInputValue);
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false);

  // If user has previously entered a custom slippage, we want to show the settings expanded by default.
  const [isOpen, setIsOpen] = useState(defaultSlippageInputValue.length > 0);

  const parseSlippageInput = (value: string) => {
    // Do not allow non-numerical characters in the input field or more than two decimals
    if (value.length > 0 && !NUMBER_WITH_MAX_TWO_DECIMAL_PLACES.test(value)) {
      return;
    }

    setSlippageInput(value);
    setSlippageError(false);

    // If the input is empty, set the slippage to the default
    if (value.length === 0) {
      setUserSlippageTolerance(SlippageTolerance.Auto);
      return;
    }

    if (value === '.') {
      return;
    }

    // Parse user input and set the slippage if valid, error otherwise
    try {
      const parsed = Math.floor(Number.parseFloat(value) * 100);
      if (parsed > 5000) {
        setSlippageError(SlippageError.InvalidInput);
      } else {
        setUserSlippageTolerance(new Percent(parsed, 10_000));
      }
    } catch (e) {
      setSlippageError(SlippageError.InvalidInput);
    }
  };

  const tooLow = userSlippageTolerance !== SlippageTolerance.Auto && userSlippageTolerance.lessThan(MINIMUM_RECOMMENDED_SLIPPAGE);
  const tooHigh = userSlippageTolerance !== SlippageTolerance.Auto && userSlippageTolerance.greaterThan(MAXIMUM_RECOMMENDED_SLIPPAGE);

  return (
    <SettingsColumn>
      <Row alignItems={'center'} justify="space-between">
        <ThemedText.SubHeader fontSize={'16px'} lineHeight="20px" fontWeight={750}>
          <Trans>Settings</Trans>
        </ThemedText.SubHeader>

        <CloseButton onClick={() => closeMenu()}>
          <X size={20} />
        </CloseButton>
      </Row>
      <ThemedText.BodyPrimary marginTop="12px" fontSize="14px">
        <Trans>Slippage tolerance</Trans>
      </ThemedText.BodyPrimary>
      <SettingsRect gap="10px" padding="md" style={{ borderRadius: '12px' }}>
        <SettingsInputContainer error={!!slippageError}>
          <PercentageInput
            placeholder={formatPercentInput(autoSlippage)}
            value={slippageInput}
            onChange={(e) => parseSlippageInput(e.target.value)}
            onBlur={() => {
              // When the input field is blurred, reset the input field to the default value
              setSlippageInput(defaultSlippageInputValue);
              setSlippageError(false);
            }}
          />
          <ThemedText.BodyPrimary>%</ThemedText.BodyPrimary>
        </SettingsInputContainer>
        <SettingsInputButton slippageInput={slippageInput} parseSlippageInput={parseSlippageInput} value="0.5" />
        <SettingsInputButton slippageInput={slippageInput} parseSlippageInput={parseSlippageInput} value="1" />
        <SettingsInputButton slippageInput={slippageInput} parseSlippageInput={parseSlippageInput} value="2" />
      </SettingsRect>
      <ThemedText.BodyPrimary marginTop="12px" fontSize="14px">
        <Trans>Transaction deadline</Trans>
      </ThemedText.BodyPrimary>
      <SettingsRect gap="10px" padding="md" style={{ borderRadius: '12px' }}>
        <TransactionDeadlineSettings />
        <div style={{ flex: 1, fontSize: '14px' }}>minutes</div>
      </SettingsRect>
      {tooLow || tooHigh ? (
        <RowBetween gap="md">
          <CautionTriangle />
          <ThemedText.BodySmall color="deprecated_accentWarning">
            {tooLow ? (
              <Trans>
                Slippage below {formatPercent(MINIMUM_RECOMMENDED_SLIPPAGE)} may result in a failed transaction
              </Trans>
            ) : (
              <Trans>Your transaction may be frontrun and result in an unfavorable trade.</Trans>
            )}
          </ThemedText.BodySmall>
        </RowBetween>
      ) : null}
    </SettingsColumn>
  );
}
