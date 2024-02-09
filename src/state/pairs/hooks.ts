import { validateAndParseAddress } from 'starknet'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import { AppState } from 'state/reducer'

export function useAllPairs(): string[] {
  const allPairs = useSelector<AppState, AppState['pairs']['allPairs']>((state) => state.pairs.allPairs)

  return useMemo(() => allPairs.map((pairAddress) => validateAndParseAddress(pairAddress)), [allPairs])
}
