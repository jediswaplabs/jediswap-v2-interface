import styled from 'styled-components'

import { Unicon } from 'components/Unicon'
import { Connection, ConnectionType } from 'connection/types'
import useENSAvatar from 'hooks/useENSAvatar'
import { flexColumnNoWrap } from 'theme/styles'
import sockImg from '../../assets/svg/socks.svg'
import Identicon from '.'
import { Connector } from '@starknet-react/core'
import ArgentXIcon from 'assets/wallets/argentx.png'
import braavosIcon from 'assets/wallets/Braavos.svg'
// import { useIsDarkMode } from 'theme/components/index'

export const IconWrapper = styled.div<{ size?: number }>`
  position: relative;
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  & > img,
  span {
    height: ${({ size }) => (size ? `${size}px` : '32px')};
    width: ${({ size }) => (size ? `${size}px` : '32px')};
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const MiniIconContainer = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  bottom: -4px;
  ${({ side }) => `${side === 'left' ? 'left' : 'right'}: -4px;`}
  border-radius: 50%;
  outline: 2px solid ${({ theme }) => theme.surface1};
  outline-offset: -0.1px;
  background-color: ${({ theme }) => theme.surface1};
  overflow: hidden;
  @supports (overflow: clip) {
    overflow: clip;
  }
`

const MiniImg = styled.img`
  width: 16px;
  height: 16px;
`

const Socks = () => (
  <MiniIconContainer side="left">
    <MiniImg src={sockImg} />
  </MiniIconContainer>
)

// const MiniWalletIcon = ({ connection, side }: { connection: Connection; side: 'left' | 'right' }) => {
//   const isDarkMode = useIsDarkMode()
//   return (
//     <MiniIconContainer side={side}>
//       <MiniImg src={connection.getIcon?.(isDarkMode)} alt={`${connection.getName()} icon`} />
//     </MiniIconContainer>
//   )
// }

const MainWalletIcon = ({ account, connection, size }: { account: string; connection: Connection; size: number }) => {
  const { avatar } = useENSAvatar(account ?? undefined)

  if (!account) {
    return null
  }
  if (avatar || (connection.type === ConnectionType.INJECTED && connection.getName() === 'MetaMask')) {
    return <Identicon account={account} size={size} />
  }
  return <Unicon address={account} size={size} />
}

export default function StatusIcon({
  account,
  connection,
  size = 16,
  showMiniIcons = true,
}: {
  account: string
  connection: Connector | undefined
  size?: number
  showMiniIcons?: boolean
}) {
  if (connection?.id === 'argentX' || connection?.id === 'argentWebWallet') {
    return (
      <IconWrapper size={20}>
        <img src={ArgentXIcon} alt="ArgentX" />
      </IconWrapper>
    )
  }

  if (connection?.id === 'braavos') {
    return (
      <IconWrapper size={20}>
        <img src={braavosIcon} alt="myBraavos" />
      </IconWrapper>
    )
  }
  return null
}
