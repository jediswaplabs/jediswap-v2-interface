import { Trans } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'
import { PositionDetails } from 'types/position'

import PositionListItem from 'components/PositionListItem'
import { FlattenedPositions } from 'hooks/useV3Positions'

const Header = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.5fr 0.5fr 1fr;
  grid-template-areas: 'MyPositions Liqidity Fee Toggle';
  gap: 12px;
  padding: 16px;
  text-align: right;
  background: rgba(255, 255, 255, 0.2);
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    grid-template-areas: 'MyPositions MyPositions Toggle Toggle';
  }
`

const HeaderMyPositionCell = styled.div`
  text-align: left;
  grid-area: MyPositions;
`
const HeaderLiquidityCell = styled.div`
  grid-area: Liqidity;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`
const HeaderFeeCell = styled.div`
  grid-area: Fee;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`
const HeaderToggleLabelCell = styled.div`
  grid-area: Toggle;
`

const ToggleWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToggleLabel = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.jediBlue};
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  margin-left: auto;
`
const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.divider};
`

type PositionListProps = React.PropsWithChildren<{
  positions: FlattenedPositions[]
  setUserHideClosedPositions: any
  userHideClosedPositions: boolean
}>

export default function PositionList({
  positions,
  setUserHideClosedPositions,
  userHideClosedPositions,
}: PositionListProps) {
  return (
    <>
      <Header>
        <HeaderMyPositionCell>
          <Trans>My positions</Trans>
          {positions && ` (${positions.length})`}
        </HeaderMyPositionCell>
        <HeaderToggleLabelCell>
          <ToggleLabel
            id="desktop-hide-closed-positions"
            onClick={() => {
              setUserHideClosedPositions(!userHideClosedPositions)
            }}
          >
            {userHideClosedPositions ? <Trans>Show closed positions</Trans> : <Trans>Hide inactive positions</Trans>}
          </ToggleLabel>
        </HeaderToggleLabelCell>
      </Header>

      {positions.map((p, index) => (
        <>
          <PositionListItem key={p.tokenId.toString()} {...p} />
          {positions.length !== index + 1 ? <Divider /> : null}
        </>
      ))}
    </>
  )
}
