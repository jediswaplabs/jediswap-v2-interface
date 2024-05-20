import { Trans } from '@lingui/macro'
import { useAccountDetails } from "hooks/starknet-react"
import { useV3PositionsFromTokenId } from "hooks/useV3Positions"
import { useMemo } from "react"
import { useUserHideClosedPositions } from "state/user/hooks"
import { FlattenedPositions } from 'hooks/useV3Positions'
import styled, { css, useTheme } from 'styled-components'
import { ButtonPrimary, ButtonText } from "components/Button"
import { PositionsLoadingPlaceholder } from "."
import { ThemedText } from 'theme/components'
import { Inbox } from 'react-feather'
import PositionList from 'components/PositionList'

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  min-height: 25vh;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 0px 52px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding: 0px 52px;
  }
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`


export function PositionDetails(props: any) {
  const { address } = useAccountDetails()
  const { tokenIds, showConnectAWallet, toggleWalletDrawer, token0, token1, fee } = props
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
  const { positions, loading: positionsLoading } = useV3PositionsFromTokenId(tokenIds, address)
  let filteredPositions = positions
  if (token0 && token1) {
    filteredPositions = positions?.filter(pos => {
      //@ts-ignore
      if (pos?.token0.toString(16) === token0.slice(2) && pos?.token1.toString(16) === token1.slice(2) && pos?.fee === fee) {
        return true
      }
      //@ts-ignore
      if (pos?.token0.toString(16) === token1.slice(2) && pos?.token1.toString(16) === token0.slice(2) && pos?.fee === fee) {
        return true
      }
      return false
    })
  }
  const theme = useTheme()
  const [openPositions, closedPositions] = filteredPositions?.reduce<[FlattenedPositions[], FlattenedPositions[]]>(
    (acc, p) => {
      acc[!parseInt(p.liquidity.toString()) ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const userSelectedPositionSet = useMemo(
    () => [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)],
    [closedPositions, openPositions, userHideClosedPositions]
  )

  return (
    <>
      <>
        {positionsLoading ? (
          <PositionsLoadingPlaceholder />
        ) : userSelectedPositionSet && userSelectedPositionSet.length > 0 ? (
          <PositionList
            positions={userSelectedPositionSet}
            setUserHideClosedPositions={setUserHideClosedPositions}
            userHideClosedPositions={userHideClosedPositions}
          />
        ) : (
          <ErrorContainer>
            <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
              <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
              <div>
                <Trans>Your active liquidity positions will appear here.</Trans>
              </div>
            </ThemedText.BodyPrimary>
            {!showConnectAWallet && closedPositions.length > 0 && (
              <ButtonText
                style={{ marginTop: '.5rem' }}
                onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}
              >
                <Trans>Show closed positions</Trans>
              </ButtonText>
            )}
            {showConnectAWallet && (
              <ButtonPrimary
                style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px', width: 'fit-content' }}
                onClick={toggleWalletDrawer}
              >
                <Trans>Connect wallet</Trans>
              </ButtonPrimary>
            )}
          </ErrorContainer>
        )}
      </>
      {/* {userSelectedPositionSet.length ? null : <CTACards />} */}
    </>
  )
}