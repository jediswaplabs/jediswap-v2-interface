import { Trans } from '@lingui/macro'
import styled from 'styled-components'

import { ExternalLink, ThemedText } from 'theme/components'

const StyledLink = styled(ExternalLink)`
  font-weight: 535;
  color: ${({ theme }) => theme.neutral2};
`
const Notice = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.notice};
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: DM Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`

const WalletInfo = styled(Notice)`
  color: ${({ theme }) => theme.jediBlue};
`

const LAST_UPDATED_DATE = '6.7.23'

export default function PrivacyPolicyNotice() {
  return (
    <div>
      <Notice>New to Starknet?</Notice>
      <StyledLink href="https://docs.jediswap.xyz/how-to-use-jediswap/how-to-set-up-a-starknet-wallet">
        <WalletInfo>Learn more about wallets</WalletInfo>
      </StyledLink>
    </div>
  )
}
