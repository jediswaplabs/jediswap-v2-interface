import { useWeb3React } from '@web3-react/core'
import { InjectedConnector , Connector} from '@starknet-react/core';
import { WebWalletConnector } from '@argent/starknet-react-webwallet-connector';
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import Loader from 'components/Icons/LoadingSpinner'
import { ActivationStatus, useActivationState } from 'connection/activate'
import { useConnectors } from 'hooks/starknet-react'
import styled from 'styled-components'
// import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'


const OptionCardLeft = styled.div`
  ${flexColumnNoWrap};
  flex-direction: row;
  align-items: center;
  display: block;
`
const InfoCard = styled.button<{ active?: boolean }>`
  padding: 2rem;
  outline: none;
  border: 1px solid;
  border-radius: 8px;
  width: 100% !important;
`
const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
  background: unset;
`

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  margin-top: 0;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  border: ${(theme) => `1px solid ${theme.theme.jediBlue}`};
  border-radius: 8px;
  &:hover {
    cursor: pointer;
    border: ${(theme) => `1px solid ${theme.theme.jediWhite}`};
`

const GreenCircle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.signalGreen};
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.signalGreen};
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  color: ${({ theme }) => theme.notice};
  font-size: 1rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
`

const SubHeader = styled.div`
  color: ${({ theme }) => theme.notice};
  font-size: 12px;
  text-align: left;
  font-family: 'DM Sans', sans-serif;
`

const IconWrapper = styled.div<{ size?: number | null }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
`

const Wrapper = styled.div<{ disabled: boolean }>`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  width: 100%;
`

interface OptionProps {
  connector?: Connector
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: string
  active?: boolean
  id: string
}
export default function OptionV2({
  connector,
  link = null,
  clickable = true,
  size,
  onClick = undefined,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id,
}: OptionProps) {
  const { activationState, tryActivation } = useActivationState()
  const toggleAccountDrawer = useToggleAccountDrawer()
  const { chainId } = useWeb3React()
  const { connect } = useConnectors()
  // const activate = () => tryActivation(connection, toggleAccountDrawer, chainId)

  const isSomeOptionPending = activationState.status === ActivationStatus.PENDING
  const isCurrentOptionPending = false
  // const isDarkMode = useIsDarkMode()

  return (
    <Wrapper disabled={isSomeOptionPending}>
      {/* <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.WALLET_SELECTED}
        properties={{ wallet_type: connection.getName() }}
        element={InterfaceElementName.WALLET_TYPE_OPTION}
      > */}
      <OptionCardClickable
        disabled={isSomeOptionPending}
        onClick={() => connect({ connector })}
        selected={isCurrentOptionPending}
        // data-testid={`wallet-option-${connection.type}`}
      >
       <OptionCardLeft>
            <HeaderText color={color}>
              {active ? (
                <CircleWrapper>
                  <GreenCircle>
                    <div />
                  </GreenCircle>
                </CircleWrapper>
              ) : (
                ''
              )}
              {header}
            </HeaderText>
            {subheader && <SubHeader>{subheader}</SubHeader>}
          </OptionCardLeft>
          <IconWrapper size={size}>
            <img src={icon} alt={'Icon'} />
          </IconWrapper>
        </OptionCardClickable>
      {/* </TraceEvent> */}
    </Wrapper>
  )
}
