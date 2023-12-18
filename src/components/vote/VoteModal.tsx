import { Trans } from '@lingui/macro'
import { useAccountDetails } from 'hooks/starknet-react'
import { useState } from 'react'
import { ArrowUpCircle, X } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { CustomLightSpinner, ThemedText } from 'theme/components'
import { ExternalLink } from 'theme/components'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import Circle from '../../assets/images/blue-loader.svg'
// import { useUserVotes, useVoteCallback } from '../../state/governance/hooks'
// import { VoteOption } from '../../state/governance/types'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`

const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

interface VoteModalProps {
  isOpen: boolean
  onDismiss: () => void
  // voteOption?: VoteOption
  proposalId?: string // id for the proposal to vote on
}

export default function VoteModal({ isOpen, onDismiss, proposalId }: VoteModalProps) {
  const { chainId } = useAccountDetails()
  // const voteCallback = useVoteCallback()
  // const { votes: availableVotes } = useUserVotes()

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState<boolean>(false)

  // get theme for colors
  const theme = useTheme()

  // wrapper to reset state on modal close
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onVote() {
    setAttempting(true)

    // if callback not returned properly ignore
    // if (!voteCallback || voteOption === undefined) return

    // // try delegation and store hash
    // const hash = await voteCallback(proposalId, voteOption)?.catch((error) => {
    //   setAttempting(false)
    //   console.log(error)
    // })

    // if (hash) {
    //   setHash(hash)
    // }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          {/* <AutoColumn gap="lg" justify="center">
            <RowBetween>
              <ThemedText.DeprecatedMediumHeader fontWeight={535}>
                {voteOption === VoteOption.Against ? (
                  <Trans>Vote against proposal {proposalId}</Trans>
                ) : voteOption === VoteOption.For ? (
                  <Trans>Vote for proposal {proposalId}</Trans>
                ) : (
                  <Trans>Vote to abstain on proposal {proposalId}</Trans>
                )}
              </ThemedText.DeprecatedMediumHeader>
              <StyledClosed onClick={wrappedOnDismiss} />
            </RowBetween>
            <ThemedText.DeprecatedLargeHeader>
              <Trans>{formatCurrencyAmount(availableVotes, 4)} Votes</Trans>
            </ThemedText.DeprecatedLargeHeader>
            <ButtonPrimary onClick={onVote}>
              <ThemedText.DeprecatedMediumHeader color="white">
                {voteOption === VoteOption.Against ? (
                  <Trans>Vote against proposal {proposalId}</Trans>
                ) : voteOption === VoteOption.For ? (
                  <Trans>Vote for proposal {proposalId}</Trans>
                ) : (
                  <Trans>Vote to abstain on proposal {proposalId}</Trans>
                )}
              </ThemedText.DeprecatedMediumHeader>
            </ButtonPrimary>
          </AutoColumn> */}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOnDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <CustomLightSpinner src={Circle} alt="loader" size="90px" />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify="center">
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedLargeHeader>
                <Trans>Submitting vote</Trans>
              </ThemedText.DeprecatedLargeHeader>
            </AutoColumn>
            <ThemedText.DeprecatedSubHeader>
              <Trans>Confirm this transaction in your wallet</Trans>
            </ThemedText.DeprecatedSubHeader>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
      {hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOnDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.accent1} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify="center">
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedLargeHeader>
                <Trans>Transaction Submitted</Trans>
              </ThemedText.DeprecatedLargeHeader>
            </AutoColumn>
            {chainId && (
              <ExternalLink
                href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
                style={{ marginLeft: '4px' }}
              >
                <ThemedText.DeprecatedSubHeader>
                  <Trans>View transaction on Explorer</Trans>
                </ThemedText.DeprecatedSubHeader>
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
