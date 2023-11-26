import { Text } from 'rebass';
import styled from 'styled-components';
import { Input as NumericalInput } from '../../components/NumericalInput'

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
  min-width: 460px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    min-width: 340px;
  `};
`;

export const SmallMaxButton = styled.button`
  color: var(--Jedi-White, #fff);
  text-align: center;
  font-family: DM Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  display: flex;
  width: 126px;
  height: 40px;
  padding: 13px 45px 13px 52px;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #444;
  background: transparent;
  margin-right: 8px;
  &:last-child {
    margin-right: 0px;
  }
`

export const ResponsiveHeaderText = styled(Text)`
  font-size: 30px;
  font-weight: 400;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
     font-size: 24px
  `};
`;

export const StyledRemoveLiquidityWrapper = styled.div`
  border-radius: 8px;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
    0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
    0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset,
    0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.3) inset, 0px 5.38841px 8.46749px -3.07909px #fff inset,
    0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(38.48860168457031px);
`
export const StyledNumericalInput = styled(NumericalInput)`
  width: 24px;
`;

export const StyledNumericalInputWrapper = styled.div`
  display: flex;
  width: 78px;
`
export const BoundaryCard = styled.div`
  border-radius: 8px;
  border: ${({ theme }) => `1px solid ${theme.jediGreyBorder}`};
  padding: 20px;
`
