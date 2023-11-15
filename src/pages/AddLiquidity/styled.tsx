import styled from 'styled-components';

import { AutoColumn } from 'components/Column';
import { Input } from 'components/NumericalInput';

export const Wrapper = styled.div`
  position: relative;
  padding: 26px 16px;
`;

export const ScrollablePage = styled.div`
  padding: 20px 8px 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.20) inset, 0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.30) inset, 0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.30) inset, 0px -63.12132px 52.3445px -49.26542px rgba(96, 68, 144, 0.30) inset, 0px 5.38841px 8.46749px -3.07909px #FFF inset, 0px 30.02111px 43.10724px -27.7118px rgba(255, 255, 255, 0.50) inset;
  backdrop-filter: blur(38.48860168457031px);

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    margin: 0 auto;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 48px 8px 0px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`;

export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`;

export const StyledInput = styled(Input)`
  background-color: ${({ theme }) => theme.surface1};
  text-align: left;
  font-size: 18px;
  width: 100%;
`;

/* two-column layout where DepositAmount is moved at the very end on mobile. */
export const ResponsiveTwoColumns = styled.div<{ wide: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;

  border-top: 1px solid ${({ theme }) => theme.surface3};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    margin-top: 0;
  `};
`;

export const MediumOnly = styled.div`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `};
`;
