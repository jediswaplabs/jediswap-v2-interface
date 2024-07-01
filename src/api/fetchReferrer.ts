import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { REFERRAL_ADDRESS } from 'contracts/referralAddress'
import { providerInstance } from 'utils/getLibrary'

const options = {
  method: 'POST',
  headers: { accept: 'application/json' },
}

const fetchReferrer = async (chainId: ChainId, userAddress: string) => {
  try {
    const api = providerInstance(chainId)
    const response = await fetch(api.nodeUrl, {
      ...options,
      body: JSON.stringify({
        id: 0,
        jsonrpc: '2.0',
        method: 'starknet_call',
        params: {
          request: {
            contract_address: REFERRAL_ADDRESS[chainId],
            entry_point_selector: '0x1c65c19ac21767e7d0fb5d7500ead907f9a06f684490b0ec509db48cbc4aadd',
            calldata: [userAddress],
          },
          block_id: 'pending',
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('An error occurred while fetching data')
  }
}

export default fetchReferrer
