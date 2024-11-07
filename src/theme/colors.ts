// Based mostly on https://github.com/Uniswap/interface/blob/main/src/theme/index.tsx

const jediBlue = '#FF7034'
const jediPink = '#0F1118'
const jediWhite = '#fff'
const jediGrey = '#959595'
const jediNavyBlue = '#141451'
const signalGreen = '#21E70F'
const jediGreyBorder = '#444'
const signalRed = '#FC4D4D'

const a51Orange = '#FF7034'
const a51Blue = '#026271'
const a51Black = '#0F1118'

export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  greyLight: '#F2F2F2',

  gray50: '#F5F6FC',
  gray100: '#E8ECFB',
  gray150: '#D2D9EE',
  gray200: '#B8C0DC',
  gray250: '#A6AFCA',
  gray300: '#98A1C0',
  gray350: '#888FAB',
  gray400: '#7780A0',
  gray450: '#6B7594',
  gray500: '#5D6785',
  gray550: '#505A78',
  gray600: '#404A67',
  gray650: '#333D59',
  gray700: '#293249',
  gray750: '#1B2236',
  gray800: '#131A2A',
  gray850: '#0E1524',
  gray900: '#0D111C',
  gray950: '#080B11',
  pink50: '#0F1118',
  pink100: '#0F1118',
  pink200: '#0F1118',
  pink300: '#0F1118',
  pink400: '#0F1118',
  pink500: '#0F1118',
  pink600: '#0F1118',
  pink700: '#0F1118',
  pink800: '#0F1118',
  pink900: '#0F1118',
  pinkVibrant: '#0F1118',
  red50: '#FAECEA',
  red100: '#FED5CF',
  red200: '#FEA79B',
  red300: '#FD766B',
  red400: '#FA2B39',
  red500: '#C4292F',
  red600: '#891E20',
  red700: '#530F0F',
  red800: '#380A03',
  red900: '#240800',
  redVibrant: '#F14544',
  yellow50: '#F6F2D5',
  yellow100: '#DBBC19',
  yellow200: '#DBBC19',
  yellow300: '#BB9F13',
  yellow400: '#A08116',
  yellow500: '#866311',
  yellow600: '#5D4204',
  yellow700: '#3E2B04',
  yellow800: '#231902',
  yellow900: '#180F02',
  yellowVibrant: '#FAF40A',
  // TODO: add gold 50-900
  gold200: '#EEB317',
  gold400: '#B17900',
  goldVibrant: '#FEB239',

  green1: signalGreen,
  green50: '#E3F3E6',
  green100: '#BFEECA',
  green200: '#76D191',
  green300: '#40B66B',
  green400: '#209853',
  green500: '#0B783E',
  green600: '#0C522A',
  green700: '#053117',
  green800: '#091F10',
  green900: '#09130B',
  greenVibrant: '#5CFE9D',
  blue50: '#FF7034',
  blue100: '#FF7034',
  blue200: '#FF7034',
  blue300: '#FF7034',
  blue400: '#FF7034',
  blue500: '#FF7034',
  blue600: '#FF7034',
  blue700: '#FF7034',
  blue800: '#FF7034',
  blue900: '#FF7034',
  blueVibrant: '#FF7034',
  // TODO: add magenta 50-900
  magenta300: '#FF7034',
  magentaVibrant: '#FF7034',
  purple300: '#FF7034',
  purple900: '#FF7034',
  purpleVibrant: '#FF7034',
  // TODO: add all other vibrant variations
  networkEthereum: '#627EEA',
  networkOptimism: '#FF0420',
  networkOptimismSoft: 'rgba(255, 4, 32, 0.16)',
  networkPolygon: '#A457FF',
  networkArbitrum: '#28A0F0',
  networkBsc: '#F0B90B',
  networkPolygonSoft: 'rgba(164, 87, 255, 0.16)',
  networkEthereumSoft: 'rgba(98, 126, 234, 0.16)',
  networkBase: '#0052FF',

  // NEW COLORS FOR SPORE - need to define light/dark here cause they are root colors now (different system)
  neutral1_dark: '#FFFFFF',
  neutral2_dark: '#959595',
  neutral3_dark: jediGrey,

  surface1_dark: jediNavyBlue,
  surface2_dark: '#2C2F36',
  surface3_dark: '#40444F',
  surface4_dark: '#C4C4C403',
  surface5_dark: '#ffffff26',
  surface6_dark: '#323C5C',

  accent1_dark: jediBlue,
  accent2_dark: jediBlue,

  neutral1_light: jediWhite,
  neutral2_light: '#7D7D7D',
  neutral3_light: '#CECECE',

  surface1_light: '#FFFFFF',
  surface2_light: '#F9F9F9',
  surface3_light: '#22222212',
  surface4_light: '#FFFFFF64',
  surface5_light: '#00000004',
  surface6_light: '#00000004',

  accent1_light: jediBlue,
  accent2_light: '#FFEFFF',
  success: '#40B66B',
  critical: '#FF3257',
  scrim: 'rgba(0, 0, 0, 0.60)',
  divider: 'rgba(255, 255, 255, 0.40)',
}

type Theme = typeof darkTheme

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
  notice: colors.greyLight,

  brandedGradient: jediBlue,
  brandedGradientReversed: jediBlue,
  promotionalGradient: jediBlue,
  bgdGradient: jediBlue,

  a51Black,
  a51Orange,
  a51Blue,

  jediBlue,
  jediPink,
  jediWhite,
  jediGrey,
  jediNavyBlue,
  signalGreen,
  jediGreyBorder,
  signalRed,
  text1: 'FAFAFA',
  advancedBG: 'rgba(0,0,0,0.1)',
  bg5: '#565A69'
}

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
  surface6: colors.surface6_dark,

  accent1: colors.accent1_dark,
  accent2: colors.accent2_dark,
  success: colors.success,
  critical: colors.critical,
  scrim: colors.scrim,
  divider: colors.divider,
}
