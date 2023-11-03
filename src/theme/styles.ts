// @ts-nocheck
import { css, keyframes } from 'styled-components';

export const flexColumnNoWrap = css`
  display: flex;
  flex-flow: column nowrap;
`;

export const flexRowNoWrap = css`
  display: flex;
  flex-flow: row nowrap;
`;

export enum TRANSITION_DURATIONS {
  slow = 500,
  medium = 250,
  fast = 125,
}

const transitions = {
  duration: {
    slow: `${TRANSITION_DURATIONS.slow}ms`,
    medium: `${TRANSITION_DURATIONS.medium}ms`,
    fast: `${TRANSITION_DURATIONS.fast}ms`,
  },
  timing: {
    ease: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const textFadeIn = css`
  animation: ${fadeIn} ${transitions.duration.fast} ${transitions.timing.in};
`;

// Gradient with a fallback to solid color.
export const themeTextGradient = ({ fallbackColor, gradientColor }: { fallbackColor?: string, gradientColor?: string}) => css`
  background-color: ${({ theme }) => fallbackColor ?? theme.neutral1};

  @supports (-webkit-background-clip: text) and (-webkit-text-fill-color: transparent) {
    background-image: ${({ theme }) => gradientColor ?? theme.brandedGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const themeBorderGradient = ({ size = 1, gradientColor }: { size?: number, gradientColor?: string}) => css`
  border-style: solid;
  border-width: ${size}px;
  border-image-slice: 1;
  border-image-source:  ${({ theme }) => gradientColor ?? theme.brandedGradient}
`;

export const themeBoxBorderGradient = ({ ignoreRelative = false, size = '2px', borderRadius = '8px', gradientColor }: { ignoreRelative?: boolean, size?: string, borderRadius?: string, gradientColor?: string}) => css`
  ${!ignoreRelative && css`position: relative;`}

  &:before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: ${borderRadius};
    padding: ${size};
    background: ${({ theme }) => gradientColor ?? theme.brandedGradient};
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;
