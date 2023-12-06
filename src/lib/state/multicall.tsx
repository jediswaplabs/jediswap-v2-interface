import { createMulticall, ListenerOptions } from '@uniswap/redux-multicall'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import { useInterfaceMulticall, useMainnetInterfaceMulticall } from 'hooks/useContract'
import useBlockNumber, { useMainnetBlockNumber } from 'lib/hooks/useBlockNumber'
import { useMemo } from 'react'

const multicall = createMulticall()

export default multicall

/**
 *
 * @param chainId
 * @returns The approximate whole number of blocks written to the corresponding chainId per Ethereum mainnet epoch.
 */
function getBlocksPerFetchForChainId(chainId: string | undefined): number {
  // TODO(WEB-2437): See if these numbers need to be updated
  switch (chainId) {
    default:
      return 1
  }
}

export function MulticallUpdater() {
  const { chainId } = useAccountDetails()
  const latestBlockNumber = useBlockNumber()
  const latestMainnetBlockNumber = useMainnetBlockNumber()
  const contract = useInterfaceMulticall()
  const mainnetContract = useMainnetInterfaceMulticall()
  const listenerOptions: ListenerOptions = useMemo(
    () => ({
      blocksPerFetch: getBlocksPerFetchForChainId(chainId),
    }),
    [chainId]
  )
  const mainnetListener: ListenerOptions = useMemo(
    () => ({
      blocksPerFetch: getBlocksPerFetchForChainId(ChainId.MAINNET),
    }),
    []
  )

  return (
    <>
      {/* <multicall.Updater
        chainId={ChainId.MAINNET}
        latestBlockNumber={latestMainnetBlockNumber}
        contract={mainnetContract}
        listenerOptions={mainnetListener}
      />
      {chainId !== ChainId.MAINNET && (
        <multicall.Updater
          chainId={chainId}
          latestBlockNumber={latestBlockNumber}
          contract={contract}
          listenerOptions={listenerOptions}
        />
      )} */}
    </>
  )
}
