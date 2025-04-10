import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { POOL_CLASS_HASH, STARKSCAN_PROXY_ADDRESS } from 'constants/tokens'

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': 'CLZigI5Cn93Rs2T8hU8U7abCDI30eHa76yCbb5Bi',
  },
}

const fetchAllPools = async (chainId: ChainId) => {
  try {
    const api = STARKSCAN_PROXY_ADDRESS[chainId]
    const classHash = POOL_CLASS_HASH[chainId]
    // const response = await fetch(`${api}contracts/?class_hash=${classHash}`, options)
    const response = await fetch(`${api}/${classHash}/contracts`, options)

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
