import WalletConnect from 'components/WalletConnect/WalletConnect'
import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the shape of the context
interface WalletModalContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

// Create a context with default values
const WalletModalContext = createContext<WalletModalContextType>({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
})

// Define the provider props
interface WalletModalProviderProps {
  children: ReactNode
}

// Create a provider component
export const WalletModalProvider: React.FC<WalletModalProviderProps> = ({ children }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <WalletModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
      {isModalOpen && <WalletConnect closeModal={closeModal} open={isModalOpen} />}
    </WalletModalContext.Provider>
  )
}

// Custom hook to use the WalletModal context
export const useWalletModal = () => {
  return useContext(WalletModalContext)
}
