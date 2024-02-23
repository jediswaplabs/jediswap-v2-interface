import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { darken, lighten } from 'polished';

import { Box } from 'nft/components/Box';

export const Nav = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem 32px;
  width: 100%;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    padding: 1rem 64px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding: 16px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  margin-right: 12px;
  align-items: center;

  img {
    cursor: pointer;
  }
  img.desktop {
    display: none;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    img.mobile {
      display: none;
    }
    img.desktop {
      display: block;
    }
  }
`;

export const MenuContainer = styled.div`
  display: none;
  align-items: center;
  justify-content: space-around;
  margin: 0px 12px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    margin: 0px;
    display: flex;
  }
`;

const baseLinkCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0px 12px;
  padding: 12px 0px;
  width: fit-content;
  position: relative;
  text-align: center;
  text-decoration: none;
  line-height: 22px;
  font-weight: 750;
  text-transform: uppercase;
  color: ${({ theme }) => theme.neutral1};

  :hover {
    color: ${({ theme }) => darken(0.2, theme.neutral1)};
  }
`;

const BaseMenuItem = styled(NavLink)`
  ${baseLinkCss};
`;

export const StatusContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    gap: 16px;
  }
`;

export const MenuItem = styled(BaseMenuItem)``;

export const ActiveMenuItem = styled(BaseMenuItem)`
  text-shadow: 0px 0px 73.21151733398438px rgba(49, 255, 156, 0.5), 0px 0px 18.911256790161133px rgba(49, 255, 156, 0.7);
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
      linear-gradient(rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
    box-shadow: rgba(49, 255, 156, 0.5) 0px 0px 18.9113px, rgba(49, 255, 156, 0.5) 0px 0px 73.2115px,
      rgba(49, 255, 156, 0.5) 0px 0px 7.32115px inset;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    &:after {
      top: initial;
      bottom: 0;
    }
  }
`;

export const ExternalMenuItem = styled.a`
  ${baseLinkCss};
`;
