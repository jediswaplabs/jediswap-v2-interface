import { Pool, Position } from '@harshalmaniya/jediswap-sdk-v3'
import { usePool } from 'hooks/usePools'
import { PositionDetails } from 'types/position'

import { useCurrency, useToken } from './Tokens'
import { FlattenedPositions } from './useV3Positions'
import { unwrappedToken } from 'utils/unwrappedToken'

export function useDerivedPositionInfo(positionDetails: FlattenedPositions | undefined): {
  position?: Position
  pool?: Pool
} {
  const token0 = useToken(positionDetails?.token0)
  const token1 = useToken(positionDetails?.token1)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined
  const feeAmount = positionDetails?.fee ? positionDetails.fee : undefined

  // construct pool data
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)

  let position = undefined
  if (pool && positionDetails) {
    position = new Position({
      pool,
      liquidity: positionDetails.liquidity.toString(),
      tickLower: positionDetails.tick_lower,
      tickUpper: positionDetails.tick_upper,
    })
  }
  return {
    position,
    pool: pool ?? undefined,
  }
}
