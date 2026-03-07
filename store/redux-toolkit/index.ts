import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "store/redux-toolkit/slice/userSlice";

const rootReducers = combineReducers({
  userData: userReducer,
});

const store = configureStore({
  reducer: rootReducers,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
