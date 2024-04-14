import styled, { css, useTheme } from 'styled-components'
import { Box as RebassBox } from 'rebass'

import { AutoColumn } from "components/Column";
import { RowBetween } from "components/Row";
import { formattedNum, formattedPercent } from "utils/dashboard";

const PageWrapper = styled(AutoColumn)`
  padding: 0px 8px 0px;
  max-width: 1020px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 20px;
  }
`

const PanelWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
`
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

const Panel = styled(RebassBox) <{
  hover?: boolean
  background?: boolean
  area?: boolean
  grouped?: boolean
  rounded?: boolean
  last?: boolean
}>`
  position: relative;
  // background-color: ${({ theme }) => theme.advancedBG};
  border-radius: 8px;
  padding: 1.25rem;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset;

  :hover {
    cursor: ${({ hover }) => hover && 'pointer'};
    border: ${({ hover, theme }) => hover && '1px solid' + theme.bg5};
  }

  ${(props) => props.background && `background-color: ${props.theme.advancedBG};`}

  ${(props) => (props.area ? `grid-area: ${props.area};` : null)}

  ${(props) =>
    props.grouped &&
    css`
      @media only screen and (min-width: 40em) {
        &:first-of-type {
          border-radius: 20px 20px 0 0;
        }
        &:last-of-type {
          border-radius: 0 0 20px 20px;
        }
      }
    `}

  ${(props) =>
    props.rounded &&
    css`
      border-radius: 8px;
      @media only screen and (min-width: 40em) {
        border-radius: 10px;
      }
    `};

  ${(props) => !props.last && panelPseudo}
`
const PanelTopLight = styled(Panel)`
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.438px 76.977px -36.949px rgba(202, 172, 255, 0.3) inset,
    0px -63.121px 52.345px -49.265px rgba(96, 68, 144, 0.3) inset, 0px 5.388px 8.467px -3.079px #fff inset,
    0px 30.021px 43.107px -27.712px rgba(255, 255, 255, 0.5) inset;
`

const PageHeader = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  font-family: "Avenir LT Std";
  font-size: 24px;
  font-weight: 750;
  margin-bottom: 20px;
`

export default function PoolDetails() {
  const totalValueLockedUSD = 10
  const liquidityChangeUSD = 20
  const totalVolumeUSD = 0
  const volumeChangeUSD = 0
  const totalFeesUSD = 0
  const feesChangeUSD = 0

  return (
    <PageWrapper>
      <AutoColumn style={{ gap: '12px' }}>
        <PanelWrapper>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                {/* <TYPE.subHeader> */}
                Total Liquidity
                {/* </TYPE.subHeader> */}
              </RowBetween>
              <RowBetween align="baseline">
                {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                {formattedNum(totalValueLockedUSD, true)}
                {/* </TYPE.main> */}
                {/* <TYPE.main fontSize="1rem"> */}
                {formattedPercent(liquidityChangeUSD)}
                {/* </TYPE.main> */}
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                {/* <TYPE.subHeader> */}
                Volume (24hr)
                {/* </TYPE.subHeader> */}
                <div />
              </RowBetween>
              <RowBetween align="baseline">
                {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                {formattedNum(totalVolumeUSD, true)}
                {/* </TYPE.main> */}
                {/* <TYPE.main fontSize="1rem"> */}
                {formattedPercent(volumeChangeUSD)}
                {/* </TYPE.main> */}
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
          <PanelTopLight>
            <AutoColumn gap="20px">
              <RowBetween>
                {/* <TYPE.subHeader> */}
                Total fees (24hr)
                {/* </TYPE.subHeader> */}
              </RowBetween>
              <RowBetween align="baseline">
                {/* <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}> */}
                {formattedNum(totalFeesUSD, true)}
                {/* </TYPE.main> */}
                {/* <TYPE.main fontSize="1rem"> */}
                {formattedPercent(feesChangeUSD)}
                {/* </TYPE.main> */}
              </RowBetween>
            </AutoColumn>
          </PanelTopLight>
        </PanelWrapper>
      </AutoColumn>
    </PageWrapper>
  )
}