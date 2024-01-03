// @ts-nocheck
import { darken } from 'polished'
import { forwardRef } from 'react'
import { Check, ChevronDown } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled, { DefaultTheme, useTheme } from 'styled-components'

import { RowBetween } from '../Row'

export { default as LoadingButtonSpinner } from './LoadingButtonSpinner'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

const ButtonOverlay = styled.div`
  background-color: transparent;
  bottom: 0;
  border-radius: inherit;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: 150ms ease background-color;
  width: 100%;
`

type BaseButtonProps = {
  padding?: string
  width?: string
  $borderRadius?: string
  altDisabledStyle?: boolean
} & ButtonProps

export const BaseButton = styled(RebassButton)<BaseButtonProps>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  line-height: 24px;
  font-weight: 535;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '8px'};
  outline: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.neutral1};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

export const ButtonPrimary = styled(BaseButton<BaseThemeButtonProps>)`
  font-family: 'Avenir LT Std';
  width: ${({ width }) => width ?? '100%'};
  background: ${({ theme }) => theme.brandedGradient};
  border: none;
  height: auto;
  font-size: ${pickThemeButtonFontSize};
  line-height: ${pickThemeButtonLineHeight};
  padding: ${pickThemeButtonPadding};
  font-weight: 700;
  color: ${({ theme }) => theme.white};

  &:focus {
    background: ${({ theme }) => theme.brandedGradientReversed};
  }
  &:hover {
    background: ${({ theme }) => theme.brandedGradientReversed};
  }
  &:active {
    background: ${({ theme }) => theme.brandedGradientReversed};
  }
  &:disabled {
    cursor: default;
    opacity: 100%;
    background: ${({ theme }) => theme.jediNavyBlue};
    color: #9b9b9b;
    box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
      0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
      0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset;
  }
`

export const SmallButtonPrimary = styled(ButtonPrimary)`
  width: auto;
  font-size: 16px;
  padding: ${({ padding }) => padding ?? '8px 12px'};

  border-radius: 12px;
`

const BaseButtonLight = styled(BaseButton)`
  font-family: 'Avenir LT Std';
  background-color: ${({ theme }) => theme.accent2};
  color: ${({ theme }) => theme.accent1};
  font-size: 20px;
  font-weight: 535;

  &:focus {
    //box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && theme.accent2};
    background-color: ${({ theme, disabled }) => !disabled && theme.accent2};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.accent2};
  }
  &:active {
    //box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && theme.accent2};
    background-color: ${({ theme, disabled }) => !disabled && theme.accent2};
  }

  :hover {
    ${ButtonOverlay} {
      background-color: ${({ theme }) => theme.deprecated_stateOverlayHover};
    }
  }

  :active {
    ${ButtonOverlay} {
      background-color: ${({ theme }) => theme.deprecated_stateOverlayPressed};
    }
  }

  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: transparent;
      //box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`

export const ButtonGray = styled(BaseButton)`
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.neutral2};
  border: 1px solid ${({ theme }) => theme.surface3};
  font-size: 16px;
  font-weight: 535;

  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.surface2)};
  }
  &:active {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.1, theme.surface2)};
  }
`

export const ButtonSecondary = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.accent2};
  color: ${({ theme }) => theme.accent1};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => padding || '10px'};

  &:focus {
    //box-shadow: 0 0 0 1pt ${({ theme }) => theme.accent2};
    border: 1px solid ${({ theme }) => theme.accent1};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.accent1};
  }
  &:active {
    //box-shadow: 0 0 0 1pt ${({ theme }) => theme.accent2};
    border: 1px solid ${({ theme }) => theme.accent1};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`

export const ButtonOutlined = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.surface3};
  background-color: transparent;
  color: ${({ theme }) => theme.neutral1};
  &:focus {
    //box-shadow: 0 0 0 1px ${({ theme }) => theme.surface3};
  }
  &:hover {
    //box-shadow: 0 0 0 1px ${({ theme }) => theme.neutral3};
  }
  &:active {
    //box-shadow: 0 0 0 1px ${({ theme }) => theme.surface3};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.accent1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonText = styled(BaseButton)`
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
`

const ButtonConfirmedStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.surface2};
  color: ${({ theme }) => theme.neutral1};
  /* border: 1px solid ${({ theme }) => theme.success}; */

  &:disabled {
    opacity: 50%;
    background-color: ${({ theme }) => theme.surface3};
    color: ${({ theme }) => theme.neutral2};
    cursor: auto;
  }
`

const ButtonErrorStyle = styled(ButtonPrimary)`
  font-family: 'Avenir LT Std';
  color: ${({ theme }) => theme.critical};

  &:disabled {
    color: ${({ theme }) => theme.critical};
    cursor: auto;
  }
`

export function ButtonConfirmed({ confirmed,
  altDisabledStyle,
  ...rest }: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  }
  return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
}

export function ButtonError({ error, ...rest }: { error?: boolean } & BaseButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} disabled />
  }
  return <ButtonPrimary {...rest} />
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

const ActiveOutlined = styled(ButtonOutlined)`
  border: ${({ theme }) => `1px solid ${theme.jediBlue}`} !important ;
`

const Circle = styled.div`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent1};
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  width: 20px;
  padding: 0 10px;
  position: absolute;
  top: 11px;
  right: 15px;
`

const ResponsiveCheck = styled(Check)`
  size: 13px;
`

export function ButtonRadioChecked({ active = false, children, ...rest }: { active?: boolean } & ButtonProps) {
  const theme = useTheme()

  if (!active) {
    return (
      <ButtonOutlined $borderRadius="12px" padding="12px 8px" {...rest}>
        <RowBetween>{children}</RowBetween>
      </ButtonOutlined>
    )
  }
  return (
    <ActiveOutlined {...rest} padding="12px 8px" $borderRadius="12px">
      <RowBetween>
        {children}
        <CheckboxWrapper>
          {/* <Circle>
            <ResponsiveCheck size={13} stroke={theme.white} />
          </Circle> */}
        </CheckboxWrapper>
      </RowBetween>
    </ActiveOutlined>
  )
}

export enum ButtonSize {
  small,
  medium,
  large,
}
export enum ButtonEmphasis {
  high,
  promotional,
  highSoft,
  medium,
  low,
  warning,
  destructive,
  failure,
}
interface BaseThemeButtonProps {
  size: ButtonSize
  emphasis?: ButtonEmphasis
}

function pickThemeButtonBackgroundColor({ theme, emphasis }: { theme: DefaultTheme; emphasis: ButtonEmphasis }) {
  switch (emphasis) {
    case ButtonEmphasis.high:
    case ButtonEmphasis.promotional:
    case ButtonEmphasis.highSoft:
      return theme.brandedGradient
    case ButtonEmphasis.low:
      return 'transparent'
    case ButtonEmphasis.warning:
      return theme.deprecated_accentWarningSoft
    case ButtonEmphasis.destructive:
      return theme.critical
    case ButtonEmphasis.failure:
      return theme.deprecated_accentFailureSoft
    case ButtonEmphasis.medium:
    default:
      return theme.brandedGradient
  }
}

function pickThemeButtonBackgroundColorHoverAndActive({ theme, emphasis }: { theme: DefaultTheme; emphasis: ButtonEmphasis }) {
  switch (emphasis) {
    case ButtonEmphasis.high:
    case ButtonEmphasis.promotional:
    case ButtonEmphasis.highSoft:
      return theme.brandedGradientReversed
    case ButtonEmphasis.low:
      return 'transparent'
    case ButtonEmphasis.warning:
      return darken(0.1, theme.deprecated_accentWarningSoft)
    case ButtonEmphasis.destructive:
      return darken(0.1, theme.critical)
    case ButtonEmphasis.failure:
      return darken(0.1, theme.deprecated_accentFailureSoft)
    case ButtonEmphasis.medium:
    default:
      return theme.brandedGradientReversed
  }
}

function pickThemeButtonTextColor({ theme, emphasis }: { theme: DefaultTheme; emphasis: ButtonEmphasis }) {
  switch (emphasis) {
    case ButtonEmphasis.high:
    case ButtonEmphasis.promotional:
      return theme.white
    case ButtonEmphasis.highSoft:
      return theme.white
    case ButtonEmphasis.low:
      return theme.neutral2
    case ButtonEmphasis.warning:
      return theme.deprecated_accentWarning
    case ButtonEmphasis.destructive:
      return theme.neutral1
    case ButtonEmphasis.failure:
      return theme.critical
    case ButtonEmphasis.medium:
    default:
      return theme.white
  }
}

function pickThemeButtonFontSize({ size }) {
  switch (size) {
    case ButtonSize.large:
      return '24px'
    case ButtonSize.medium:
      return '20px'
    case ButtonSize.small:
      return '16px'
    default:
      return '16px'
  }
}
function pickThemeButtonLineHeight({ size }) {
  switch (size) {
    case ButtonSize.large:
      return '24px'
    case ButtonSize.medium:
      return '20px'
    case ButtonSize.small:
      return '16px'
    default:
      return '20px'
  }
}
function pickThemeButtonPadding({ size }) {
  switch (size) {
    case ButtonSize.large:
      return '22px 16px'
    case ButtonSize.medium:
      return '14px 12px'
    case ButtonSize.small:
      return '10px'
    default:
      return '10px'
  }
}

const BaseThemeButton = styled.button<BaseThemeButtonProps>`
  align-items: center;
  background: ${pickThemeButtonBackgroundColor};
  border-radius: 8px;
  border: 0;
  color: ${pickThemeButtonTextColor};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${pickThemeButtonFontSize};
  font-weight: 750;
  gap: 12px;
  justify-content: center;
  line-height: ${pickThemeButtonLineHeight};
  padding: ${pickThemeButtonPadding};
  position: relative;
  transition: 150ms ease opacity;
  user-select: none;

  :hover,
  :focus {
    background: ${({ theme }) => theme.brandedGradientReversed};
  }

  :active,
  :focus,
  :hover {
    background: ${pickThemeButtonBackgroundColorHoverAndActive};
  }

  :disabled {
    cursor: default;
    opacity: 0.6;
  }
  :disabled:active,
  :disabled:focus,
  :disabled:hover {
    ${ButtonOverlay} {
      background-color: transparent;
    }
  }
`

interface ThemeButtonProps extends React.ComponentPropsWithoutRef<'button'>, BaseThemeButtonProps {}
type ThemeButtonRef = HTMLButtonElement

export const ThemeButton = forwardRef<ThemeButtonRef, ThemeButtonProps>(({ children, ...rest }, ref) => (
  <BaseThemeButton {...rest} ref={ref}>
    {children}
  </BaseThemeButton>
))

export const ButtonLight = ({ children, ...rest }: BaseButtonProps) => (
  <BaseButtonLight {...rest}>
    <ButtonOverlay />
    {children}
  </BaseButtonLight>
)
