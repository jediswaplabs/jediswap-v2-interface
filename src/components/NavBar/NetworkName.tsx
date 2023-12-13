import { useWeb3React } from '@web3-react/core'
import { useRef, useState } from 'react'
import styled from 'styled-components'

import { getChainInfo } from 'constants/chainInfo'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import { useAccountDetails } from 'hooks/starknet-react'
import { Box } from 'rebass/styled-components'
import { goerli, mainnet } from '@starknet-react/chains'
import { constants } from 'starknet'

const ChainSelectorRow = styled.div`
  height: 38px;
  flex-shrink: 0;
  padding: 10px 24px;

  border-radius: 8px;
  background: ${({ theme }) => theme.jediNavyBlue};

  display: flex;
  align-items: center;
  justify-content: center;

  // text content
  color: ${({ theme }) => theme.jediWhite};
  text-align: center;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir LT Std;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 125% */
`

export const Card = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
  width: 100%;
  border-radius: 16px;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  font-weight: 500;
`

const NetworkCard = styled(YellowCard)`
  border-radius: 8px;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
  border: 2px solid transparent;
`

export const NetworkName = () => {
  const { chainId } = useWeb3React()
  const [currentChainId, setCurrentChainId] = useState<BigInt>()
  const { isConnected, account, connector } = useAccountDetails()

  const info = getChainInfo(chainId)

  useSyncChainQuery()

  if (!account || !chainId) {
    return null
  }

  const isSupported = !!info
  connector?.chainId().then((chainId) => {
    setCurrentChainId(chainId)
  })

  const isNetworkMainnet = currentChainId === BigInt(constants.StarknetChainId.SN_MAIN)

  return (
    <ChainSelectorRow>
      {isConnected ? (
        isNetworkMainnet ? (
          <NetworkCard title={'Starknet Mainnet'}>{'Starknet Mainnet'}</NetworkCard>
        ) : (
          <NetworkCard title={'Starknet Görli'}>{'Starknet Görli'}</NetworkCard>
        )
      ) : null}
    </ChainSelectorRow>
  )
}
