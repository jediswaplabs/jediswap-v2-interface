import { Trans } from '@lingui/macro'
import { PageWrapper } from 'components/swap/styled'
import styled from 'styled-components'
import { CopyHelper } from 'theme/components'
import { PanelTopLight } from './Panel'
import { useAccountDetails } from 'hooks/starknet-react'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary, ButtonSize } from 'components/Button'
import { shortenAddress } from 'utils'

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

export function Referral() {
  const { account } = useAccountDetails()
  return (
    <PageWrapper>
      <ReferralWrapper>
        <div className="page-head">Referral</div>
        <div className="page-desc">
          Earn reward points by sharing your referral code with your friends.
          <br />
          For more information, please read the <a href="/#">referral program details.</a>
        </div>

        {!account ? <ConnectWalletBox /> : <CopyReferralCodeBox userReferralCode={account.address} />}
      </ReferralWrapper>
    </PageWrapper>
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
            {shortenAddress(userReferralCode)}
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

const ConnectWalletBox: React.FC<{}> = () => {
  const toggleWalletDrawer = useToggleAccountDrawer()

  return (
    <PanelTopLight className={''} id="referral-page">
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
      <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
        <Trans>Connect wallet</Trans>
      </ButtonPrimary>
    </PanelTopLight>
  )
}
