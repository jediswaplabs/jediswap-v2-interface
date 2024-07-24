import { Trans } from '@lingui/macro'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import SettingsTab from 'components/Settings'
import { ReactNode } from 'react'
import { ArrowLeft } from 'react-feather'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box } from 'rebass'
import { useAppDispatch } from 'state/hooks'
import { resetMintState } from 'state/mint/actions'
import { resetMintState as resetMintV3State } from 'state/mint/v3/actions'
import styled, { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'
import { flexRowNoWrap } from 'theme/styles'

import { RowBetween } from '../Row'

const Tabs = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const StyledLink = styled(Link)<{ flex?: string }>`
  flex: ${({ flex }) => flex ?? 'none'};
  display: flex;
  align-items: center;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    flex: none;
    margin-right: 10px;
  `};
`

const FindPoolTabsText = styled(ThemedText.SubHeaderLarge)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.neutral1};
`

export function FindPoolTabs({ origin }: { origin: string }) {
  return (
    <Tabs>
      <RowBetween style={{ padding: '8px', position: 'relative' }}>
        <Link to={origin}>
          <StyledArrowLeft />
        </Link>
        <FindPoolTabsText>
          <Trans>Import V2 pool</Trans>
        </FindPoolTabsText>
      </RowBetween>
    </Tabs>
  )
}

const AddRemoveTitleText = styled(ThemedText.SubHeaderLarge)`
  flex: 1;
  margin: auto;
  font-family: 'Avenir LT Std', sans-serif;
  font-size: 24px !important;
  font-weight: 700 !important;
`

export function AddRemoveTabs({
  adding,
  creating,
  autoSlippage,
  positionID,
  children,
}: {
  adding: boolean
  creating: boolean
  autoSlippage: Percent
  positionID?: string
  showBackLink?: boolean
  children?: ReactNode
}) {
  const { chainId } = useAccountDetails()
  const theme = useTheme()
  // reset states on back
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  // detect if back should redirect to v3 or v2 pool page
  // const poolLink = location.pathname.includes('add/v2')
  //   ? '/pools/v2'
  //   : '/pools' + (positionID ? `/${positionID.toString()}` : '')

  return (
    <Tabs>
      <RowBetween style={{ padding: '16px' }} align="center">
        <StyledLink
          to={'/'}
          onClick={(e) => {
            if (adding) {
              // not 100% sure both of these are needed
              dispatch(resetMintState())
              dispatch(resetMintV3State())
            }
            e.preventDefault()
            if (location.key === 'default') {
              navigate('/pools')
            } else {
              navigate(-1)
            }
          }}
          flex={children ? '1' : undefined}
        >
          <StyledArrowLeft stroke={theme.jediWhite} />
        </StyledLink>
        <AddRemoveTitleText textAlign={children ? 'start' : 'center'}>
          {creating ? (
            <Trans>Create a pair</Trans>
          ) : adding ? (
            <Trans>Add Liquidity</Trans>
          ) : (
            <Trans>Remove liquidity</Trans>
          )}
        </AddRemoveTitleText>
        {children && <Box style={{ marginRight: '.5rem' }}>{children}</Box>}
        <SettingsTab autoSlippage={autoSlippage} chainId={chainId} hideRoutingSettings />
      </RowBetween>
    </Tabs>
  )
}
