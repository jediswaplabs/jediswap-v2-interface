import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import { getConnection } from 'connection'
import { didUserReject } from 'connection/utils'
import { CHAIN_IDS_TO_NAMES, isSupportedChain } from 'constants/chains'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addPopup, PopupType } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'

import { useSwitchChain } from './useSwitchChain'

export default function useSelectChain() {
  const dispatch = useAppDispatch()
  const { connector } = useAccountDetails()
  const switchChain = useSwitchChain()
  const [searchParams, setSearchParams] = useSearchParams()

  return undefined
}
