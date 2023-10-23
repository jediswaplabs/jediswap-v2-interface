// Based mostly on https://github.com/Uniswap/interface/blob/main/src/theme/index.tsx

const signalRed = "#FF3257";
const signalGreen = "#21E70F";
const jediBlue = "#50D5FF";
const jediPink = "#FF00E9";
const jediWhite = "#FFFFFF";
const jediGrey = "#959595";
const jediNavyBlue = "#141451";

export const colors = {
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#F5F6FC",
  gray100: "#E8ECFB",
  gray150: "#D2D9EE",
  gray200: "#B8C0DC",
  gray250: "#A6AFCA",
  gray300: "#98A1C0",
  gray350: "#888FAB",
  gray400: "#7780A0",
  gray450: "#6B7594",
  gray500: "#5D6785",
  gray550: "#505A78",
  gray600: "#404A67",
  gray650: "#333D59",
  gray700: "#293249",
  gray750: "#1B2236",
  gray800: "#131A2A",
  gray850: "#0E1524",
  gray900: "#0D111C",
  gray950: "#080B11",
  pink50: "#F9ECF1",
  pink100: "#FFD9E4",
  pink200: "#FBA4C0",
  pink300: "#FF6FA3",
  pink400: "#FB118E",
  pink500: "#C41969",
  pink600: "#8C0F49",
  pink700: "#55072A",
  pink800: "#350318",
  pink900: "#2B000B",
  pinkVibrant: "#F51A70",
  red50: "#FAECEA",
  red100: "#FED5CF",
  red200: "#FEA79B",
  red300: "#FD766B",
  red400: "#FA2B39",
  red500: "#C4292F",
  red600: "#891E20",
  red700: "#530F0F",
  red800: "#380A03",
  red900: "#240800",
  redVibrant: "#F14544",
  yellow50: "#F6F2D5",
  yellow100: "#DBBC19",
  yellow200: "#DBBC19",
  yellow300: "#BB9F13",
  yellow400: "#A08116",
  yellow500: "#866311",
  yellow600: "#5D4204",
  yellow700: "#3E2B04",
  yellow800: "#231902",
  yellow900: "#180F02",
  yellowVibrant: "#FAF40A",
  // TODO: add gold 50-900
  gold200: "#EEB317",
  gold400: "#B17900",
  goldVibrant: "#FEB239",
  green50: "#E3F3E6",
  green100: "#BFEECA",
  green200: "#76D191",
  green300: "#40B66B",
  green400: "#209853",
  green500: "#0B783E",
  green600: "#0C522A",
  green700: "#053117",
  green800: "#091F10",
  green900: "#09130B",
  greenVibrant: "#5CFE9D",
  blue50: "#EDEFF8",
  blue100: "#DEE1FF",
  blue200: "#ADBCFF",
  blue300: "#869EFF",
  blue400: "#4C82FB",
  blue500: "#1267D6",
  blue600: "#1D4294",
  blue700: "#09265E",
  blue800: "#0B193F",
  blue900: "#040E34",
  blueVibrant: "#587BFF",
  // TODO: add magenta 50-900
  magenta300: "#FD82FF",
  magentaVibrant: "#FC72FF",
  purple300: "#8440F2",
  purple900: "#1C0337",
  purpleVibrant: "#6100FF",
  // TODO: add all other vibrant variations
  networkEthereum: "#627EEA",
  networkOptimism: "#FF0420",
  networkOptimismSoft: "rgba(255, 4, 32, 0.16)",
  networkPolygon: "#A457FF",
  networkArbitrum: "#28A0F0",
  networkBsc: "#F0B90B",
  networkPolygonSoft: "rgba(164, 87, 255, 0.16)",
  networkEthereumSoft: "rgba(98, 126, 234, 0.16)",
  networkBase: "#0052FF",
  //NEW COLORS FOR SPORE - need to define light/dark here cause they are root colors now (different system)
  neutral1_dark: "#FFFFFF",
  neutral2_dark: "#9B9B9B",
  neutral3_dark: "#5E5E5E",
  surface1_dark: "#131313",
  surface2_dark: "#1B1B1B",
  surface3_dark: "#FFFFFF12",
  surface4_dark: "#FFFFFF20",
  surface5_dark: "#00000004",
  accent1_dark: "#FC72FF",
  accent2_dark: "#311C31",
  neutral1_light: "#222222",
  neutral2_light: "#7D7D7D",
  neutral3_light: "#CECECE",
  surface1_light: "#FFFFFF",
  surface2_light: "#F9F9F9",
  surface3_light: "#22222212",
  surface4_light: "#FFFFFF64",
  surface5_light: "#00000004",
  accent1_light: "#FC72FF",
  accent2_light: "#FFEFFF",
  success: "#40B66B",
  critical: "#FF5F52",
  scrim: "rgba(0, 0, 0, 0.60)"
};

type Theme = typeof darkTheme;

const commonTheme = {
  white: colors.white,
  black: colors.black,

  chain_1: colors.networkEthereum,
  chain_3: colors.yellow400,
  chain_4: colors.pink400,
  chain_5: colors.green400,
  chain_10: colors.networkOptimism,
  chain_137: colors.networkPolygon,
  chain_42: colors.networkArbitrum,
  chain_56: colors.networkBsc,
  chain_420: colors.networkOptimism,
  chain_42161: colors.networkArbitrum,
  chain_421613: colors.networkArbitrum,
  chain_80001: colors.networkPolygon,
  chain_43114: colors.networkOptimism,
  chain_137_background: colors.purple900,
  chain_10_background: colors.red900,
  chain_43114_background: colors.red900,
  chain_42161_background: colors.blue900,
  chain_84531: colors.networkBase,
  chain_56_background: colors.networkBsc,
  promotional: colors.magenta300,

  brandedGradient: "linear-gradient(139.57deg, #FF79C9 4.35%, #FFB8E2 96.44%);",
  promotionalGradient: colors.accent1_light,

  primary1: jediBlue,
  primary2: jediPink,
  primary3: "#4D8FEA",
  primary4: "#376bad70",
  primary5: "#153d6f70",

  //jediswap palette
  jediWhite: "#ffffff",
  jediBlue: "#50D5FF",
  jediPink: "#FF00E9",
  jediGrey: "#959595",
  jediNavyBlue: "#141451",

  signalRed: "#FF3257",
  signalGreen: "#21E70F",

  // text
  text1: jediWhite,
  text2: "#C3C5CB",
  text3: "#6C7284",
  text4: "#565A69",
  text5: "#2C2F36",

  // backgrounds / greys
  bg1: "#212429",
  bg2: "#2C2F36",
  bg3: "#40444F",
  bg4: "#565A69",
  bg5: "#6C7284",

  jediBg: "#5D5DDF",
  jediGradientBg: "linear-gradient(95.64deg, #29AAFD 8.08%, #FF00E9 105.91%)",

  //specialty colors
  modalBG: "rgba(0,0,0,.425)",
  advancedBG: "rgba(0,0,0,0.1)",

  // other
  red1: signalRed,
  red2: signalRed,
  green1: signalGreen,
  yellow1: "#FFE270",
  yellow2: "#F3841E",
  blue1: "#2172E5"
};

export const darkTheme = {
  ...commonTheme,

  background: colors.black,

  neutral1: colors.neutral1_dark,
  neutral2: colors.neutral2_dark,
  neutral3: colors.neutral3_dark,

  surface1: colors.surface1_dark,
  surface2: colors.surface2_dark,
  surface3: colors.surface3_dark,
  surface4: colors.surface4_dark,
  surface5: colors.surface5_dark,

  accent1: colors.accent1_dark,
  accent2: colors.accent2_dark,
  success: colors.success,
  critical: colors.critical,
  scrim: colors.scrim,

  //jediswap palette
  jediWhite: "#ffffff",
  jediBlue: "#50D5FF",
  jediPink: "#FF00E9",
  jediGrey: "#959595",
  jediNavyBlue: "#141451",

  signalRed: "#FF3257",
  signalGreen: "#21E70F",

  primary1: jediBlue,
  primary2: jediPink,
  primary3: "#4D8FEA",
  primary4: "#376bad70",
  primary5: "#153d6f70",

  // text
  text1: jediWhite,
  text2: "#C3C5CB",
  text3: "#6C7284",
  text4: "#565A69",
  text5: "#2C2F36",

  // backgrounds / greys
  bg1: "#212429",
  bg2: "#2C2F36",
  bg3: "#40444F",
  bg4: "#565A69",
  bg5: "#6C7284",

  jediBg: "#5D5DDF",
  jediGradientBg: "linear-gradient(95.64deg, #29AAFD 8.08%, #FF00E9 105.91%)",

  //specialty colors
  modalBG: "rgba(0,0,0,.425)",
  advancedBG: "rgba(0,0,0,0.1)",

  // other
  red1: signalRed,
  red2: signalRed,
  green1: signalGreen,
  yellow1: "#FFE270",
  yellow2: "#F3841E",
  blue1: "#2172E5"
};

export const lightTheme: Theme = {
  ...commonTheme,

  background: colors.white,

  neutral1: colors.neutral1_light,
  neutral2: colors.neutral2_light,
  neutral3: colors.neutral3_light,

  surface1: colors.surface1_light,
  surface2: colors.surface2_light,
  surface3: colors.surface3_light,
  surface4: colors.surface4_light,
  surface5: colors.surface5_light,

  accent1: colors.accent1_light,
  accent2: colors.accent2_light,

  success: colors.success,
  critical: colors.critical,
  scrim: colors.scrim
};
