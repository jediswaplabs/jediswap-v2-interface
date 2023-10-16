import { AppState, AppDispatch } from "./index";
import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
