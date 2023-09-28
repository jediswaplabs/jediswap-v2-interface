import { configureStore } from "@reduxjs/toolkit";
import tokenList from "./reducers/tokens";

const store = configureStore({
  reducer: {
    tokenList
  }
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
