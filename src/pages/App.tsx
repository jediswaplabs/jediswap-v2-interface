import React, { Suspense, useEffect } from "react";
import styled from "styled-components";
import Router from "../routes";
import { useDispatch, useSelector } from "react-redux";
import { fetchTokenList } from "../state/lists/reducer";
import { AppDispatch, AppState } from "../state";
import Header from "../components/Header";
import { flexRowNoWrap } from "theme/styles";

const HeaderWrapper = styled.div`
  ${flexRowNoWrap};
  width: 100%;
  justify-content: space-between;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.navHeight}px 0px 5rem 0px;
  align-items: center;
  flex: 1;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  // const tokenList = useSelector<AppState, AppState["tokenList"]>((state) => {
  //   return state.tokenList;
  // });

  useEffect(() => {
    dispatch(fetchTokenList());
  }, []);

  return (
    <Suspense fallback={null}>
      {/* <Route component={DarkModeQueryParamReader} /> */}
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      <BodyWrapper>
        <Router />
        <Marginer />
      </BodyWrapper>
      {/* <Footer /> */}
    </Suspense>
  );
}
