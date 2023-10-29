import { Currency } from '@uniswap/sdk-core';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { TokenTradeInput } from 'graphql/data/types-and-hooks';

interface TokenInputState {
  inputCurrency?: Currency
  setInputCurrency: (currency: Currency | undefined) => void
  clearInputCurrency: () => void
  tokenTradeInput?: TokenTradeInput
  setTokenTradeInput: (tokenTradeInput: TokenTradeInput | undefined) => void
}

export const useTokenInput = createWithEqualityFn<TokenInputState>()(
  devtools(
    (set) => ({
      inputCurrency: undefined,
      tokenTradeInput: undefined,
      setInputCurrency: (currency) => set(() => ({ inputCurrency: currency })),
      clearInputCurrency: () => set(() => ({ inputCurrency: undefined })),
      setTokenTradeInput: (tokenTradeInput) => set(() => ({ tokenTradeInput })),
    }),
    { name: 'useTokenInput' },
  ),
  shallow,
);
