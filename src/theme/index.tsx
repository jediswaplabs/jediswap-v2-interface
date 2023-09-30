import React from "react";
import {
  createGlobalStyle,
  css,
  ThemeProvider as StyledComponentsThemeProvider
} from "styled-components";
import { colors } from "./colors";

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280
};

const mediaWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css;
} = Object.keys(MEDIA_WIDTHS).reduce((acc, size) => {
  acc[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `;
  return acc;
}, {} as any);

export const BREAKPOINTS = {
  xs: 396,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  xxxl: 1920
};

// deprecated - please use the ones in styles.ts file
const transitions = {
  duration: {
    slow: "500ms",
    medium: "250ms",
    fast: "125ms"
  },
  timing: {
    ease: "ease",
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out"
  }
};

const opacities = {
  hover: 0.6,
  click: 0.4,
  disabled: 0.5,
  enabled: 1
};

const fonts = {
  code: "courier, courier new, serif"
};

const gapValues = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "24px",
  xl: "32px"
};
export type Gap = keyof typeof gapValues;

// eslint-disable-next-line import/no-unused-modules -- used in styled.d.ts
export function getTheme() {
  return {
    ...colors(),
    fonts,

    breakpoint: BREAKPOINTS,
    transition: transitions,
    opacity: opacities,

    grids: {
      sm: 8,
      md: 12,
      lg: 24
    },

    // media queries
    mediaWidth: mediaWidthTemplates,

    //shadows
    shadow1: "#000",

    // media queries
    // mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `
  };
}

export default function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // const darkMode = useIsDarkMode()
  // const themeObject = useMemo(() => getTheme(darkMode), [darkMode])
  const themeObject = getTheme();
  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {children}
    </StyledComponentsThemeProvider>
  );
}

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  font-family: 'Avenir LT Std', sans-serif;
  background-color: ${({ theme }) => theme.jediBg};
  background: linear-gradient(108.58deg, #03001E 20.7%, #EC38BC 36.65%, #7303C0 57.02%, #2A3EF5 71.08%, #38742F 93.32%);
  background-repeat: no-repeat;
  background-size: cover;
  //backdrop-filter: blur(400px);
}

body {
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(66.46deg, #03001E 24.27%, rgba(3, 0, 30, 0.612102) 57.29%, rgba(3, 0, 30, 0) 100%);
  //backdrop-filter: blur(400px);
  background-repeat: no-repeat;
  background-size: cover;
}
`;
