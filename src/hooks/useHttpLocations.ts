import uriToHttp from 'lib/utils/uriToHttp'
import { useMemo } from 'react'

export default function useHttpLocations(uri: string | undefined): string[] {
  return useMemo(() => {
    return uri ? uriToHttp(uri) : []
  }, [uri])
}
