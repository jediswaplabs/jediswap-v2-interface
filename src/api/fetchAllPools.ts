import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { DEFAULT_POOL_HASH, STARKSCAN_PROXY_ADDRESS } from 'constants/tokens'

const options = {
  method: 'GET',
  headers: { accept: 'application/json', 'x-api-key': 'docs-starkscan-co-api-3' },
}

const fetchAllPools = async (chainId: ChainId) => {
  try {
    const api = STARKSCAN_PROXY_ADDRESS[chainId]
    const response = await fetch(`${api}contracts?class_hash=${DEFAULT_POOL_HASH}`, options)

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('An error occurred while fetching data')
  }
}

export default fetchAllPools
