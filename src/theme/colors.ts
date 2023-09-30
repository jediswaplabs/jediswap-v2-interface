// Based mostly on https://github.com/Uniswap/interface/blob/main/src/theme/index.tsx

import { Colors } from "./styled";

const white = "#FFFFFF";
const black = "#000000";

const jediBlue = "#50D5FF";
const jediPink = "#FF00E9";
const jediWhite = white;
const jediGrey = "#959595";
const jediNavyBlue = "#141451";

const signalRed = "#FF3257";
const signalGreen = "#21E70F";

export function colors(): Colors {
  return {
    // base
    white,
    black,

    // Jedi Colors
    jediBlue,
    jediPink,
    jediWhite,
    jediGrey,
    jediNavyBlue,

    // Signal Colors
    signalRed,
    signalGreen,

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

    //primary colors
    // primary1: darkMode ? '#2172E5' : '#ff007a',
    // primary2: darkMode ? '#3680E7' : '#FF8CC3',
    // primary3: darkMode ? '#4D8FEA' : '#FF99C9',
    // primary4: darkMode ? '#376bad70' : '#F6DDE8',
    // primary5: darkMode ? '#153d6f70' : '#FDEAF1',

    primary1: jediBlue,
    primary2: jediPink,
    primary3: "#4D8FEA",
    primary4: "#376bad70",
    primary5: "#153d6f70",

    // color text
    primaryText1: "#6da8ff",

    // secondary colors
    secondary1: "#2172E5",
    secondary2: "#17000b26",
    secondary3: "#17000b26",

    // other
    red1: signalRed,
    red2: signalRed,
    green1: signalGreen,
    yellow1: "#FFE270",
    yellow2: "#F3841E",
    blue1: "#2172E5"

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  };
}
