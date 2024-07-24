import { transparentize } from 'polished'
import { ReactNode } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { css } from 'styled-components'

import { Z_INDEX } from 'theme/zIndex'
import { AutoColumn } from '../Column'

export const PageWrapper = styled.div`
  padding: 0px 8px 0px;
  max-width: 480px;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

// Mostly copied from `AppBody` but it was getting too hard to maintain backwards compatibility.
const VaultWrapperOuter = styled.main`
  width: 466px;
  position: relative;
  z-index: ${Z_INDEX.default};
  transition: transform 250ms ease;
  border-radius: 8px;
  height: fit-content;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    width: 100%;
  }
`

const VaultWrapperInner = styled.div`
  border-radius: 8px;
  z-index: -1;
  padding: 20px;
  position: relative;

  backdrop-filter: blur(38px);
  background-color: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 30.021px 43.107px -27.712px rgba(255, 255, 255, 0.5) inset, 0px 5.388px 8.467px -3.079px #fff inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset, 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset;
`

export const StyledButton = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: normal;
  cursor: pointer;
  font-size: 20px;
  font-weight: 750;
  padding: 0px 5px 20px 5px;
`

export const ActiveStyledButton = styled(StyledButton)`
  color: #50d5ff;
  border-bottom: 2px solid #50d5ff;
`

export const FullDivider = styled.hr`
  width: 100%;
  position: absolute;
  left: 0;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`

export const VaultWrapper = (props: React.ComponentProps<typeof VaultWrapperOuter>) => (
  <VaultWrapperOuter {...props}>
    <VaultWrapperInner>{props.children}</VaultWrapperInner>
  </VaultWrapperOuter>
)

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  border-radius: 4px;
  height: 35px;
  width: 35px;
  position: relative;
  margin: -14px auto;
  margin-bottom: -17px;
  background-color: ${({ theme }) => theme.surface4};
  border-color: ${({ theme }) => theme.surface1};
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(38.48860168457031px);

  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const VaultCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.critical)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.critical};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 535;
  }
`

const VaultCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.critical)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function VaultCallbackError({ error }: { error: ReactNode }) {
  return (
    <VaultCallbackErrorInner>
      <VaultCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </VaultCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </VaultCallbackErrorInner>
  )
}

export const VaultShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.accent1)};
  color: ${({ theme }) => theme.accent1};
  padding: 12px;
  border-radius: 12px;
  margin-top: 8px;
`
