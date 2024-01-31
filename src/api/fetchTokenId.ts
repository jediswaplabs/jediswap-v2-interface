import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { ROUTER_ADDRESS, STARKSCAN_PROXY_ADDRESS } from 'constants/tokens'

const options = {
  method: 'GET',
  headers: { accept: 'application/json' },
}

const fetchTokenIds = async (address: string, chainId: ChainId) => {
  try {
    const api = STARKSCAN_PROXY_ADDRESS[chainId]
    const router_address = ROUTER_ADDRESS[chainId]
    const response = await fetch(`${api}nfts?contract_address=${router_address}&owner_address=${address}`, options)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('An error occurred while fetching data')
  }
}

export default fetchTokenIds
