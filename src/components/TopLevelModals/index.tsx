// @ts-nocheck
import { useAccountDetails } from 'hooks/starknet-react'
import { UkDisclaimerModal } from 'components/NavBar/UkDisclaimerModal'

import { OffchainActivityModal } from 'components/AccountDrawer/MiniPortfolio/Activity/OffchainActivityModal'
import UniwalletModal from 'components/AccountDrawer/UniwalletModal'
import AirdropModal from 'components/AirdropModal'
import BaseAnnouncementBanner from 'components/Banner/BaseAnnouncementBanner'
import AddressClaimModal from 'components/claim/AddressClaimModal'
import ConnectedAccountBlocked from 'components/ConnectedAccountBlocked'
import DevFlagsBox from 'dev/DevFlagsBox'
import useAccountRiskCheck from 'hooks/useAccountRiskCheck'
import Bag from 'nft/components/bag/Bag'
import TransactionCompleteModal from 'nft/components/collection/TransactionCompleteModal'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { isDevelopmentEnv, isStagingEnv } from 'utils/env'

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  const { address: account } = useAccountDetails()
  useAccountRiskCheck(account)
  const accountBlocked = Boolean(blockedAccountModalOpen && account)
  const shouldShowDevFlags = isDevelopmentEnv() || isStagingEnv()

  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      <ConnectedAccountBlocked account={account} isOpen={accountBlocked} />
      <Bag />
      <UniwalletModal />
      <BaseAnnouncementBanner />
      <OffchainActivityModal />
      <TransactionCompleteModal />
      <AirdropModal />
      <UkDisclaimerModal />
      {shouldShowDevFlags && <DevFlagsBox />}
    </>
  )
}
