import React, { Suspense } from "react";
import styled from "styled-components";
import Router from "./routes";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  justify-content: space-between;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

export default function App() {
  return (
    <Suspense fallback={null}>
      {/* <Route component={DarkModeQueryParamReader} /> */}
      <AppWrapper>
        <HeaderWrapper>{/* <Header /> */}</HeaderWrapper>
        <BodyWrapper>
          <Router />
          <Marginer />
        </BodyWrapper>
        {/* <Footer /> */}
      </AppWrapper>
    </Suspense>
  );
}
