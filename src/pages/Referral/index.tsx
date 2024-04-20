import { Trans, t } from '@lingui/macro'
import { useContractWrite } from '@starknet-react/core'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary, ButtonSize } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { LoadingRows } from 'components/Loader/styled'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { PageWrapper } from 'components/swap/styled'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { useAccountDetails } from 'hooks/starknet-react'
import { useReferralContract } from 'hooks/useContractV2'
import useDebounce from 'hooks/useDebounce'
import { useCodeOwner, useUserCode } from 'hooks/useReferral'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Call, CallData, cairo } from 'starknet'
import styled from 'styled-components'
import { CopyHelper } from 'theme/components'
import { PanelTopLight } from './Panel'

const ReferralWrapper = styled.div`
  .page-head {
    font-family: Avenir LT Std;
    font-size: 24px;
    font-weight: 750;
    line-height: 24px;
    text-align: left;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .page-desc {
    font-family: DM Sans;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    color: #d9d9d9;
    margin-bottom: 2rem;

    a {
      font-family: DM Sans;
      font-size: 14px;
      font-weight: 700;
      line-height: 20px;
      text-align: left;
      color: #2aaafe;
      text-decoration: none;
    }
  }
  .heading {
    font-family: DM Sans;
    font-size: 20px;
    font-weight: 700;
    line-height: 20px;
    color: #f2f2f2;
    width: fit;
    margin: 1.5rem auto 0;
  }

  .description {
    font-family: DM Sans;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    text-align: center;
    margin: 1.6rem auto;
    color: #f2f2f2;
  }
`

const SearchInput = styled.input`
  padding: 20px;
  height: 57px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.surface4};
  outline: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.neutral1};

  border: 1px solid ${({ theme }) => theme.surface3};
  -webkit-appearance: none;

  color: ${({ theme }) => theme.jediWhite};

  font-size: 20px;
  font-weight: 400;
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);

  ::placeholder {
    color: ${({ theme }) => theme.neutral3};
    font-size: 20px;
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.surface3};
    background-color: ${({ theme }) => theme.surface2};
    outline: none;
  }
`
const CodeBox = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  padding: 18px 0;
  border-radius: 8px;
  box-shadow: 0px 0.77px 30.79px 0px #e3deff33 inset, 0px 3.08px 13.86px 0px #9a92d24d inset,
    0px 75.44px 76.98px -36.95px #caacff4d inset, 0px -63.12px 52.34px -49.27px #6044904d inset;
  margin-top: 32px;
`
const CopyText = styled(CopyHelper).attrs({
  iconPosition: 'right',
})``

const AccountNamesWrapper = styled.div`
  font-family: DM Sans;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: fit-content;
  flex-direction: column;
  justify-content: center;
  margin: auto;
`

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div style={{ height: 350 }} />
    </LoadingRows>
  )
}

export function Referral() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 500)
  const { data: codeOwner, error: codeOwnerError, isLoading: isCodeOwnerLoading } = useCodeOwner(debouncedQuery)
  const { data: userReferralCode, error: userReferralError, isLoading: isUserCodeLoading } = useUserCode()
  return (
    <PageWrapper>
      {isCodeOwnerLoading && isUserCodeLoading ? (
        <PositionsLoadingPlaceholder />
      ) : (
        <ReferralWrapper>
          <div className="page-head">Referral</div>
          <div className="page-desc">
            Earn reward points by sharing your referral code with your friends.
            <br />
            For more information, please read the <a href="/#">referral program details.</a>
          </div>

          {userReferralCode === undefined || userReferralCode === null ? (
            <CreateReferralCodeBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isCodeOwnerLoading={isCodeOwnerLoading}
              codeOwner={codeOwner}
            />
          ) : (
            <CopyReferralCodeBox userReferralCode={userReferralCode} />
          )}
        </ReferralWrapper>
      )}
    </PageWrapper>
  )
}

const CreateReferralCodeBox: React.FC<{
  searchQuery: string
  setSearchQuery: (value: string) => void
  isCodeOwnerLoading: boolean
  codeOwner: boolean | undefined
}> = ({ searchQuery, setSearchQuery, codeOwner, isCodeOwnerLoading }) => {
  const connectionReady = useConnectionReady()
  const { address, account, chainId: connectedChainId } = useAccountDetails()
  const toggleWalletDrawer = useToggleAccountDrawer()
  const [createCallData, setCreateCallData] = useState<Call[]>([])
  const [txHash, setTxHash] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  const referralContract = useReferralContract()
  const handleCreate = useCallback(() => {
    if (codeOwner === undefined && searchQuery && referralContract) {
      const calldata = CallData.compile({
        _code: cairo.felt(searchQuery),
      })
      setCreateCallData([
        {
          contractAddress: referralContract.address,
          entrypoint: 'register_code',
          calldata,
        },
      ])
    }
  }, [codeOwner, searchQuery])

  const {
    writeAsync,
    data: txData,
    error,
  } = useContractWrite({
    calls: createCallData,
  })

  useEffect(() => {
    if (createCallData.length) {
      setIsModalOpen(true)
      setAttemptingTxn(true)

      writeAsync()
        .then((response) => {
          if (response?.transaction_hash) {
            setTxHash(response.transaction_hash)
          }
        })
        .catch((err) => {
          console.log(err?.message)
        })
        .finally(() => {
          setIsModalOpen(false)
          setAttemptingTxn(false)
        })
    }
  }, [createCallData])

  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    setSearchQuery(input)
  }, [])

  return (
    <PanelTopLight className={''} id="referral-page">
      <TransactionConfirmationModal
        isOpen={isModalOpen}
        reviewContent={() => {
          return <></>
        }}
        onDismiss={() => setIsModalOpen(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        pendingText={'Creating referral code...'}
      />
      <div className="heading">
        <Trans>Create Referral Code</Trans>
      </div>
      <div className="description">
        <Trans>
          Looks like you don't have a referral code to share.
          <br />
          Create one now and start earning reward points!
        </Trans>
      </div>
      {connectionReady && !account ? (
        <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
          <Trans>Connect wallet</Trans>
        </ButtonPrimary>
      ) : (
        <AutoColumn gap="16px">
          <SearchInput
            type="text"
            id="token-search-input"
            data-testid="token-search-input"
            placeholder={t`Enter a code`}
            autoComplete="off"
            value={searchQuery}
            onChange={handleInput}
          />
          {!searchQuery ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Enter a code</Trans>
            </ButtonPrimary>
          ) : isCodeOwnerLoading ? (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Checking...</Trans>
            </ButtonPrimary>
          ) : codeOwner === undefined ? (
            <ButtonPrimary size={ButtonSize.large} onClick={handleCreate}>
              <Trans>Create</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary size={ButtonSize.large} disabled>
              <Trans>Not Available</Trans>
            </ButtonPrimary>
          )}
        </AutoColumn>
      )}
    </PanelTopLight>
  )
}

const CopyReferralCodeBox: React.FC<{ userReferralCode: string }> = ({ userReferralCode }) => {
  return (
    <PanelTopLight className={''} id="referral-page-copy">
      <div className="heading">
        <Trans>Your Referral Code</Trans>
      </div>

      <CodeBox>
        <AccountNamesWrapper>
          <CopyText toCopy={`https://${window.location.hostname}/#/swap?referralCode=${userReferralCode}`}>
            {userReferralCode}
          </CopyText>
        </AccountNamesWrapper>
      </CodeBox>

      <div className="description">
        <Trans>
          Copy and share the link with your friends <br /> You earn reward points for each successful account
        </Trans>
      </div>
    </PanelTopLight>
  )
}
