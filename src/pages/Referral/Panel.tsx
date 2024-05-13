import { Box as RebassBox } from 'rebass'
import styled, { css } from 'styled-components'

const panelPseudo = css`
  :after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
  }

  @media only screen and (min-width: 40em) {
    :after {
      content: unset;
    }
  }
`

const Panel = styled(RebassBox)`
  position: relative;
  background-color: 'rgba(0,0,0,0.1)';
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(196, 196, 196, 0.01);
  /* box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset; */

  :hover {
    cursor: 'pointer';
    border: '#565A69';
  }
`
export const PanelTopLight = styled(Panel)`
  /* box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset, 0px 5.388px 8.467px -3.079px #fff inset,
    0px 30.021px 43.107px -27.712px rgba(255, 255, 255, 0.5) inset; */
  border: 1px solid #a0a0a066;
  background: #ffffff0d;
`
export default Panel

// const Panel = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-start;
//   border-radius: 12px;
//   background-color: ${({ theme }) => theme.advancedBG};
//   padding: 1.25rem;
//   box-sizing: border-box;
//   box-shadow: 0 1.1px 2.8px -9px rgba(0, 0, 0, 0.008), 0 2.7px 6.7px -9px rgba(0, 0, 0, 0.012),
//     0 5px 12.6px -9px rgba(0, 0, 0, 0.015), 0 8.9px 22.6px -9px rgba(0, 0, 0, 0.018),
//     0 16.7px 42.2px -9px rgba(0, 0, 0, 0.022), 0 40px 101px -9px rgba(0, 0, 0, 0.03);
// `
