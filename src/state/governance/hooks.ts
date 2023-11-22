import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import type { TransactionResponse } from '@ethersproject/providers'
import { toUtf8String, Utf8ErrorFuncs, Utf8ErrorReason } from '@ethersproject/strings'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import GovernorAlphaJSON from '@uniswap/governance/build/GovernorAlpha.json'
import UniJSON from '@uniswap/governance/build/Uni.json'
import {
  ChainId,
  CurrencyAmount,
  GOVERNANCE_ALPHA_V0_ADDRESSES,
  GOVERNANCE_ALPHA_V1_ADDRESSES,
  GOVERNANCE_BRAVO_ADDRESSES,
  Token,
} from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import GOVERNOR_BRAVO_ABI from 'abis/governor-bravo.json'
import { LATEST_GOVERNOR_INDEX } from 'constants/governance'
import { POLYGON_PROPOSAL_TITLE } from 'constants/proposals/polygon_proposal_title'
import { UNISWAP_GRANTS_PROPOSAL_DESCRIPTION } from 'constants/proposals/uniswap_grants_proposal_description'
// import { useContract } from 'hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import {
  BRAVO_START_BLOCK,
  MOONBEAN_START_BLOCK,
  ONE_BIP_START_BLOCK,
  POLYGON_START_BLOCK,
  UNISWAP_GRANTS_START_BLOCK,
} from '../../constants/proposals'
import { UNI } from '../../constants/tokens'
// import { useLogs } from '../logs/hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { TransactionType } from '../transactions/types'
import { VoteOption } from './types'

// function useGovernanceV0Contract(): Contract | null {
//   return useContract(GOVERNANCE_ALPHA_V0_ADDRESSES, GovernorAlphaJSON.abi, false)
// }

// function useGovernanceV1Contract(): Contract | null {
//   return useContract(GOVERNANCE_ALPHA_V1_ADDRESSES, GovernorAlphaJSON.abi, false)
// }

// function useGovernanceBravoContract(): Contract | null {
//   return useContract(GOVERNANCE_BRAVO_ADDRESSES, GOVERNOR_BRAVO_ABI, true)
// }

// const useLatestGovernanceContract = useGovernanceBravoContract

function useUniContract() {
  const { chainId } = useWeb3React()
  const uniAddress = useMemo(() => (chainId ? UNI[chainId]?.address : undefined), [chainId])
  // return useContract(uniAddress, UniJSON.abi, true)
}

interface ProposalDetail {
  target: string
  functionSig: string
  callData: string
}

export interface ProposalData {
  id: string
  title: string
  description: string
  proposer: string
  status: ProposalState
  forCount: CurrencyAmount<Token>
  againstCount: CurrencyAmount<Token>
  startBlock: number
  endBlock: number
  eta: BigNumber
  details: ProposalDetail[]
  governorIndex: number // index in the governance address array for which this proposal pertains
}

export interface CreateProposalData {
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
  description: string
}

export enum ProposalState {
  UNDETERMINED = -1,
  PENDING,
  ACTIVE,
  CANCELED,
  DEFEATED,
  SUCCEEDED,
  QUEUED,
  EXPIRED,
  EXECUTED,
}

const GovernanceInterface = new Interface(GovernorAlphaJSON.abi)

// get count of all proposals made in the latest governor contract
function useProposalCount(contract: Contract | null): number | undefined {
  const { result } = useSingleCallResult(contract, 'proposalCount')

  return result?.[0]?.toNumber()
}

interface FormattedProposalLog {
  description: string
  details: { target: string; functionSig: string; callData: string }[]
}

const FOUR_BYTES_DIR: { [sig: string]: string } = {
  '0x5ef2c7f0': 'setSubnodeRecord(bytes32,bytes32,address,address,uint64)',
  '0x10f13a8c': 'setText(bytes32,string,string)',
  '0xb4720477': 'sendMessageToChild(address,bytes)',
  '0xa9059cbb': 'transfer(address,uint256)',
  '0x095ea7b3': 'approve(address,uint256)',
  '0x7b1837de': 'fund(address,uint256)',
}

/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */
function useFormattedProposalCreatedLogs(
  contract: Contract | null,
  indices: number[][],
  fromBlock?: number,
  toBlock?: number
): FormattedProposalLog[] | undefined {
  // create filters for ProposalCreated events
  const filter = useMemo(() => {
    const filter = contract?.filters?.ProposalCreated()
    if (!filter) return undefined
    return {
      ...filter,
      fromBlock,
      toBlock,
    }
  }, [contract, fromBlock, toBlock])

  // const useLogsResult = useLogs(filter)

  // return useMemo(() => {
  //   return useLogsResult?.logs
  //     ?.map((log) => {
  //       const parsed = GovernanceInterface.parseLog(log).args
  //       return parsed
  //     })
  //     ?.filter((parsed) => indices.flat().some((i) => i === parsed.id.toNumber()))
  //     ?.map((parsed) => {
  //       let description!: string

  //       const startBlock = parseInt(parsed.startBlock?.toString())
  //       try {
  //         description = parsed.description
  //       } catch (error) {
  //         // replace invalid UTF-8 in the description with replacement characters
  //         let onError = Utf8ErrorFuncs.replace

  //         // Bravo proposal reverses the codepoints for U+2018 (‘) and U+2026 (…)
  //         if (startBlock === BRAVO_START_BLOCK) {
  //           const U2018 = [0xe2, 0x80, 0x98].toString()
  //           const U2026 = [0xe2, 0x80, 0xa6].toString()
  //           onError = (reason, offset, bytes, output) => {
  //             if (reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
  //               const charCode = [bytes[offset], bytes[offset + 1], bytes[offset + 2]].reverse().toString()
  //               if (charCode === U2018) {
  //                 output.push(0x2018)
  //                 return 2
  //               } else if (charCode === U2026) {
  //                 output.push(0x2026)
  //                 return 2
  //               }
  //             }
  //             return Utf8ErrorFuncs.replace(reason, offset, bytes, output)
  //           }
  //         }

  //         description = JSON.parse(toUtf8String(error.error.value, onError)) || ''
  //       }

  //       // some proposals omit newlines
  //       if (
  //         startBlock === BRAVO_START_BLOCK ||
  //         startBlock === ONE_BIP_START_BLOCK ||
  //         startBlock === MOONBEAN_START_BLOCK
  //       ) {
  //         description = description.replace(/ {2}/g, '\n').replace(/\d\. /g, '\n$&')
  //       }

  //       return {
  //         description,
  //         details: parsed.targets.map((target: string, i: number) => {
  //           const signature = parsed.signatures[i]
  //           let calldata = parsed.calldatas[i]
  //           let name: string
  //           let types: string
  //           if (signature === '') {
  //             const fourbyte = calldata.slice(0, 10)
  //             const sig = FOUR_BYTES_DIR[fourbyte] ?? 'UNKNOWN()'
  //             if (!sig) throw new Error('Missing four byte sig')
  //             ;[name, types] = sig.substring(0, sig.length - 1).split('(')
  //             calldata = `0x${calldata.slice(10)}`
  //           } else {
  //             ;[name, types] = signature.substring(0, signature.length - 1).split('(')
  //           }
  //           const decoded = defaultAbiCoder.decode(types.split(','), calldata)
  //           return {
  //             target,
  //             functionSig: name,
  //             callData: decoded.join(', '),
  //           }
  //         }),
  //       }
  //     })
  // }, [indices, useLogsResult])
  return undefined
}

const V0_PROPOSAL_IDS = [[1], [2], [3], [4]]
const V1_PROPOSAL_IDS = [[1], [2], [3]]

function countToIndices(count: number | undefined, skip = 0) {
  return typeof count === 'number' ? new Array(count - skip).fill(0).map((_, i) => [i + 1 + skip]) : []
}

// get data for all past and active proposals
export function useAllProposalData() {
  const { chainId } = useWeb3React()
  // const gov0 = useGovernanceV0Contract()
  // const gov1 = useGovernanceV1Contract()
  // const gov2 = useGovernanceBravoContract()

  // const proposalCount0 = useProposalCount(gov0)
  // const proposalCount1 = useProposalCount(gov1)
  // const proposalCount2 = useProposalCount(gov2)

  // const gov0ProposalIndexes = useMemo(() => {
  //   return chainId === ChainId.MAINNET ? V0_PROPOSAL_IDS : countToIndices(proposalCount0)
  // }, [chainId, proposalCount0])
  // const gov1ProposalIndexes = useMemo(() => {
  //   return chainId === ChainId.MAINNET ? V1_PROPOSAL_IDS : countToIndices(proposalCount1)
  // }, [chainId, proposalCount1])
  // const gov2ProposalIndexes = useMemo(() => {
  //   return countToIndices(proposalCount2, 8)
  // }, [proposalCount2])

  // const proposalsV0 = useSingleContractMultipleData(gov0, 'proposals', gov0ProposalIndexes)
  // const proposalsV1 = useSingleContractMultipleData(gov1, 'proposals', gov1ProposalIndexes)
  // const proposalsV2 = useSingleContractMultipleData(gov2, 'proposals', gov2ProposalIndexes)

  // // get all proposal states
  // const proposalStatesV0 = useSingleContractMultipleData(gov0, 'state', gov0ProposalIndexes)
  // const proposalStatesV1 = useSingleContractMultipleData(gov1, 'state', gov1ProposalIndexes)
  // const proposalStatesV2 = useSingleContractMultipleData(gov2, 'state', gov2ProposalIndexes)

  // // get metadata from past events
  // const formattedLogsV0 = useFormattedProposalCreatedLogs(gov0, gov0ProposalIndexes, 11042287, 12563484)
  // const formattedLogsV1 = useFormattedProposalCreatedLogs(gov1, gov1ProposalIndexes, 12686656, 13059343)
  // const formattedLogsV2 = useFormattedProposalCreatedLogs(gov2, gov2ProposalIndexes, 13538153)

  const uni = useMemo(() => (chainId ? UNI[chainId] : undefined), [chainId])

  // early return until events are fetched
  return useMemo(() => {
    return {}
  }, [uni])
}

export function useProposalData(governorIndex: number, id: string): ProposalData | undefined {
  return undefined
}

export function useQuorum(governorIndex: number): CurrencyAmount<Token> | undefined {
  // const latestGovernanceContract = useLatestGovernanceContract()
  // const quorumVotes = useSingleCallResult(latestGovernanceContract, 'quorumVotes')?.result?.[0]
  // const { chainId } = useWeb3React()
  // const uni = useMemo(() => (chainId ? UNI[chainId] : undefined), [chainId])

  // if (
  //   !latestGovernanceContract ||
  //   !quorumVotes ||
  //   chainId !== ChainId.MAINNET ||
  //   !uni ||
  //   governorIndex !== LATEST_GOVERNOR_INDEX
  // )
  return undefined

  // return CurrencyAmount.fromRawAmount(uni, quorumVotes)
}

// get the users delegatee if it exists
export function useUserDelegatee(): string {
  return ''
}

// gets the users current votes
export function useUserVotes() {
  return undefined
}

// fetch available votes as of block (usually proposal start block)
export function useUserVotesAsOfBlock(block: number | undefined): CurrencyAmount<Token> | undefined {
  return undefined
}

export function useDelegateCallback() {
  return undefined
}

export function useVoteCallback() {
  return undefined
}

export function useQueueCallback() {
  const { account, chainId } = useWeb3React()
  // const latestGovernanceContract = useLatestGovernanceContract()
  const addTransaction = useTransactionAdder()

  return undefined
}

export function useExecuteCallback() {
  const { account, chainId } = useWeb3React()
  // const latestGovernanceContract = useLatestGovernanceContract()
  const addTransaction = useTransactionAdder()

  return undefined
}

export function useCreateProposalCallback() {
  return undefined
}

export function useLatestProposalId(address: string | undefined): string | undefined {
  // const latestGovernanceContract = useLatestGovernanceContract()
  // const res = useSingleCallResult(latestGovernanceContract, 'latestProposalIds', [address])
  return ''
}

export function useProposalThreshold(): CurrencyAmount<Token> | undefined {
  const { chainId } = useWeb3React()

  // const latestGovernanceContract = useLatestGovernanceContract()
  // const res = useSingleCallResult(latestGovernanceContract, 'proposalThreshold')
  // const uni = useMemo(() => (chainId ? UNI[chainId] : undefined), [chainId])

  // if (res?.result?.[0] && uni) {
  //   return CurrencyAmount.fromRawAmount(uni, res.result[0])
  // }

  return undefined
}
