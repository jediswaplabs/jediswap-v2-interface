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

export const TOKENS_DATA = ({ tokenIds = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}"`).join(',')}]`

  let queryString = `
    ${TokenFields}
    query tokensData {
      tokensData(first: 500, where: {tokenAddressIn: ${tokenString}, periodIn: "one_day"}) {
        token{...TokenFields}
        period
      }
    }
  `
  return gql(queryString)
}
