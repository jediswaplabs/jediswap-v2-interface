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
const SwapWrapperOuter = styled.main`
  position: relative;
  z-index: ${Z_INDEX.default};
  transition: transform 250ms ease;
  border-radius: 16px;
`

const SwapWrapperInner = styled.div`
  border-radius: 16px;
  z-index: -1;
  padding: 40px 32px;
  position: relative;

  backdrop-filter: blur(38px);
  background-color: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(270deg, #ef35ff, #50d5ff);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    padding: 2px;
  }
`

export const SwapWrapper = (props: React.ComponentProps<typeof SwapWrapperOuter>) => (
  <SwapWrapperOuter {...props}>
    <SwapWrapperInner>{props.children}</SwapWrapperInner>
  </SwapWrapperOuter>
)

const springDownKeyframes = `@keyframes spring-down {
  0% { transform: translateY(-80px); }
  25% { transform: translateY(4px); }
  50% { transform: translateY(-1px); }
  75% { transform: translateY(0px); }
  100% { transform: translateY(0px); }
}`

const backUpKeyframes = `@keyframes back-up {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-80px); }
}`

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

const SwapCallbackErrorInner = styled.div`
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

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.critical)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.accent1)};
  color: ${({ theme }) => theme.accent1};
  padding: 12px;
  border-radius: 12px;
  margin-top: 8px;
`
