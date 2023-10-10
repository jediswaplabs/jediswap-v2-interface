import React from "react";
import styled, { useTheme } from "styled-components";
import { darken, lighten } from "polished";
import { Check, ChevronDown } from "react-feather";
import { RowBetween } from "../Row";
import {
  Button as RebassButton,
  ButtonProps as ButtonPropsOriginal
} from "rebass/styled-components";

type ButtonProps = Omit<ButtonPropsOriginal, "css">;

type BaseButtonProps = {
  padding?: string;
  width?: string;
  borderRadius?: string;
  altDisabledStyle?: boolean;
} & ButtonProps;

const Base = styled(RebassButton)<BaseButtonProps>`
  padding: ${({ padding }) => padding ?? "10px"};
  width: ${({ width }) => (width ? width : "100%")};
  font-size: ${({ fontSize }) => (fontSize ? `${String(fontSize)}px` : "24px")};
  line-height: 20px;
  font-weight: 800;
  text-align: center;
  border-radius: 8px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  /* border: 1px solid transparent; */
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`;

export const ButtonText = styled(Base)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    text-decoration: underline;
  }
  &:hover {
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonOutlined = styled(Base)`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: transparent;
  color: ${({ theme }) => theme.text1};

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const CheckboxWrapper = styled.div`
  width: 20px;
  padding: 0 10px;
  position: absolute;
  top: 11px;
  right: 15px;
`;

const ResponsiveCheck = styled(Check)`
  size: 13px;
`;

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.accent1};
`;

const Circle = styled.div`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent1};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export function ButtonRadioChecked({
  active = false,
  children,
  ...rest
}: { active?: boolean } & ButtonProps) {
  const theme = useTheme();

  if (!active) {
    return (
      <ButtonOutlined $borderRadius="12px" padding="12px 8px" {...rest}>
        <RowBetween>{children}</RowBetween>
      </ButtonOutlined>
    );
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" $borderRadius="12px">
        <RowBetween>
          {children}
          <CheckboxWrapper>
            <Circle>
              <ResponsiveCheck size={13} stroke={theme.white} />
            </Circle>
          </CheckboxWrapper>
        </RowBetween>
      </ActiveOutlined>
    );
  }
}

export const ButtonPrimary = styled(Base)`
  background-color: ${({ theme }) => theme.jediBlue};
  background: linear-gradient(95.64deg, #29aafd 8.08%, #ff00e9 105.91%);
  color: ${({ theme }) => theme.jediWhite};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  :hover,
  :focus,
  :active {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
  }
  /* &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  } */
  &:disabled {
    background: ${({ theme }) => theme.jediNavyBlue};
    mix-blend-mode: normal;
    box-shadow: inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
      inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3),
      inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
    border-radius: 8px;
  }
`;

export const ButtonGradient = styled(ButtonPrimary)``;

export const ButtonLight = styled(Base)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primaryText1};
  font-size: 16px;
  font-weight: 500;
  &:focus {
    box-shadow: 0 0 0 1pt
      ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.03, theme.primary5)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.03, theme.primary5)};
  }
  &:active {
    box-shadow: 0 0 0 1pt
      ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.05, theme.primary5)};
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`;

export const ButtonGray = styled(Base)`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  /* font-size: 16px;
  font-weight: 500; */
  &:focus {
    box-shadow: 0 0 0 1pt
      ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.05, theme.bg2)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.05, theme.bg2)};
  }
  &:active {
    box-shadow: 0 0 0 1pt
      ${({ theme, disabled }) => !disabled && darken(0.1, theme.bg2)};
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.1, theme.bg2)};
  }
`;

export const ButtonSecondary = styled(Base)`
  border: 1px solid ${({ theme }) => theme.primary4};
  color: ${({ theme }) => theme.primary1};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${(padding) => (String(padding) ? String(padding) : "10px")};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary4};
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary4};
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`;

export const ButtonPink = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  color: white;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.primary1};
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.jediBlue};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    /* text-decoration: underline; */
  }
  &:hover {
    /* text-decoration: underline; */
  }
  &:active {
    /* text-decoration: underline; */
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonWhite = styled(Base)`
  border: 1px solid #edeef2;
  background-color: ${({ theme }) => theme.bg1};
  color: black;

  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    box-shadow: 0 0 0 1pt ${darken(0.05, "#edeef2")};
  }
  &:hover {
    box-shadow: 0 0 0 1pt ${darken(0.1, "#edeef2")};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, "#edeef2")};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonConfirmedStyle = styled(Base)`
  /* background-color: ${({ theme }) => lighten(0.5, theme.jediBlue)}; */
  background-color: transparent;
  color: ${({ theme }) => theme.jediBlue};
  border: 1px solid ${({ theme }) => theme.jediBlue};
  /* padding: 21px 10px; */

  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonErrorStyle = styled(Base)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  box-shadow: inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3),
    inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.red1)};
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.red1)};
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.red1};
    border: 1px solid ${({ theme }) => theme.red1};
  }
`;

export const RedGradientButton = styled(Base)`
  background-color: ${({ theme }) => theme.signalRed};
  mix-blend-mode: normal;
  border-radius: 8px;
  padding: 22px 17px;
  border: none;
  color: ${({ theme }) => theme.jediWhite};
  text-align: center;

  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.jediNavyBlue};
    color: ${({ theme }) => theme.red1};
    box-shadow: inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
      inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3),
      inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  }
`;

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />;
  }
}

export function ButtonError({
  error,
  ...rest
}: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}

export function ButtonDropdown({
  disabled = false,
  children,
  ...rest
}: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  );
}

export function ButtonDropdownLight({
  disabled = false,
  children,
  ...rest
}: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  );
}

export function ButtonRadio({
  active,
  ...rest
}: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}
