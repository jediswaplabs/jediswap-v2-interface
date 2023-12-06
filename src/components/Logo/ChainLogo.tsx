import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { CSSProperties, FunctionComponent } from 'react'
import { useTheme } from 'styled-components'

import { getChainInfo } from 'constants/chainInfo'
import { isSupportedChain, SupportedInterfaceChain } from 'constants/chains'
import { ReactComponent as arbitrum } from './ChainSymbols/arbitrum.svg'
import { ReactComponent as avax } from './ChainSymbols/avax.svg'
import { ReactComponent as base } from './ChainSymbols/base.svg'
import { ReactComponent as bnb } from './ChainSymbols/bnb.svg'
import { ReactComponent as celo } from './ChainSymbols/celo.svg'
import { ReactComponent as celoLight } from './ChainSymbols/celo_light.svg'
import { ReactComponent as ethereum } from './ChainSymbols/ethereum.svg'
import { ReactComponent as optimism } from './ChainSymbols/optimism.svg'
import { ReactComponent as polygon } from './ChainSymbols/polygon.svg'

type SVG = FunctionComponent<React.SVGProps<SVGSVGElement>>
type ChainUI = { Symbol: SVG; bgColor: string; textColor: string }

export function getChainUI(chainId: SupportedInterfaceChain): ChainUI
export function getChainUI(chainId: ChainId): ChainUI | undefined {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
    case ChainId.MAINNET:
      return {
        Symbol: ethereum,
        bgColor: '#6B8AFF33',
        textColor: '#6B8AFF',
      }
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return {
        Symbol: polygon,
        bgColor: '#9558FF33',
        textColor: '#9558FF',
      }
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return {
        Symbol: arbitrum,
        bgColor: '#00A3FF33',
        textColor: '#00A3FF',
      }
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return {
        Symbol: optimism,
        bgColor: '#FF042033',
        textColor: '#FF0420',
      }
    case ChainId.MAINNET:
    case ChainId.MAINNET:
      return {
        Symbol: celo,
        bgColor: '#FCFF5233',
        textColor: '#FCFF52',
      }
    case ChainId.MAINNET:
      return {
        Symbol: avax,
        bgColor: '#E8414233',
        textColor: '#E84142',
      }
    case ChainId.MAINNET:
      return {
        Symbol: bnb,
        bgColor: '#EAB20033',
        textColor: '#EAB200',
      }
    case ChainId.MAINNET:
      return {
        Symbol: base,
        bgColor: '#0052FF33',
        textColor: '#0052FF',
      }
    default:
      return undefined
  }
}

export const getDefaultBorderRadius = (size: number) => size / 2 - 4

type ChainLogoProps = {
  chainId: ChainId
  className?: string
  size?: number
  borderRadius?: number
  style?: CSSProperties
  testId?: string
}
export function ChainLogo({
  chainId,
  className,
  style,
  size = 16,
  borderRadius = getDefaultBorderRadius(size),
  testId,
}: ChainLogoProps) {
  const { surface2 } = useTheme()

  if (!isSupportedChain(chainId)) {
    return null
  }
  const { label } = getChainInfo(chainId)

  const { Symbol, bgColor } = getChainUI(chainId)
  return (
    <svg width={size} height={size} className={className} style={style} aria-labelledby="titleID" data-testid={testId}>
      <title id="titleID">{`${label} logo`}</title>
      <rect rx={borderRadius} fill={surface2} width={size} height={size} />
      <rect rx={borderRadius} fill={bgColor} width={size} height={size} />
      <Symbol width={size} height={size} />
    </svg>
  )
}
