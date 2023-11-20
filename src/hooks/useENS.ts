import { useMemo } from 'react'

import { isAddress } from '../utils'
import useENSAddress from './useENSAddress'
import useENSName from './useENSName'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export default function useENS(nameOrAddress?: string | null) {
  const validated = isAddress(nameOrAddress)
  const reverseLookup = useENSName(validated ? validated : undefined)
  const lookup = useENSAddress(nameOrAddress)

  return { address: '', loading: false, name: '' }
}
