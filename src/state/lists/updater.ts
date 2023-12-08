import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { useAccountDetails } from 'hooks/starknet-react'
import { DEFAULT_LIST_OF_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import TokenSafetyLookupTable from 'constants/tokenSafetyLookup'
import { useStateRehydrated } from 'hooks/useStateRehydrated'
import useInterval from 'lib/hooks/useInterval'
import ms from 'ms'
import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useAllLists } from 'state/lists/hooks'

import { useFetchListCallback } from '../../hooks/useFetchListCallback'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { acceptListUpdate } from './actions'
import { shouldAcceptVersionUpdate } from './utils'
import { useProvider } from '@starknet-react/core'

export default function Updater(): null {
  const { provider } = useProvider()
  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()

  // get all loaded lists, and the active urls
  const lists = useAllLists()
  const listsState = useAppSelector((state) => state.lists)
  const rehydrated = useStateRehydrated()

  useEffect(() => {
    if (rehydrated) TokenSafetyLookupTable.update(listsState)
  }, [listsState, rehydrated])

  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    DEFAULT_LIST_OF_LISTS.forEach((url) => {
      // Skip validation on unsupported lists
      // const isUnsupportedList = false;
      fetchList(url).catch((error) => console.debug('interval list fetching error', error))
    })
  }, [isWindowVisible])

  // fetch all lists every 10 minutes, but only after we initialize provider
  useInterval(fetchAllListsCallback, provider ? ms(`10m`) : null)

  useEffect(() => {
    if (!rehydrated) return // loaded lists will not be available until state is rehydrated

    // whenever a list is not loaded and not loading, try again to load it
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        // fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
    UNSUPPORTED_LIST_URLS.forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
        // fetchList(listUrl, /* isUnsupportedList= */ true).catch((error) =>
        //   console.debug('list added fetching error', error)
        // )
      }
    })
  }, [dispatch, lists, rehydrated])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version)
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR: {
            if (shouldAcceptVersionUpdate(listUrl, list.current, list.pendingUpdate, bump)) {
              dispatch(acceptListUpdate(listUrl))
            }
            break
          }
          // update any active or inactive lists
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate(listUrl))
        }
      }
    })
  }, [dispatch, lists])

  return null
}
