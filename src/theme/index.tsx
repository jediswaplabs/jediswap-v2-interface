import React, { useMemo } from 'react'
import { createGlobalStyle, css, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

import { rootCssString } from 'nft/css/cssStringFromTheme'
import { navDimensions } from '../nft/css/sprinkles.css'
import { darkTheme } from './colors'
import { darkDeprecatedTheme } from './deprecatedColors'

export const MEDIA_WIDTHS = {
  deprecated_upToExtraSmall: 500,
  deprecated_upToSmall: 720,
  deprecated_upToMedium: 960,
  deprecated_upToLarge: 1280,
}

const MAX_CONTENT_WIDTH = '1200px'

const deprecatedMediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(
  MEDIA_WIDTHS
).reduce((acc, size) => {
  acc[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return acc
}, {} as any)

export const BREAKPOINTS = {
  xs: 396,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  xxxl: 1920,
}

// deprecated - please use the ones in styles.ts file
const transitions = {
  duration: {
    slow: '500ms',
    medium: '250ms',
    fast: '125ms',
  },
  timing: {
    ease: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
}

const opacities = {
  hover: 0.6,
  click: 0.4,
  disabled: 0.5,
  enabled: 1,
}

const fonts = {
  code: 'courier, courier new, serif',
}

const gapValues = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
}
export type Gap = keyof typeof gapValues

function getSettings() {
  return {
    grids: gapValues,
    fonts,

    // shadows
    shadow1: '#000',

    // media queries
    deprecated_mediaWidth: deprecatedMediaWidthTemplates,

    navHeight: navDimensions.height,
    navVerticalPad: navDimensions.verticalPad,
    mobileBottomBarHeight: 60,
    maxWidth: MAX_CONTENT_WIDTH,

    // deprecated - please use hardcoded exported values instead of
    // adding to the theme object
    breakpoint: BREAKPOINTS,
    transition: transitions,
    opacity: opacities,
  }
}

// eslint-disable-next-line import/no-unused-modules -- used in styled.d.ts
export function getTheme() {
  return {
    darkMode: true,
    ...darkTheme,
    ...darkDeprecatedTheme,
    ...getSettings(),
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeObject = getTheme()
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const ThemedGlobalStyle = createGlobalStyle`
  html, input, textarea, button {
    font-family: 'DM Sans', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'DM Sans', sans-serif;
    }
  }

  html,
  body {
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
    background: ${({ theme }) => theme.bgdGradient};
    background-repeat: no-repeat;
    background-size: cover;
  }

  * {
    box-sizing: border-box;
  }

  button {
    user-select: none;
  }

  html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;

    color: ${({ theme }) => theme.neutral1};
  }
  
  body {
    height: 100vh;
  }
  
  :root {
    ${({ theme }) => rootCssString(theme.darkMode)}
  }
`
