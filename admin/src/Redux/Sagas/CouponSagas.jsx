import { put, takeEvery } from "redux-saga/effects"
import {
    CREATE_COUPON, CREATE_COUPON_RED,
    DELETE_COUPON, DELETE_COUPON_RED,
    GET_COUPON, GET_COUPON_RED,
    UPDATE_COUPON, UPDATE_COUPON_RED,
} from "../Constant"
import {
    createRecord,
    deleteRecord,
    getRecord,
    updateRecord,
} from "./Services/ApiCallingService"

function* createSaga(action) {
    let response = yield createRecord("coupon", action.payload)
    yield put({ type: CREATE_COUPON_RED, payload: response.data })
}

function* getSaga() {
    let response = yield getRecord("coupon")
    yield put({ type: GET_COUPON_RED, payload: response.data })
}

function* updateSaga(action) {
    let response = yield updateRecord("coupon", action.payload)
    yield put({ type: UPDATE_COUPON_RED, payload: response.data })
}

function* deleteSaga(action) {
    yield deleteRecord("coupon", action.payload)
    yield put({ type: DELETE_COUPON_RED, payload: action.payload })
}

export default function* couponSaga() {
    yield takeEvery(CREATE_COUPON, createSaga)
    yield takeEvery(GET_COUPON, getSaga)
    yield takeEvery(UPDATE_COUPON, updateSaga)
    yield takeEvery(DELETE_COUPON, deleteSaga)
}
