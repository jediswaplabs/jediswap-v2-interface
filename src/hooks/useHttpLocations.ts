import contenthashToUri from 'lib/utils/contenthashToUri'
import parseENSAddress from 'lib/utils/parseENSAddress'
import uriToHttp from 'lib/utils/uriToHttp'
import { useMemo } from 'react'

// import useENSContentHash from './useENSContentHash'

export default function useHttpLocations(uri: string | undefined | null) {
  const ens = useMemo(() => (uri ? parseENSAddress(uri) : undefined), [uri])
  // const resolvedContentHash = useENSContentHash(ens?.ensName)
  return {}
}
