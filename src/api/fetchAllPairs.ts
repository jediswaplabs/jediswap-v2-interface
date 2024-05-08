import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { FACTORY_ADDRESS_CLASS_HASH, STARKSCAN_PROXY_ADDRESS } from 'constants/tokens'

const options = {
  method: 'GET',
  headers: { accept: 'application/json' },
}

const fetchAllPairs = async (chainId: ChainId) => {
  try {
    const api = STARKSCAN_PROXY_ADDRESS[chainId]
    const classHash = FACTORY_ADDRESS_CLASS_HASH[chainId]

    const response = await fetch(`${api}contracts/?class_hash=${classHash}&limit=100&order_by=asc`, options)

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('An error occurred while fetching data')
  }
}

export default fetchAllPairs
