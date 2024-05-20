import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'

export const UK_BANNER_HEIGHT = 65
export const UK_BANNER_HEIGHT_MD = 113
export const UK_BANNER_HEIGHT_SM = 137

const BannerWrapper = styled.div`
  position: fixed;
  display: flex;
  background-color: #ff3257;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};
  z-index: ${Z_INDEX.fixed};
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  top: ${({ theme }) => theme.navHeight}px;
  left: 0;
  right: 0;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    flex-direction: column;
  }
`

const BannerTextWrapper = styled(ThemedText.BodySecondary)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  width: 100%;
  text-align: center;
  line-height: 16px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    @supports (-webkit-line-clamp: 2) {
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    @supports (-webkit-line-clamp: 3) {
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
`

export const bannerText = 'Warning: Please switch to Starknet Mainnet to use Referral'

export function ReferralWarning() {
  return (
    <BannerWrapper>
      <BannerTextWrapper lineHeight="24px">{bannerText}</BannerTextWrapper>
    </BannerWrapper>
  )
}
