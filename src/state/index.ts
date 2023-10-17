import { configureStore } from "@reduxjs/toolkit";
import lists from "./lists/reducer";

const store = configureStore({
  reducer: {
    lists
  }
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
