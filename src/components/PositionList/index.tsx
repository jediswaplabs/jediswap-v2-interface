import { Trans } from '@lingui/macro'
import PositionListItem from 'components/PositionListItem'
import React from 'react'
import styled from 'styled-components'
import { MEDIA_WIDTHS } from 'theme'
import { PositionDetails } from 'types/position'

const DesktopHeader = styled.div`
  display: none;
  font-size: 14px;
  padding: 16px;
  font-family: 'DM Sans';
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.2);
  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    display: grid;
    gap: 1em;
    grid-template-columns: 1.5fr 0.5fr 0.5fr 1fr;
    & > div:last-child {
      text-align: right;
      margin-right: 12px;
    }
  }
`

const MobileHeader = styled.div`
  font-weight: medium;
  padding: 8px;
  font-weight: 535;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    display: none;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.deprecated_upToExtraSmall}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
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
  positions: PositionDetails[]
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
      <DesktopHeader>
        <div>
          <Trans>My positions</Trans>
          {positions && ' (' + positions.length + ')'}
        </div>
        <div>
          <Trans>Liquidity</Trans>
        </div>
        <div>
          <Trans>Fees earned</Trans>
        </div>

        <ToggleLabel
          id="desktop-hide-closed-positions"
          onClick={() => {
            setUserHideClosedPositions(!userHideClosedPositions)
          }}
        >
          {userHideClosedPositions ? <Trans>Show closed positions</Trans> : <Trans>Hide closed positions</Trans>}
        </ToggleLabel>
      </DesktopHeader>
      <MobileHeader>
        <div>
          <Trans>My positions</Trans>
          {positions && ' (' + positions.length + ')'}
        </div>
        <ToggleWrap>
          <ToggleLabel
            onClick={() => {
              setUserHideClosedPositions(!userHideClosedPositions)
            }}
          >
            {userHideClosedPositions ? <Trans>Show closed positions</Trans> : <Trans>Hide closed positions</Trans>}
          </ToggleLabel>
        </ToggleWrap>
      </MobileHeader>
      {positions.map((p, index) => (
        <>
          <PositionListItem key={p.tokenId.toString()} {...p} />
          {positions.length !== index + 1 ? <Divider /> : null}
        </>
      ))}
    </>
  )
}
