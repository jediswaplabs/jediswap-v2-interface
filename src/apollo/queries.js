import { apiTimeframeOptions } from 'constants/apiTimeframeOptions'
import gql from 'graphql-tag'

const TokenFields = `
  fragment TokenFields on Token {
    tokenAddress
    name
    symbol
    derivedETH
    volume
    volumeUSD
    untrackedVolumeUSD
    totalValueLocked
    totalValueLockedUSD
    txCount
    feesUSD
  }
`
const PoolFields = `
  fragment PoolFields on Pool {
    poolAddress
    token0 {
      tokenAddress
      symbol
      name
      #totalValueLocked
    }
    token1 {
      tokenAddress
      symbol
      name
      #totalValueLocked
    }
    volumeToken0
    volumeToken1
    volumeUSD
    totalValueLockedUSD
    totalValueLockedETH
    totalValueLockedToken0
    totalValueLockedToken1
    token0Price
    token1Price
    fee
  }
`
export const TOKENS_DATA = ({ tokenIds = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}"`).join(',')}]`

  let queryString = `
    ${TokenFields}
    query tokensData {
      tokensData(first: 500, where: {tokenAddressIn: ${tokenString}}) {
        token{...TokenFields}
        period
      }
    }
  `
  return gql(queryString)
}

export const HISTORICAL_POOLS_DATA = ({ tokenIds = [], periods = [] }) => {
  const tokensString = `[${tokenIds.map((token) => `"${token}",`)}]`
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`

  let queryString = `
    ${PoolFields}
    query poolsData {
      poolsData(
        first: 500, 
        where: {
          periodIn: ${periodString},
          bothTokenAddressIn: ${tokensString},
        }
      ) {
        pool {
          ...PoolFields
        }
        period
      }
    }
  `
  return gql(queryString)
}

export const HISTORICAL_GLOBAL_DATA = () => {
  const queryString = ` query jediswapFactories {
      factoriesData {
        ${apiTimeframeOptions.oneDay}
        ${apiTimeframeOptions.twoDays}
      }
    }`
  return gql(queryString)
}

export const STRK_REWARDS_DATA = () => {
  const queryString = ` query strkGrantDataV2 {
    strkGrantDataV2
    }`
  return gql(queryString)
}
