import styled from 'styled-components'

export const ToggleWrapper = styled.button<{ width?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width ?? '100%'};
  padding: 0;
  background: ${({ theme }) => theme.surface2};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  outline: none;
`

export const ToggleElement = styled.span<{ isActive?: boolean; fontSize?: string }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0.5rem;
  border-radius: 4px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive }) => (isActive ? theme.jediWhite : '#572c95')};
  box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.20) inset, 0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.30) inset;
  color: ${({ theme, isActive }) => (isActive ? theme.jediPink : theme.jediWhite)};
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 535;
  white-space: nowrap;
  :hover {
    user-select: initial;
    color: ${({ theme, isActive }) => (isActive ? theme.neutral2 : theme.neutral3)};
  }
`
