import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useEffect } from 'react'

import { useIsNftPage } from 'hooks/useIsNftPage'
import { darkTheme } from '../colors'
import { useAccountDetails } from 'hooks/starknet-react'

const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient')
const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundRadialGradientElement) {
      backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })

function setDefaultBackground(backgroundRadialGradientElement: HTMLElement) {
  setBackground(initialStyles)
  const defaultLightGradient =
    'radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0) 0%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
  const defaultDarkGradient = 'linear-gradient(180deg, #131313 0%, #131313 100%)'
  backgroundRadialGradientElement.style.background = defaultDarkGradient
}

export default function RadialGradientByChainUpdater(): null {
  const { chainId } = useAccountDetails()
  const isNftPage = useIsNftPage()

  // manage background color
  useEffect(() => {
    if (!backgroundRadialGradientElement) {
      return
    }

    if (isNftPage) {
      setBackground(initialStyles)
      backgroundRadialGradientElement.style.background = darkTheme.surface1
      return
    }
  }, [chainId, isNftPage])
  return null
}
