import React, { useEffect, useState } from "react";
// import { Text } from 'rebass'
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import Logo from "../../assets/jedi/logo.png";
import { YellowCard } from "../Card";
import { ExternalLink } from "../../theme/components";
import { useAccountDetails } from "../../hooks/starknet-react";
import { useProvider } from "@starknet-react/core";
import { constants } from "starknet";
import Web3Status from "components/Web3Status";
import Row from "components/Row";
import { flexRowNoWrap } from "theme/styles";
import { isTestnetChainId } from "constants/connector";

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 76px;
  top: 0;
  position: relative;
  z-index: 2;
  padding: 1rem 64px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
  // justify-content: flex-start;
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
  gap: 30px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;

  `};
`;

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`;

const HeaderLinks = styled(Row)`
  justify-content: space-around;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    // padding: 1rem 0 1rem 1rem;
    justify-content: flex-start;
`};
  /* gap: 38px;
   */
`;

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex: 0;
  flex-direction: row;
  align-items: center;
  // background-color: ${({ theme, active }) =>
    !active ? theme.bg1 : theme.bg3};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
  /* :hover {
    background-color: ${({ theme, active }) =>
    !active ? theme.bg2 : theme.bg4};
  } */
`;

const HideSmall = styled.div`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`;

const NetworkCard = styled(YellowCard)`
  border-radius: 8px;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
  padding: 0.82rem 2rem;
  border: 2px solid transparent;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  `};
`;

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.deprecated_mediaWidth.upToExtraSmall`
//     display: none;
//   `};
// `

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`;

const JediIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled(NavLink)`
  ${flexRowNoWrap};
  align-items: left;
  // border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  padding: 12px 0;

  font-weight: 800;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;
`;

const StyledExternalLink = styled(ExternalLink)`
  ${flexRowNoWrap};
  align-items: left;
  // border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  padding: 12px 0;

  font-weight: 800;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;

  :hover,
  :focus {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
  }
`;

function Header() {
  const { address, isConnected } = useAccountDetails();
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);
  const [isTestnet, setIsTestnet] = useState<boolean>(false);
  const { provider } = useProvider();

  useEffect(() => {
    if (!isConnected) return;

    provider.getChainId().then((chainId) => {
      const isTestnet = isTestnetChainId(chainId);
      setIsTestnet(isTestnet);
    });
  }, [provider, isConnected]);

  return (
    <HeaderFrame>
      <Title href="." style={{}}>
        <JediIcon>
          <img width={"195px"} height={"32px"} src={Logo} alt="logo" />
        </JediIcon>
      </Title>
      {/* <HeaderRow> */}
      <HeaderLinks>
        <StyledNavLink
          id={`swap-nav-link`}
          to={"/swap"}
          //   isActive={() => pathname.includes('/swap')}
        >
          Trade
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={"/pool"}
          // isActive={() =>
          //   pathname.includes('/pool') ||
          //   pathname.includes('/add') ||
          //   pathname.includes('/remove')
          // }
        >
          Pool
        </StyledNavLink>
        <StyledNavLink
          id={`swap-nav-link`}
          to={"/zap"}
          // isActive={() => pathname.includes('/zap')}
        >
          Zap
        </StyledNavLink>
        <StyledExternalLink
          id={`stake-nav-link`}
          href={"https://info.jediswap.xyz"}
        >
          Dashboard
        </StyledExternalLink>
      </HeaderLinks>
      {/* </HeaderRow> */}
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {isConnected ? (
              !isTestnet ? (
                <NetworkCard title={"Starknet Mainnet"}>
                  {"Starknet Mainnet"}
                </NetworkCard>
              ) : (
                <NetworkCard title={"Starknet Görli"}>
                  {"Starknet Görli"}
                </NetworkCard>
              )
            ) : null}
          </HideSmall>
          <AccountElement active={!!address} style={{ pointerEvents: "auto" }}>
            <Web3Status />
          </AccountElement>
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  );
}

export default Header;
