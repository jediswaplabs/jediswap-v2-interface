import { createAsyncThunk, createReducer, createSlice } from "@reduxjs/toolkit";
import { TokenList } from "@jediswap/token-lists/dist/types";

export interface ListsState {
  readonly defaultList: {
    readonly list: TokenList | null;
    readonly pendingUpdate: TokenList | null;
    readonly loadingRequestId: string | null;
    readonly error: string | null;
  };
}

type ListState = ListsState["defaultList"];

const NEW_LIST_STATE: ListState = {
  error: null,
  list: null,
  loadingRequestId: null,
  pendingUpdate: null
};

const initialState: ListsState = {
  defaultList: NEW_LIST_STATE
  // defaultList: {}
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
      // state.isLoading = true;
    })
    .addCase(fetchTokenList.fulfilled, (state, action) => {
      // state.isLoading = false;
      state.defaultList.list = action.payload;
    })
    .addCase(fetchTokenList.rejected, (state, action) => {
      console.log("Error", action.payload);
      // state.isError = true;
    })
);
