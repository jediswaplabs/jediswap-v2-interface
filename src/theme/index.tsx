import { rootCssString } from 'nft/css/cssStringFromTheme'
import React, { useMemo } from 'react'
import { createGlobalStyle, css, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { useIsDarkMode } from 'theme/components/ThemeToggle'

import { navDimensions } from '../nft/css/sprinkles.css'
import { darkTheme, lightTheme } from './colors'
import { darkDeprecatedTheme, lightDeprecatedTheme } from './deprecatedColors'

export const MEDIA_WIDTHS = {
  deprecated_upToExtraSmall: 500,
  deprecated_upToSmall: 720,
  deprecated_upToMedium: 960,
  deprecated_upToLarge: 1280,
}

const MAX_CONTENT_WIDTH = '1200px'

const deprecated_mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(
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
  lg: '24px',
  xl: '32px',
}
export type Gap = keyof typeof gapValues

function getSettings(darkMode: boolean) {
  return {
    grids: gapValues,
    fonts,

    // shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    deprecated_mediaWidth: deprecated_mediaWidthTemplates,

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
export function getTheme(darkMode: boolean) {
  return {
    darkMode,
    ...(darkMode ? darkTheme : lightTheme),
    ...(darkMode ? darkDeprecatedTheme : lightDeprecatedTheme),
    ...getSettings(darkMode),
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const themeObject = useMemo(() => getTheme(darkMode), [darkMode])
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const ThemedGlobalStyle = createGlobalStyle`
  html, input, textarea, button {
    font-family: 'Avenir LT Std', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'Avenir LT Std', sans-serif;
    }
  }

  html,
  body {
    margin: 0;
    padding: 0;
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
    background: linear-gradient(108.58deg, #03001E 20.7%, #EC38BC 36.65%, #7303C0 57.02%, #2A3EF5 71.08%, #38742F 93.32%);
    background-repeat: no-repeat;
    background-size: cover;
  }
  
  body {
    min-height: 100vh;
    background: linear-gradient(66.46deg, #03001E 24.27%, rgba(3, 0, 30, 0.612102) 57.29%, rgba(3, 0, 30, 0) 100%);
    background-repeat: no-repeat;
    background-size: cover;
  }
  // a {
  //   color: ${({ theme }) => theme.accent1}; 
  // }

  :root {
    ${({ theme }) => rootCssString(theme.darkMode)}
  }
`
