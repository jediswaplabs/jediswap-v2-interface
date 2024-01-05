import { validateAndParseAddress, constants } from 'starknet'
import { ChainId, Currency, NativeCurrency, Percent, Token } from '@vnaysn/jediswap-sdk-core'

// import { fortmatic, injected, portis, walletconnect, walletlink, argentX } from '../connectors'
import JSBI from 'jsbi'

export const DEFAULT_CHAIN_ID = ChainId.MAINNET
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
export const DEFAULT_POOL_ADDRESS = '0x0087c11c97290c2a57f579d306675280032e5261b3d4bb681c90f1cd2bf5d392'
export const NONFUNGIBLE_POOL_MANAGER_ADDRESS = '0x00d61e6af51443e01bc62cc5ce2692c26ce7b3a228ded99b3c5cfc84ae3ac6a3'
export const DEFAULT_POOL_HASH = '0x06b8ae9efb0dbe07d7d047fb377734d4e8b881febd38f480cd1dc4f077fd3d84'
export const FACTORY_ADDRESS = '0x06b4115fa43c48118d3f79fbc500c75917c8a28d0f867479acb81893ea1e036c'
export const MULTICALL_ADDRESSES = '0x1F98415757620B543A52E61c46B32eB19261F984'
export const UNIVERSAL_ROUTER_ADDRESS = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'
export const isAvalanche = false
export const isBsc = false
export const isPolygon = false
export const isCelo = false

export const NATIVE_CHAIN_ID = 'NATIVE'
export const ZERO_ADDRESS_STARKNET = '0x0000000000000000000000000000000000000000000000000000000000000000'

const cachedNativeCurrency: { [chainId: string]: NativeCurrency | Token } = {}
export function nativeOnChain(chainId: ChainId): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]
  let nativeCurrency: NativeCurrency | Token

  return (cachedNativeCurrency[chainId] = WETH[chainId])
}

export const STARKSCAN_ADDRESS = {
  [ChainId.MAINNET]: 'https://starkscan-proxy.jediswap.xyz/api/',
  [ChainId.GOERLI]: 'https://starkscan-proxy.testnet.jediswap.xyz/api/',
}

export function getSwapCurrencyId(currency: Currency): string {
  if (currency.isToken) {
    return currency.address
  }
  return NATIVE_CHAIN_ID
}

export const domainURL = (chainId: ChainId) => {
  return chainId === ChainId.MAINNET
    ? 'https://app.starknet.id/api/indexer/addr_to_domain?addr='
    : 'https://goerli.app.starknet.id/api/indexer/addr_to_domain?addr='
}

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
  [ChainId.GOERLI]: NONFUNGIBLE_POOL_MANAGER_ADDRESS,
}

export const ZAP_IN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: validateAndParseAddress('0x29a303b928b9391ce797ec27d011d3937054bee783ca7831df792bae00c925c'),
  [ChainId.GOERLI]: validateAndParseAddress('0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f'),
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const WETH: { [chainId in ChainId]: Token } = {
  [ChainId.GOERLI]: new Token(
    ChainId.GOERLI,
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    18,
    'ETH',
    'ETHER'
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    18,
    'ETH',
    'ETHER'
  ),
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId: string]: Token | undefined } = {
  ...(WETH as Record<ChainId, Token>),
}

export const DAI = {
  [ChainId.GOERLI]: new Token(
    ChainId.GOERLI,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
}
export const USDC = {
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDC', 'USD//C'),
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDC', 'USD//C'),
}

export const USDT = {
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDT', 'Tether USD'),
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDT', 'Tether USD'),
}

export const WBTC = {
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 8, 'WBTC', 'Wrapped BTC'),
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 8, 'WBTC', 'Wrapped BTC'),
}

export const wstETH = {
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'USDT', 'Tether USD'),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'wstETH',
    'Wrapped stETH'
  ),
}

// export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
// export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
// export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
// export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
// export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 18, 'WBTC', 'Wrapped BTC')

// TODO this is only approximate, it's actually based on blocks
export const PROPOSAL_LENGTH_IN_DAYS = 7

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.GOERLI]: [WETH[ChainId.GOERLI]],
}

// const TOKEN0_ONLY: ChainTokenList = {
//   [ChainId.GOERLI]: [TOKEN0],
//   [ChainId.MAINNET]: [TOKEN0],
//   [ChainId.KOVAN]: [TOKEN0],
//   [ChainId.ROPSTEN]: [TOKEN0],
//   [ChainId.RINKEBY]: [TOKEN0]
// }

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.GOERLI]: [...WETH_ONLY[ChainId.GOERLI], DAI[ChainId.GOERLI], USDC[ChainId.GOERLI], USDT[ChainId.GOERLI]],
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
  // [ChainId.GOERLI]: [TOKEN0]
  // [ChainId.MAINNET]: [TOKEN0, TOKEN1],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
// export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
//   [ChainId.MAINNET]: {
//     [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
//   }
// }

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.GOERLI]: [...WETH_ONLY[ChainId.GOERLI], DAI[ChainId.GOERLI], USDC[ChainId.GOERLI], USDT[ChainId.GOERLI]],
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.GOERLI]: [
    ...WETH_ONLY[ChainId.GOERLI],
    DAI[ChainId.GOERLI],
    USDC[ChainId.GOERLI],
    USDT[ChainId.GOERLI],
    // WBTC[ChainId.GOERLI],
    // wstETH[ChainId.GOERLI]
  ],
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    WBTC[ChainId.MAINNET],
    wstETH[ChainId.MAINNET],
  ],
}

export const BASES_TO_BUILD_ZAPPER_LIST_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.GOERLI]: [
    ...WETH_ONLY[ChainId.GOERLI],
    DAI[ChainId.GOERLI],
    USDC[ChainId.GOERLI],
    USDT[ChainId.GOERLI],
    // WBTC[ChainId.GOERLI],
    // wstETH[ChainId.GOERLI]
  ],
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    WBTC[ChainId.MAINNET],
    wstETH[ChainId.MAINNET],
  ],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 200
// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 60

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

// When decimals are not specified for an ERC20 token
// use default ERC20 token decimals as specified here:
// https://docs.openzeppelin.com/contracts/3.x/erc20
export const DEFAULT_ERC20_DECIMALS = 18

export const USDC_MAINNET = new Token(
  ChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
)
const USDC_GOERLI = new Token(ChainId.MAINNET, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD//C')
const USDC_SEPOLIA = new Token(ChainId.MAINNET, '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5', 6, 'USDC', 'USD//C')
export const USDC_OPTIMISM = new Token(
  ChainId.MAINNET,
  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  6,
  'USDC',
  'USD//C'
)
export const USDC_OPTIMISM_GOERLI = new Token(
  ChainId.MAINNET,
  '0xe05606174bac4A6364B31bd0eCA4bf4dD368f8C6',
  6,
  'USDC',
  'USD//C'
)
export const USDC_ARBITRUM = new Token(
  ChainId.MAINNET,
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  6,
  'USDC',
  'USD//C'
)
export const USDC_ARBITRUM_GOERLI = new Token(
  ChainId.MAINNET,
  '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892',
  6,
  'USDC',
  'USD//C'
)
export const USDC_POLYGON = new Token(
  ChainId.MAINNET,
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  6,
  'USDC',
  'USD Coin'
)
export const USDC_POLYGON_MUMBAI = new Token(
  ChainId.MAINNET,
  '0x0fa8781a83e46826621b3bc094ea2a0212e71b23',
  6,
  'USDC',
  'USD Coin'
)
export const PORTAL_USDC_CELO = new Token(
  ChainId.MAINNET,
  '0x37f750B7cC259A2f741AF45294f6a16572CF5cAd',
  6,
  'USDCet',
  'USDC (Portal from Ethereum)'
)
export const USDC_BASE = new Token(ChainId.MAINNET, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 6, 'USDC', 'USD Coin')

export const DAI_ARBITRUM_ONE = new Token(
  ChainId.MAINNET,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai stable coin'
)
export const DAI_OPTIMISM = new Token(
  ChainId.MAINNET,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai stable coin'
)
export const MATIC_MAINNET = new Token(
  ChainId.MAINNET,
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  18,
  'MATIC',
  'Polygon Matic'
)
export const MATIC_POLYGON = new Token(
  ChainId.MAINNET,
  '0x0000000000000000000000000000000000001010',
  18,
  'MATIC',
  'Matic'
)
export const DAI_POLYGON = new Token(
  ChainId.MAINNET,
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  18,
  'DAI',
  'Dai Stablecoin'
)

export const USDT_POLYGON = new Token(
  ChainId.MAINNET,
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC_POLYGON = new Token(
  ChainId.MAINNET,
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const USDT_ARBITRUM_ONE = new Token(
  ChainId.MAINNET,
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  6,
  'USDT',
  'Tether USD'
)
export const USDT_OPTIMISM = new Token(
  ChainId.MAINNET,
  '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC_ARBITRUM_ONE = new Token(
  ChainId.MAINNET,
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WBTC_OPTIMISM = new Token(
  ChainId.MAINNET,
  '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WETH_POLYGON_MUMBAI = new Token(
  ChainId.MAINNET,
  '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa',
  18,
  'WETH',
  'Wrapped Ether'
)

export const WETH_POLYGON = new Token(
  ChainId.MAINNET,
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  18,
  'WETH',
  'Wrapped Ether'
)
const CELO_CELO = new Token(ChainId.MAINNET, '0x471EcE3750Da237f93B8E339c536989b8978a438', 18, 'CELO', 'Celo')
export const CUSD_CELO = new Token(
  ChainId.MAINNET,
  '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  18,
  'cUSD',
  'Celo Dollar'
)
export const CEUR_CELO = new Token(
  ChainId.MAINNET,
  '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  18,
  'cEUR',
  'Celo Euro Stablecoin'
)
export const PORTAL_ETH_CELO = new Token(
  ChainId.MAINNET,
  '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
  18,
  'ETH',
  'Portal Ether'
)
export const WBTC_CELO = new Token(
  ChainId.MAINNET,
  '0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF',
  18,
  'WBTC',
  'Wrapped BTC'
)
const CELO_CELO_ALFAJORES = new Token(ChainId.MAINNET, '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9', 18, 'CELO', 'Celo')
export const CUSD_CELO_ALFAJORES = new Token(
  ChainId.MAINNET,
  '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  18,
  'CUSD',
  'Celo Dollar'
)
export const CEUR_CELO_ALFAJORES = new Token(
  ChainId.MAINNET,
  '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
  18,
  'CEUR',
  'Celo Euro Stablecoin'
)

export const USDC_BSC = new Token(ChainId.MAINNET, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'USDC')
export const USDT_BSC = new Token(ChainId.MAINNET, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'USDT')
export const ETH_BSC = new Token(ChainId.MAINNET, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETH', 'Ethereum')
export const BTC_BSC = new Token(ChainId.MAINNET, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 'BTCB', 'BTCB')
export const BUSD_BSC = new Token(ChainId.MAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD')
export const DAI_BSC = new Token(ChainId.MAINNET, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18, 'DAI', 'DAI')

export const USDC_AVALANCHE = new Token(
  ChainId.MAINNET,
  '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  6,
  'USDC',
  'USDC Token'
)
export const USDT_AVALANCHE = new Token(
  ChainId.MAINNET,
  '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  6,
  'USDT',
  'Tether USD'
)
export const WETH_AVALANCHE = new Token(
  ChainId.MAINNET,
  '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
  18,
  'WETH',
  'Wrapped Ether'
)
export const DAI_AVALANCHE = new Token(
  ChainId.MAINNET,
  '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
  18,
  'DAI.e',
  'Dai.e Token'
)

export const ARB = new Token(ChainId.MAINNET, '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 'ARB', 'Arbitrum')

export const OP = new Token(ChainId.MAINNET, '0x4200000000000000000000000000000000000042', 18, 'OP', 'Optimism')

export const LDO = new Token(ChainId.MAINNET, '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', 18, 'LDO', 'Lido DAO Token')
