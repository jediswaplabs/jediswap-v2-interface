import { NEVER_RELOAD, useMainnetSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { safeNamehash } from 'utils/safeNamehash'

import isZero from '../utils/isZero'
// import { useENSRegistrarContract, useENSResolverContract } from './useContract'
import useDebounce from './useDebounce'

/**
 * Does a lookup for an ENS name to find its address.
 */
export default function useENSAddress(ensName?: string | null) {
  const debouncedName = useDebounce(ensName, 200)
  const ensNodeArgument = useMemo(() => [debouncedName ? safeNamehash(debouncedName) : undefined], [debouncedName])
  // const registrarContract = useENSRegistrarContract()
  // const resolverAddress = useMainnetSingleCallResult(registrarContract, 'resolver', ensNodeArgument, NEVER_RELOAD)
  // const resolverAddressResult = resolverAddress.result?.[0]
  // const resolverContract = useENSResolverContract(
  //   resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined
  // )
  // const addr = useMainnetSingleCallResult(resolverContract, 'addr', ensNodeArgument, NEVER_RELOAD)

  const changed = debouncedName !== ensName
  return {}
}
