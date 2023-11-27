import styled from 'styled-components';

import searchIcon from 'assets/svg/search.svg';
import { LoadingRows as BaseLoadingRows } from 'components/Loader/styled';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
`;

export const MenuItem = styled(RowBetween)<{ dim?: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme }) => theme.deprecated_hoverDefault};
  }
  opacity: ${({ disabled, selected, dim }) => (dim || disabled || selected ? 0.4 : 1)};
`;

export const SearchInput = styled.input`
  background: no-repeat scroll 7px 7px;
  background-image: url(${searchIcon});
  background-size: 20px 20px;
  background-position: 12px center;
  position: relative;
  display: flex;
  padding: 16px;
  padding-left: 40px;
  height: 40px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.surface4};
  outline: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.neutral1};

  border: 1px solid ${({ theme }) => theme.surface3};
  -webkit-appearance: none;
  
  color: ${({ theme }) => theme.jediWhite};

  font-size: 14px;
  font-weight: 400;
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
  inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
  inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  

  
  ::placeholder {
    color: ${({ theme }) => theme.neutral3};
    font-size: 14px;
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.surface3};
    background-color: ${({ theme }) => theme.surface2};
    outline: none;
  }
`;
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.surface3};
`;

export const LoadingRows = styled(BaseLoadingRows)`
  grid-column-gap: 0.5em;
  grid-template-columns: repeat(12, 1fr);
  max-width: 960px;
  padding: 12px 20px;

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 8;
    height: 1em;
    margin-bottom: 0.25em;
  }
  & > div:nth-child(4n + 2) {
    grid-column: 12;
    height: 1em;
    margin-top: 0.25em;
  }
  & > div:nth-child(4n + 3) {
    grid-column: 1 / 4;
    height: 0.75em;
  }
`;
