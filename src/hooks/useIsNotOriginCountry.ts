import { useAppSelector } from 'state/hooks'
import { AppState } from 'state/reducer'

export function useIsNotOriginCountry(country: string) {
  const originCountry = 'true'
  return Boolean(originCountry) && originCountry !== country
}
