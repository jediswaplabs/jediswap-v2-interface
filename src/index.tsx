import "@reach/dialog/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./state";
import { StarknetProvider } from "./pages/starknet-provider";
import ThemeProvider, { ThemedGlobalStyle } from "./theme";
import { HashRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <StarknetProvider>
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider>
            <ThemedGlobalStyle />
            <App />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    </StarknetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
