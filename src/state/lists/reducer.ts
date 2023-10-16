import { createAsyncThunk, createReducer, createSlice } from "@reduxjs/toolkit";

export interface ListsState {
  isLoading: boolean;
  isError: any;
  // this contains the default list of tokens
  readonly defaultList: object;
}

const initialState: ListsState = {
  isLoading: false,
  isError: null,
  defaultList: {
    tokens: []
  }
};

// Action
export const fetchTokenList = createAsyncThunk("fetchTokenList", async () => {
  const response = await fetch(
    "https://static.jediswap.xyz/tokens-list/jediswap-default.tokenlist.json"
  );
  const json = await response.json();
  return json;
});

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, action) => {
      state.isLoading = true;
    })
    .addCase(fetchTokenList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.defaultList = action.payload;
    })
    .addCase(fetchTokenList.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    })
);
