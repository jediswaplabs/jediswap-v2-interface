import { ButtonSecondary } from "components/Button";
import WalletModal from "components/WalletModal";
import { useAccountDetails } from "hooks/starknet-react";
import React from "react";
import styled from "styled-components";

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  /* padding: 0.5rem; */
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background: linear-gradient(95.64deg, #29aafd 8.08%, #ff00e9 105.91%);
  border: none;
  color: ${({ theme }) => theme.jediWhite};
  height: 38px;
  width: 202px;
  border-radius: 8px;
  transition: all 5s ease-out;

  :hover,
  :focus {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
    border: none;
    color: ${({ theme }) => theme.jediWhite};
  }
`;

// const ConnectStateText = styled(Text)`
//   font-size: 16px;
//   font-style: normal;
//   font-weight: 800;
//   line-height: 20px;
//   text-align: left;
// `

function Web3StatusInner() {
  // const { t } = useTranslation()
  // const { error } = useStarknetReact()
  // const { address, connector } = useAccountDetails()
  // // console.log('🚀 ~ file: index.tsx:198 ~ Web3StatusInner ~ provider:', provider.get)

  // const allTransactions = useAllTransactions()

  // const sortedRecentTransactions = useMemo(() => {
  //   const txs = Object.values(allTransactions)
  //   return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  // }, [allTransactions])

  // const pending = sortedRecentTransactions
  //   .filter(tx => !tx.receipt || tx.receipt.status === 'PENDING' || tx.receipt.status === 'RECEIVED')
  //   .map(tx => tx.hash)

  // const hasPendingTransactions = !!pending.length
  // // const hasSocks = useHasSocks()
  // const toggleWalletModal = useWalletModalToggle()

  // if (address) {
  //   return (
  //     <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
  //       {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
  //       {hasPendingTransactions ? (
  //         <RowBetween>
  //           <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
  //         </RowBetween>
  //       ) : (
  //         <Text>{starkID ? starkID : shortenAddress(address)}</Text>
  //       )}
  //     </Web3StatusConnected>
  //   )
  // } else if (error) {
  //   return (
  //     <Web3StatusError onClick={toggleWalletModal}>
  //       <NetworkIcon src={WrongNetwork} />
  //       <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
  //     </Web3StatusError>
  //   )
  // } else {
  const { address } = useAccountDetails();

  const addressShort = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect wallet";

  return (
    <Web3StatusConnect id="connect-wallet">
      <>{addressShort}</>
    </Web3StatusConnect>
  );
  // }
}

const Web3Status = () => {
  return (
    <>
      <Web3StatusInner />
      {/* <WalletModal /> */}
    </>
  );
};

export default Web3Status;
