import React, { FunctionComponent, useEffect, useState } from 'react'
import { Connector } from 'starknetkit'
import { useMedia } from 'react-use'
import { isInArgentMobileAppBrowser } from 'starknetkit/argentMobile'
import { getConnectorIcon, getConnectorName } from 'context/StarknetProvider'
import { useAccountDetails } from 'hooks/starknet-react'
import { useConnect } from '@starknet-react/core'
import Modal from 'components/Modal'
import styled from 'styled-components'
import { X } from 'react-feather'

// Styled components
const Menu = styled.div`
  background-color: #fff;
  align-self: center;
  padding: 35px;
  display: flex;
  flex-direction: column;
`

const MenuClose = styled.button`
  position: absolute;
  top: 20px;
  right: 16px;
  width: 22px;
  stroke: black;
  cursor: pointer;
  transition: 0.3s;
  background-color: transparent;
  border: none;

  &:hover {
    stroke: rgb(124, 124, 124);
  }
`

const ModalContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 12px;
`

const Wallet = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.375rem;
  --tw-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  --tw-shadow-colored: 0px 2px 12px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  cursor: pointer;
`

const WalletName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgb(31 41 55);
`

const Legend = styled.span`
  color: #6d696a;
  font-style: normal;
  font-weight: 500;
`

const WalletIcon = styled.img`
  width: 32px;
  height: 32px;
`

const ModalTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  text-align: center;
  color: #000;
`

const ModalTitleSpan = styled.span`
  color: #6d696a;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`

const ModalTitleP = styled.p`
  font-size: 19px;
  font-weight: bold;
  margin-bottom: 12px;
`

const CloseIcon = styled(X)<{ onClick: () => void }>`
  color: #6d696a;
  cursor: pointer;
`

type WalletModalProps = {
  closeModal: () => void
  open: boolean
}

const WalletConnect = ({ closeModal, open }: WalletModalProps) => {
  const { connectAsync, connectors } = useConnect()

  const connectWallet = async (connector: Connector) => {
    await connectAsync({ connector })
    localStorage.setItem('connectedWallet', connector.id)
  }
  const [isArgentMobile, setIsArgentMobile] = useState(false)
  const connect = (connector: Connector) => {
    connectWallet(connector)
    closeModal()
  }
  const isMobile = useMedia('(max-width: 768px)')

  useEffect(() => {
    if (typeof window !== 'undefined') setIsArgentMobile(isInArgentMobileAppBrowser())
  }, [])

  const filterConnectors = (connectors: Connector[]) => {
    if (isArgentMobile) {
      return connectors.filter((connector) => connector.id === 'argentMobile')
    }
    if (!isMobile) return connectors
    return connectors.filter((connector) => connector.id !== 'argentX')
  }

  const needInstall = (connector: Connector, isAvailable: boolean) => {
    if (connector.id === 'braavos' && isMobile) {
      return false
    }
    return !isAvailable
  }

  const tryConnect = (connector: Connector, isAvailable: boolean) => {
    if (isAvailable) {
      connect(connector)
    }
  }

  return (
    <Modal isOpen={open} onDismiss={closeModal} noBg>
      <Menu>
        <MenuClose>
          <CloseIcon onClick={closeModal} />
        </MenuClose>
        <ModalContent>
          <ModalTitle>
            <ModalTitleSpan>Connect to</ModalTitleSpan>
            <ModalTitleP>Jediswap</ModalTitleP>
          </ModalTitle>
          {filterConnectors(connectors as Connector[]).map((connector) => {
            const isAvailable = connector.available()
            return (
              <Wallet key={connector.id} onClick={() => tryConnect(connector, isAvailable)}>
                <WalletIcon src={getConnectorIcon(connector.id)} />
                <WalletName>
                  <p>
                    {needInstall(connector, isAvailable) ? 'Install ' : ''}
                    {connector.id === 'argentMobile' && isMobile ? 'Argent' : getConnectorName(connector.id)}
                  </p>
                  {connector.id === 'argentWebWallet' ? <Legend>Powered by Argent</Legend> : null}
                </WalletName>
                <div></div>
              </Wallet>
            )
          })}
        </ModalContent>
      </Menu>
    </Modal>
  )
}

export default WalletConnect
