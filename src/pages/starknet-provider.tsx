"use client";
import React from "react";

import { goerli } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [goerli];
  const providers = [publicProvider()];
  const connectors = [braavos(), argent()];

  return (
    <StarknetConfig
      chains={chains}
      providers={providers}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
