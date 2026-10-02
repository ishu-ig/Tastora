import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CART, CREATE_CART_RED, DELETE_CART, DELETE_CART_RED, GET_CART, GET_CART_RED, UPDATE_CART, UPDATE_CART_RED } from "../Constant";
import { createRecord, deleteRecord, getRecord,  updateRecord } from "./Services/ApiCallingService";
// import { createMultiPartRecord, deleteRecord, getRecord, updateMultiPartRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    let response = yield createRecord("cart", action.payload)
    // let response = yield createMultiPartRecord("cart", action.payload)
    yield put({ type: CREATE_CART_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("cart")
    yield put({ type: GET_CART_RED, payload: response.data })
}

function* updateSaga(action) {
    yield updateRecord("cart", action.payload)
    // yield updateMultiPartRecord("cart", action.payload)
    yield put({ type: UPDATE_CART_RED, payload: action.payload })
}
function* deleteSaga(action) {
    yield deleteRecord("cart", action.payload)
    yield put({ type: DELETE_CART_RED, payload: action.payload })
}
export default function* cartSaga() {
    yield takeEvery(CREATE_CART, createSaga)
    yield takeEvery(GET_CART, getSaga)
    yield takeEvery(UPDATE_CART, updateSaga)
    yield takeEvery(DELETE_CART, deleteSaga)
}