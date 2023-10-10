import { ButtonGray, ButtonPrimary, ButtonText } from "components/Button";
import { AutoColumn } from "components/Column";
// import PositionList from "components/PositionList";
import { RowBetween, RowFixed } from "components/Row";
// import { isSupportedChain } from 'constants/chains'
// import { useFilterPossiblyMaliciousPositions } from 'hooks/useFilterPossiblyMaliciousPositions'
// import { useNetworkSupportsV2 } from 'hooks/useNetworkSupportsV2'
// import { useV3Positions } from 'hooks/useV3Positions'
import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronsRight,
  Inbox,
  Layers
} from "react-feather";
import { Link } from "react-router-dom";
// import { useUserHideClosedPositions } from 'state/user/hooks'
import styled, { css, useTheme } from "styled-components";
import { HideSmall, ThemedText } from "theme/components";
// import { PositionDetails } from 'types/position'

// import CTACards from "./CTACards";
import { LoadingRows } from "./styled";

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    max-width: 800px;
    padding-top: 48px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    max-width: 500px;
    padding-top: 20px;
  }
`;
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.neutral2};
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  }
`;
const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-left: 8px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
`;
// const PoolMenu = styled(Menu)`
//   margin-left: 0;
//   @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
//     flex: 1 1 auto;
//     width: 50%;
//   }

//   a {
//     width: 100%;
//   }
// `;
const PoolMenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: 535;
`;
const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  margin-right: 8px;
`;

const MoreOptionsText = styled(ThemedText.BodyPrimary)`
  align-items: center;
  display: flex;
`;

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  min-height: 25vh;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const NetworkIcon = styled(AlertTriangle)`
  ${IconStyle}
`;

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`;

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  width: fit-content;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex: 1 1 auto;
    width: 50%;
  }
`;

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  padding: 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  );
}

function WrongNetworkCard() {
  const theme = useTheme();

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: "100%" }}>
            <TitleRow padding="0">
              <ThemedText.LargeHeader>
                <>Pools</>
              </ThemedText.LargeHeader>
            </TitleRow>

            <MainContentWrapper>
              <ErrorContainer>
                <ThemedText.BodyPrimary
                  color={theme.neutral3}
                  textAlign="center"
                >
                  <NetworkIcon strokeWidth={1.2} />
                  <div data-testid="pools-unsupported-err">
                    <>Your connected network is unsupported.</>
                  </div>
                </ThemedText.BodyPrimary>
              </ErrorContainer>
            </MainContentWrapper>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  );
}

export default function Pool() {
  // const { account, chainId } = useWeb3React();
  // const networkSupportsV2 = useNetworkSupportsV2();
  // const toggleWalletDrawer = useToggleAccountDrawer();

  const theme = useTheme();
  // const [userHideClosedPositions, setUserHideClosedPositions] =
  //   useUserHideClosedPositions();

  // const { positions, loading: positionsLoading } = useV3Positions(account);

  // const [openPositions, closedPositions] = positions?.reduce<
  //   [PositionDetails[], PositionDetails[]]
  // >(
  //   (acc, p) => {
  //     acc[p.liquidity?.isZero() ? 1 : 0].push(p);
  //     return acc;
  //   },
  //   [[], []]
  // ) ?? [[], []];

  // const userSelectedPositionSet = useMemo(
  //   () => [
  //     ...openPositions,
  //     ...(userHideClosedPositions ? [] : closedPositions)
  //   ],
  //   [closedPositions, openPositions, userHideClosedPositions]
  // );

  // const filteredPositions = useFilterPossiblyMaliciousPositions(
  //   userSelectedPositionSet
  // );

  // if (!isSupportedChain(chainId)) {
  //   return <WrongNetworkCard />;
  // }

  // const showConnectAWallet = Boolean(!account);

  return (
    <PageWrapper>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: "100%" }}>
          <TitleRow padding="0">
            <ThemedText.LargeHeader>
              <>Pools</>
            </ThemedText.LargeHeader>
            <ButtonRow>
              {/* {networkSupportsV2 && (
                  <PoolMenu
                    menuItems={menuItems}
                    flyoutAlignment={FlyoutAlignment.LEFT}
                    ToggleUI={(props: any) => (
                      <MoreOptionsButton {...props}>
                        <MoreOptionsText>
                          <Trans>More</Trans>
                          <ChevronDown size={15} />
                        </MoreOptionsText>
                      </MoreOptionsButton>
                    )}
                  />
                )} */}
              <ResponsiveButtonPrimary
                data-cy="join-pool-button"
                id="join-pool-button"
                as={Link}
                to="/add/ETH"
              >
                New position
              </ResponsiveButtonPrimary>
            </ButtonRow>
          </TitleRow>
          <HideSmall>{/* <CTACards /> */}</HideSmall>
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  );
}
