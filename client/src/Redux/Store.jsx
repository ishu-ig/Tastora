import { configureStore } from "@reduxjs/toolkit";
import ApplySagaMiddleware from "redux-saga"

import RootSaga from "./Sagas/RootSaga";
import RootReducer from "./Reducers/RootReducer";

const Saga = ApplySagaMiddleware()

const Store = configureStore({
    reducer: RootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(Saga)
})

export default Store

Saga.run(RootSaga)