import { AppState } from "./../index";
import { useAppSelector } from "state/hooks";

export const useTokenList = (): AppState["lists"] =>
  useAppSelector((state) => state.lists);
