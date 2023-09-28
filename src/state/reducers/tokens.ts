import { createAsyncThunk, createReducer, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  isError: false,
  data: {}
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
      state.data = action.payload;
    })
    .addCase(fetchTokenList.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    })
);
