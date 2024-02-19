import { Trans } from '@lingui/macro'
import { useAccountDetails } from 'hooks/starknet-react'
import styled from 'styled-components'

import { AutoColumn } from 'components/Column'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { ThemedText, ExternalLink } from 'theme/components'
import ExternalLinkIcon from '../../assets/images/ExternalLinkIcon.png'
import { Link } from 'react-router-dom'
import { MEDIA_WIDTHS } from 'theme'

const LinkRow = styled(Link)`
  padding: 16px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.surface3};
  text-decoration: none !important;

  * {
    color: ${({ theme }) => theme.neutral1};
    text-decoration: none !important;
  }

  :hover {
    border: 1px solid ${({ theme }) => theme.surface3};

    text-decoration: none;
    * {
      text-decoration: none !important;
    }
  }
`

const CTASection = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  opacity: 0.8;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    grid-template-columns: auto;
    grid-template-rows: auto;
  `};
`

const CTA = styled(ExternalLink)`
  padding: 16px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.surface3};

  * {
    color: ${({ theme }) => theme.neutral1};
    text-decoration: none !important;
  }

  :hover {
    border: 1px solid ${({ theme }) => theme.surface3};

    text-decoration: none;
    * {
      text-decoration: none !important;
    }
  }
`

const HeaderText = styled(ThemedText.DeprecatedLabel)`
  align-items: center;
  text-align: center;
  display: flex;
  font-size: 16px;
  font-weight: 535 !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    font-size: 16px;
  `};
`

const ResponsiveColumn = styled(AutoColumn)`
  grid-template-columns: 1fr;
  width: 100%;
  gap: 8px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    gap: 8px;
  `};
  justify-content: space-between;
`

export default function CTACards() {
  return (
    <CTASection>
      <LinkRow to={'/migrate/v2'}>
        <ResponsiveColumn>
          <HeaderText>
            <Trans>Migrate V1 Liquidity</Trans> ↗
          </HeaderText>
        </ResponsiveColumn>
      </LinkRow>
      <CTA data-testid="cta-infolink" href={'pools'}>
        <ResponsiveColumn>
          <HeaderText style={{ alignSelf: 'flex-start' }}>
            <Trans>Checkout Top pools</Trans> ↗
          </HeaderText>
        </ResponsiveColumn>
      </CTA>
    </CTASection>
  )
}
