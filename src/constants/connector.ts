import { constants } from "starknet";

const { StarknetChainId } = constants;
const { location } = window;

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "5"
);

export const isTestnetEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.testnet.jediswap.xyz";
};

export const isStagingEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.staging.jediswap.xyz";
};

export const isProductionEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.jediswap.xyz";
};

export const isProductionChainId = (id: string) => {
  return id === StarknetChainId.SN_MAIN;
};

export const isTestnetChainId = (id: string) => {
  return id === StarknetChainId.SN_GOERLI;
};
