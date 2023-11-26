import { Box } from 'rebass/styled-components'
import styled from 'styled-components'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1rem'};
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '16px'};
  border: ${({ border }) => border};
`
export default Card

export const LightCard = styled(Card)`
  border-radius: 8px;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.20) inset, 0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.30) inset, 0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.30) inset, 0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.30) inset;
`

export const GrayCard = styled(Card)`
  background-color: ${({ theme }) => theme.surface2};
`

export const DarkGrayCard = styled(Card)`
  background-color: ${({ theme }) => theme.surface3};
`

export const DarkCard = styled(Card)`
  border-radius: 8px;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(38.48860168457031px);
`

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.jediGreyBorder};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.deprecated_yellow3};
  font-weight: 535;
`

export const BlueCard = styled(Card)`
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
  border-radius: 12px;
`
