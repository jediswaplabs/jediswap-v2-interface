import { Trans } from '@lingui/macro'
import { PageWrapper } from 'components/swap/styled'
import styled from 'styled-components'
import { CopyHelper } from 'theme/components'
import { PanelTopLight } from './Panel'
import { useAccountDetails } from 'hooks/starknet-react'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary, ButtonSize } from 'components/Button'
import { WarningBanner } from './Warning'
import { useEffect, useState } from 'react'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { getChecksumAddress } from 'starknet'

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
  .lp-link {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;

    .button {
      width: fit-content;
      padding: 8px 24px;
      font-family: Avenir LT Std;
      font-size: 18px;
      font-weight: 750;
      line-height: 20px;
      text-align: center;
    }
  }
`
const CodeBox = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  border-radius: 8px;
  background: #d9d9d91a;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`
const CopyText = styled(CopyHelper).attrs({
  iconPosition: 'left',
})``

const AccountNamesWrapper = styled.div`
  font-family: Avenir LT Std;
  font-size: 24px;
  font-weight: 750;
  line-height: 24px;
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
  const { account, chainId } = useAccountDetails()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (chainId) {
      if (chainId === ChainId.GOERLI) setShowWarning(true)
      else setShowWarning(false)
    }
  }, [chainId])

  return (
    <PageWrapper>
      {showWarning && (
        <WarningBanner content={<>Warning: Please switch to Starknet Mainnet to use Referral</>} type="error" />
      )}
      <ReferralWrapper>
        <div className="page-head">Referral</div>
        <div className="page-desc">
          Earn reward points by sharing your referral code with your friends.
          <br />
          For more information, please read the <a href="/#">referral program details.</a>
        </div>

        {!account ? (
          <ConnectWalletBox />
        ) : (
          <CopyReferralCodeBox
            userReferralCode={getChecksumAddress(account.address)}
            isTestnet={chainId != ChainId.MAINNET}
          />
        )}
        {account && <LpLeaderboardLink />}
      </ReferralWrapper>
    </PageWrapper>
  )
}

const CopyReferralCodeBox: React.FC<{ userReferralCode: string; isTestnet: boolean }> = ({
  userReferralCode,
  isTestnet,
}) => {
  let referralLink = `https://${window.location.hostname}/#/swap?referralCode=${userReferralCode}`
  if (isTestnet) {
    referralLink = `https://${window.location.hostname}/#/swap?referralCode=${userReferralCode}&testnet=true`
  }
  return (
    <PanelTopLight className={''} id="referral-page-copy">
      <div className="heading">
        <Trans>Your Referral Code</Trans>
      </div>
      <div className="description">
        <Trans>
          Copy your referral link using the button below
          <br /> and share with others
        </Trans>
      </div>
      <CodeBox>
        <AccountNamesWrapper>
          <CopyText toCopy={referralLink}>Copy Referral Link</CopyText>
        </AccountNamesWrapper>
      </CodeBox>
    </PanelTopLight>
  )
}

const ConnectWalletBox: React.FC<{}> = () => {
  const toggleWalletDrawer = useToggleAccountDrawer()

  return (
    <PanelTopLight className={''} id="referral-page">
      <div className="heading">
        <Trans>Referral Link</Trans>
      </div>
      <div className="description">
        <Trans>Connect wallet to get your referral link</Trans>
      </div>
      <ButtonPrimary onClick={toggleWalletDrawer} size={ButtonSize.large}>
        <Trans>Connect wallet</Trans>
      </ButtonPrimary>
    </PanelTopLight>
  )
}

const LpLeaderboardLink: React.FC<{}> = () => {
  function redirectToLpLeaderboard() {}
  return (
    <PanelTopLight className="lp-link">
      <Trans>
        All your referral points can be <br />
        viewed on leaderboard page.
      </Trans>
      <ButtonPrimary size={ButtonSize.medium} onClick={redirectToLpLeaderboard} className="button">
        See Points
      </ButtonPrimary>
    </PanelTopLight>
  )
}
