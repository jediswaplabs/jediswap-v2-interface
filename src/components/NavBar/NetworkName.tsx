import { useWeb3React } from '@web3-react/core';
import { useRef } from 'react';
import styled from 'styled-components';

import { getChainInfo } from 'constants/chainInfo';
import useSyncChainQuery from 'hooks/useSyncChainQuery';

const ChainSelectorRow = styled.div`
  width: 162px;
  height: 38px;
  flex-shrink: 0;
  margin-right: 16px;

  border-radius: 8px;
  background: var(--Jedi-Navy-Blue, #141451);

  display: flex;
  align-items: center;
  justify-content: center;

  // text content
  color: var(--Jedi-White, #FFF);
  text-align: center;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir LT Std;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 125% */ 
`;

export const NetworkName = () => {
  const { chainId, account } = useWeb3React();

  const ref = useRef<HTMLDivElement>(null);

  const info = getChainInfo(chainId);

  useSyncChainQuery();

  if (!account || !chainId) {
    return null;
  }

  const isSupported = !!info;

  return (
    <ChainSelectorRow>
      {!isSupported ? (
        'Unsupported Network'
      ) : (
        info.label
      )}
    </ChainSelectorRow>
  );
};
