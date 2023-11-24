import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'

import { AutoColumn } from 'components/Column'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { ThemedText, ExternalLink } from 'theme/components'
import ExternalLinkIcon from '../../assets/images/ExternalLinkIcon.png'

const CTASection = styled.section`
  display: flex;
  justify-content: center;
`

const CTA = styled(ExternalLink)`
  justify-content: center;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.jediGrey};
  align-items: center;
  width: 293px;
  height: 56px;
  text-align: center;
  display: flex;
`

const HeaderText = styled(ThemedText.DeprecatedLabel)`
  align-items: center;
  color: ${({ theme }) => theme.jediBlue};
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir LT Std;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    font-size: 16px;
  `};
`

const ResponsiveColumn = styled(AutoColumn)`
  display: flex;
`

const IconWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
`

export default function CTACards() {
  const { chainId } = useWeb3React()
  const { infoLink } = getChainInfoOrDefault(chainId)

  return (
    <CTASection>
      <CTA href="https://support.uniswap.org/hc/en-us/categories/8122334631437-Providing-Liquidity-">
        <ResponsiveColumn>
          <HeaderText>Checkout Top Pools</HeaderText>
          <IconWrapper>
            <img src={ExternalLinkIcon} alt={'Icon'} />
          </IconWrapper>
        </ResponsiveColumn>
      </CTA>
    </CTASection>
  )
}
