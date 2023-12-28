import { useMemo } from 'react'
import { validateAndParseAddress } from 'starknet'

export function useAddressNormalizer(addr: string | null | undefined): string | null {
  if (addr && typeof addr === 'string') { return validateAndParseAddress(addr) }
  return null
}
