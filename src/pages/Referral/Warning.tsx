import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'

export const UK_BANNER_HEIGHT = 65
export const UK_BANNER_HEIGHT_MD = 113
export const UK_BANNER_HEIGHT_SM = 137

export type bannerType = 'warning' | 'error' | 'success'

const BannerWrapper = styled.div<{ type: bannerType }>`
  position: fixed;
  display: flex;
  background-color: ${({ type }) => (type === 'error' ? '#ff3257' : type === 'warning' ? '#FFC700' : '#34A229')};
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

const BannerTextWrapper = styled(ThemedText.BodySecondary)<{ type: bannerType }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ type }) => (type === 'warning' ? '#000000' : '#ffffff')};
  width: 100%;
  text-align: center;
  line-height: 16px;
  align-items: center;
  display: flex;
  justify-content: center;

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

export function WarningBanner({
  type,
  content,
  onClose,
}: {
  type: bannerType
  content: JSX.Element
  onClose?: () => void
}) {
  return (
    <BannerWrapper type={type}>
      <BannerTextWrapper lineHeight="24px" type={type}>
        {content}
        {onClose && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClose}
            style={{ cursor: 'pointer', marginLeft: '12px' }}
          >
            <path
              d="M6.9999 8.04677L1.65282 13.3905C1.51617 13.5301 1.32717 13.6061 1.13188 13.5996C0.938176 13.5979 0.752882 13.52 0.616092 13.383C0.479299 13.2458 0.401986 13.0604 0.400705 12.8668C0.399421 12.6732 0.47445 12.4867 0.609534 12.3479L5.95661 7.00411L0.609534 1.66036C0.469889 1.52379 0.393862 1.33491 0.400278 1.13974C0.395856 0.944582 0.471455 0.755972 0.609676 0.617844C0.747898 0.479715 0.93661 0.404156 1.1319 0.408575C1.32717 0.40216 1.51616 0.478139 1.65284 0.617701L6.99991 5.96146L12.347 0.617701C12.4845 0.47857 12.6718 0.400167 12.8675 0.400025C13.063 0.399882 13.2506 0.478143 13.3881 0.617132C13.5257 0.756121 13.6018 0.94429 13.5995 1.13972C13.6059 1.33488 13.5299 1.52374 13.3903 1.66034L8.0432 7.00409L13.3903 12.3478C13.5664 12.5362 13.6315 12.8024 13.5619 13.0506C13.4924 13.2987 13.2984 13.4925 13.0502 13.562C12.8019 13.6315 12.5354 13.5665 12.347 13.3905L6.9999 8.04677Z"
              fill={type === 'warning' ? '#000000' : '#ffffff'}
            />
          </svg>
        )}
      </BannerTextWrapper>
    </BannerWrapper>
  )
}
