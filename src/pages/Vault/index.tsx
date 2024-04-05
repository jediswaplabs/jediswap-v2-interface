// @ts-nocheck

import { Trans } from '@lingui/macro';
import Switch from 'react-switch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'react-feather';
import { useMedia } from 'react-use';
import styled, { css } from 'styled-components';
import { Flex } from 'rebass';
import { Token } from '@vnaysn/jediswap-sdk-core';
import { isEmpty, pickBy } from 'lodash';
import { Link, useParams } from 'react-router-dom';
import { useBalance } from '@starknet-react/core';

import { useAccountDetails } from 'hooks/starknet-react';
import { AutoColumn } from 'components/Column';
import { StyledRouterLink, ThemedText } from 'theme/components';
import DoubleCurrencyLogo from '../../components/DoubleLogo';
import { useAllVaults } from '../../state/vaults/hooks.ts';
import JediSwapLoader from '../../components/Loader/JediSwapLoader';
import vaultImage from '../../assets/images/vault.png';
import noPositionsBg from '../../assets/svg/no-positions-bg.svg';
import { useFormatter } from '../../utils/formatNumbers.ts';
import { formatUsdPrice } from '../../nft/utils';
import { isAddressValidForStarknet } from '../../utils/addresses';

const PageWrapper = styled(AutoColumn)`
    padding: 0px 8px 0px;
    max-width: 920px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
        padding-top: 20px;
    }
`;

const VaultLink = styled(Link)`
    align-items: center;
    display: flex;
    cursor: pointer;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: ${({ theme }) => theme.neutral1};
    text-decoration: none;
    font-weight: 535;
`;

const ProviderLogo = styled.img`
    user-select: none;
    max-width: 100%;
`;

const NoPositionsContainer = styled.div`
    background: url(${noPositionsBg}) no-repeat;
    background-color: #141451;
    background-position: center 20px;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: auto;
    min-height: 100px;
    width: 100%;
    border-radius: 8px;
    padding: 2rem;
        // @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    //   padding: 0px 52px;
    // }
    //
        // @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    //   padding: 0px 52px;
    // }
`;

const ErrorContainer = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: auto;
    min-height: 25vh;
    @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
        padding: 0px 52px;
    }

    @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
        padding: 0px 52px;
    }
`;

const IconStyle = css`
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
`;

const NetworkIcon = styled(AlertTriangle)`
    ${IconStyle}
`;

const PromotionBannerContainer = styled.div`
    display: flex;
    border-radius: 8px;
    background: linear-gradient(90deg, #141451 0%, #2C045C 52%, #64099C 100%);
    position: relative;
    padding-left: ${(props) => (props.noDecorations ? '0' : '140px')};
    overflow: hidden;
`;
const PromotionBannerDecoration = styled.img`
    position: absolute;
    left: -45px;
    top: -30px;
    max-width: 190px;
    user-select: none;
`;

const PromotionBannerContent = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;
const PromotionBannerTitle = styled.div`
    font-size: 18px;
    font-weight: 700;
    line-height: 20px;
`;
const PromotionBannerDescription = styled.div`
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    text-align: left;
`;
const PromotionBannerLink = styled.a`
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    color: rgba(42, 170, 254, 1);
    text-decoration: none;
`;

const PageTitleRow = styled.div`
    display: flex;
  gap: 10px;
  
    align-items: center;
`;

const DashGrid = styled.div`
    display: grid;
    grid-gap: 1em;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.8fr 0.7fr;
  grid-template-areas: 'name provider tvl apr deposit';
    padding: 0 1.125rem;

    > * {
        justify-content: center;
        :first-child {
            justify-content: flex-start;
        }
    }

    @media screen and (max-width: 768px) {
      padding: 0 1.125rem;
      grid-template-columns: 1.4fr 0.8fr 0.8fr 0.7fr;
      grid-template-areas: 'name tvl apr deposit';
    }

    //@media screen and (min-width: 1080px) {
    //  padding: 0 1.125rem;
    //  grid-template-columns: 1fr 1fr 0.8fr 1fr;
    //    grid-template-areas: ' name provider tvl apr';
    //}

    //@media screen and (min-width: 1200px) {
    //  grid-template-columns: 1fr 1fr 0.8fr 1fr;
    //  grid-template-areas: ' name provider tvl apr';
    //}
`;

const TableWrapper = styled.div`
    border-radius: 8px;
    overflow: hidden;
    box-shadow: rgba(227, 222, 255, 0.2) 0px 0.77px 30.791px 0px inset, rgba(154, 146, 210, 0.3) 0px 3.079px 13.856px 0px inset, rgba(202, 172, 255, 0.3) 0px 75.438px 76.977px -36.949px inset, rgba(96, 68, 144, 0.3) 0px -63.121px 52.345px -49.265px
`;

const Divider = styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.20);
`;

const List = styled.div`

`;

const PageButtons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 2em;
    margin-bottom: 0.5em;
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
    font-size: 20px;
    font-weight: 700;
    font-family: 'DM Sans';
`;

const Arrow = styled.div`
    color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
    padding: 0 20px;
    user-select: none;
    font-size: 30px;

    :hover {
        cursor: pointer;
    }
`;

const DataText = styled(Flex)`
    align-items: center;
    text-align: center;
    color: ${({ theme }) => theme.text1};

    & > * {
        font-size: 14px;
    }

    @media screen and (max-width: 600px) {
        font-size: 12px;
    }
`;

function ErrorPanel({ text }) {
  return (
    <ErrorContainer>
      <ThemedText.BodyPrimary textAlign="center">
        <NetworkIcon strokeWidth={1} style={{ marginTop: '2em' }} />
        <div>
          <Trans>{text || 'An error has occurred. Please try again later.'}</Trans>
        </div>
      </ThemedText.BodyPrimary>
    </ErrorContainer>
  );
}

function NoVaultsPanel() {
  return (
    <NoPositionsContainer>
      <ThemedText.BodyPrimary textAlign="center" fontSize={20}>
        <Trans>No Liquidity has been found. Please deposit in any of our Vaults.</Trans>
      </ThemedText.BodyPrimary>
    </NoPositionsContainer>
  );
}

function PromotionalBanner({ noDecorations = false }) {
  return (
    <PromotionBannerContainer noDecorations={noDecorations}>
      {!noDecorations && <PromotionBannerDecoration src={vaultImage} draggable={false} />}
      <PromotionBannerContent>
        <PromotionBannerTitle>Introducing Vaults</PromotionBannerTitle>
        <PromotionBannerDescription>Vaults are dual-asset token pairs used to provide liquidity. Your deposits
          into selected strategies are managed by our strategy partners. Importantly, users have the
          flexibility to enter and exit at any point in time.
        </PromotionBannerDescription>
        <PromotionBannerLink href="https://www.jediswap.xyz/" target="_blank" rel="noopener">Learn
          more
        </PromotionBannerLink>
      </PromotionBannerContent>
    </PromotionBannerContainer>
  );
}

const noop = () => {};
const UserBalance = ({ tokenAddress, vaultAddress, tokenPrice, getResult = noop }) => {
  const { address, isConnected } = useAccountDetails();
  const { data: userBalanceData, isLoading: isUserBalanceLoading, isError: isUserBalanceError, isSuccess: isUserBalanceSuccess } = useBalance({
    token: tokenAddress,
    address,
    watch: true,
  });
  let result;
  const balanceInUsd = Number(userBalanceData?.formatted ?? 0) * (tokenPrice ?? 0);
  useEffect(() => {
    if (isConnected && isUserBalanceSuccess) {
      getResult({ vaultAddress, balance: balanceInUsd });
    }
  }, [userBalanceData, isUserBalanceSuccess, isConnected]);

  switch (true) {
    case (!isConnected):
    case (isUserBalanceError): {
      result = formatUsdPrice(0);
      break;
    }
    case (isUserBalanceLoading): {
      result = '...';
      break;
    }
    case (isUserBalanceSuccess): {
      result = formatUsdPrice(balanceInUsd);
      break;
    }
    default: {
      result = 0;
    }
  }
  return result;
};

const BreadcrumbsRow = styled(Flex)`
    
`;
const Breadcrumbs = styled(Flex)`
    gap: 6px;
  align-items: center;
`;

const BreadcrumbsNavLink = styled(StyledRouterLink)`
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
`;

const PageContentWrapper = styled(Flex)`
    gap: 20px;
  flex-direction: row;
`;

const PageTitle = ({ token0, token1 }) => {
  const below600 = useMedia('(max-width: 600px)');
  if (!(token0 && token1)) { return null; }
  return (
    <PageTitleRow>
      <DoubleCurrencyLogo
        size={below600 ? 24 : 30}
        currency0={token0}
        currency1={token1}
        margin
      />
      <StyledTokenName className="pair-name-container">
        {token0?.symbol}-{token1?.symbol}
      </StyledTokenName>
    </PageTitleRow>
  );
};

export default function Vault() {
  const { vaultId: vaultIdFromUrl } = useParams();
  const { address, isConnected } = useAccountDetails();
  const [generalError, setGeneralError] = useState(null);
  const [generalLoading, setGeneralLoading] = useState(true);

  const { data: allVaults, error: allVaultsError, isLoading: isAllVaultsLoading } = useAllVaults();

  const getCurrentVault = () => {
    if (!allVaults) { return; }
    const result = allVaults[vaultIdFromUrl];
    return result;
  };
  const currentVault = getCurrentVault();
  const vaultsAddresses = Object.keys(allVaults ?? {});

  // const below600 = useMedia('(max-width: 600px)');
  // const below768 = useMedia('(max-width: 768px)');
  // const getFilteredVaults = () => {
  //   if (!allVaults) { return; }
  //   if (!isMyVaultsFilterEnabled) { return allVaults; }
  //   const result = pickBy(allVaults, (value, key) => userPools?.[key] > 0);
  //   return result;
  // };
  //
  // const vaults = getFilteredVaults();
  // const vaultsAddresses = Object.keys(vaults ?? {});

  useEffect(() => {
    setGeneralError(allVaultsError);
    setGeneralLoading(isAllVaultsLoading);
  }, [allVaultsError, isAllVaultsLoading]);

  // const vaultsList = vaultsAddresses
  //   ?.slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
  //   .sort((vaultAddressA, vaultAddressB) => {
  //     const vaultA = allVaults[vaultAddressA];
  //     const vaultB = allVaults[vaultAddressB];
  //     const vaultAPerformanceData = vaultA.performance[vaultA.mainAssetKey];
  //     const vaultBPerformanceData = vaultB.performance[vaultB.mainAssetKey];
  //     const vaultAUserDeposit = userPools?.[vaultAddressA];
  //     const vaultBUserDeposit = userPools?.[vaultAddressB];
  //     const vaultAValueToCompare = (isMyVaultsFilterEnabled && vaultAUserDeposit) ? vaultAUserDeposit : vaultAPerformanceData?.shareTokenApr;
  //     const vaultBValueToCompare = (isMyVaultsFilterEnabled && vaultBUserDeposit) ? vaultBUserDeposit : vaultBPerformanceData?.shareTokenApr;
  //     if (vaultAValueToCompare < vaultBValueToCompare) {
  //       return 1;
  //     }
  //     if (vaultAValueToCompare > vaultBValueToCompare) {
  //       return -1;
  //     }
  //     return 0;
  //   });
  //
  const getContent = () => {
    switch (true) {
      case (!isAddressValidForStarknet(vaultIdFromUrl)): {
        return <ErrorPanel />;
      }
      case (generalError): {
        return <ErrorPanel />;
      }
      case (generalLoading): {
        return <JediSwapLoader />;
      }
      case (!vaultsAddresses?.length): {
        return <ErrorPanel />;
      }
      case (vaultsAddresses?.length && !currentVault): {
        return <ErrorPanel />;
      }
      case (!(currentVault.token0 && currentVault.token1)): {
        return <ErrorPanel />;
      }
      default: {
        const token0 = new Token(
          currentVault.token0.chainId,
          currentVault.token0.address,
          currentVault.token0.decimals,
          currentVault.token0.symbol,
          currentVault.token0.name,
        );
        token0.logoURI = currentVault.token0.logoURI;

        const token1 = new Token(
          currentVault.token1.chainId,
          currentVault.token1.address,
          currentVault.token1.decimals,
          currentVault.token1.symbol,
          currentVault.token1.name,
        );
        token1.logoURI = currentVault.token1.logoURI;

        return (
          <AutoColumn gap={'12px'}>
            <PageTitle token0={token0} token1={token1} />
            <PageContentWrapper>
              123
            </PageContentWrapper>
          </AutoColumn>
        );
        //       return (
        //         <TableWrapper>
        //           <DashGrid isMyVaultsFilterEnabled={isMyVaultsFilterEnabled}
        //             style={{
        //               height: 'fit-content',
        //               padding: '1rem 1.125rem 1rem 1.125rem',
        //               backgroundColor: '#ffffff33',
        //             }}
        //           >
        //             <Flex alignItems="center" justifyContent="flexStart">
        //               <ThemedText.BodySmall area="name">Pool Name</ThemedText.BodySmall>
        //             </Flex>
        //             {!below768 && (
        //               <Flex alignItems="center" justifyContent="flexStart">
        //                 <ThemedText.BodySmall area="provider">Provider</ThemedText.BodySmall>
        //               </Flex>
        //             )}
        //             <Flex alignItems="center" justifyContent="flexStart">
        //               <ThemedText.BodySmall area="tvl">TVL</ThemedText.BodySmall>
        //             </Flex>
        //             <Flex alignItems="center" justifyContent="flexStart">
        //               <ThemedText.BodySmall area="apr">APR</ThemedText.BodySmall>
        //             </Flex>
        //             <Flex alignItems="center" justifyContent="flexStart">
        //               <ThemedText.BodySmall area="deposite" textAlign={'center'}>My deposit</ThemedText.BodySmall>
        //             </Flex>
        //           </DashGrid>
        //
        //           <List p={0}>{vaultsList.map((vaultAddress, index) => (
        //             vaultAddress && (
        //               <div key={index}>
        //                 <ListItem key={index}
        //                   index={(page - 1) * ITEMS_PER_PAGE + index + 1}
        //                   vaultAddress={vaultAddress}
        //                   vaultData={vaults?.[vaultAddress]}
        //                   getUserBalance={getUserBalanceResult}
        //                 />
        //                 <Divider />
        //               </div>
        //             )
        //           ))}
        //           </List>
        //
        //           <PageButtons>
        //             <div
        //               onClick={(e) => {
        //                 setPage(page === 1 ? page : page - 1);
        //               }}
        //             >
        //               <Arrow faded={page === 1}>{'<'}</Arrow>
        //             </div>
        //             <ThemedText.BodySmall style={{
        //               display: 'flex',
        //               alignItems: 'center',
        //             }}
        //             >{`${page} of ${maxPage}`}
        //             </ThemedText.BodySmall>
        //             <div
        //               onClick={(e) => {
        //                 setPage(page === maxPage ? page : page + 1);
        //               }}
        //             >
        //               <Arrow faded={page === maxPage}>{'>'}</Arrow>
        //             </div>
        //           </PageButtons>
        //
        //         </TableWrapper>
        //       );
      }
    }
  };

  return (
    <PageWrapper>
      <BreadcrumbsRow>
        <Breadcrumbs>
          <ArrowLeft width={20} />
          <BreadcrumbsNavLink to={'/vaults/'}>Back to vaults</BreadcrumbsNavLink>
        </Breadcrumbs>
      </BreadcrumbsRow>
      {getContent()}
    </PageWrapper>
  );
}
