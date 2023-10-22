import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ReactComponent as Close } from "assets/images/x.svg";
import {
  isProductionChainId,
  isProductionEnvironment,
  isTestnetChainId,
  isTestnetEnvironment
} from "constants/connector";
// import { ApplicationModal } from '../../state/application/actions'
// import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
// import { ExternalLink } from '../../theme'
// import AccountDetails from '../AccountDetails'
import Modal from "../Modal";
// import Option from "./Option";
// import PendingView from './PendingView'
import { isMobile } from "utils/userAgent";
import { useConnectors } from "hooks/starknet-react";
import { Connector } from "@starknet-react/core";

const CloseIcon = styled.div`
  position: absolute;
  right: 2rem;
  top: 28px;
  color:${({ theme }) => theme.jediWhite}
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 2rem 2rem 0;
  font-weight: 500;
  color: ${({ theme }) => theme.jediWhite};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.jediNavyBlue};
  padding: 2rem;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const Blurb = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.jediWhite};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`;

export default function WalletModal() {
  const { connect, connectors } = useConnectors();

  return (
    <Modal isOpen={true} minHeight={false} maxHeight={90}>
      <Wrapper>
        <div className="flex flex-col gap-4">
          {connectors.map((connector: Connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={!connector.available()}
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      </Wrapper>
    </Modal>
  );
}
