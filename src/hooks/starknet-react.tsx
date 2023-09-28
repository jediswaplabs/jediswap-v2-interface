import { useAccount, useBalance, useConnect } from "@starknet-react/core";
import React from "react";

const useAccountDetails = () => {
  const { account, address } = useAccount();
  return { account, address };
};

const useConnectors = () => {
  const { connect, connectors } = useConnect();
  return { connect, connectors };
};

const useBalances = () => {
  const { address } = useAccount();
  const {
    data: balance,
    error,
    isLoading
  } = useBalance({
    address,
    watch: true
  });

  return { balance };
};
