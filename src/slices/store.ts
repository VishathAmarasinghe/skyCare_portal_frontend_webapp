import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import clientReducer from './clientSlice/client';
import SelectorReducer from './selectorSlice/selector';
import CommonReducer from './commonSlice/common';
import NoteReducer from './NotesSlice/notes';

export const store = configureStore({
  reducer: {
    clients:clientReducer,
    selector:SelectorReducer,
    common:CommonReducer,
    notes:NoteReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: undefined,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
