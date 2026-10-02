import { put, takeEvery } from "redux-saga/effects";
import { CREATE_BOOKING, CREATE_BOOKING_RED, DELETE_BOOKING, DELETE_BOOKING_RED, GET_BOOKING, GET_BOOKING_RED, UPDATE_BOOKING, UPDATE_BOOKING_RED } from "../Constant";
import { createRecord, deleteRecord, getRecord,  updateRecord } from "./Services/ApiCallingService";
// import { createMultiPartRecord, deleteRecord, getRecord, updateMultiPartRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    let response = yield createRecord("booking", action.payload)
    // let response = yield createMultiPartRecord("booking", action.payload)
    yield put({ type: CREATE_BOOKING_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("booking")
    yield put({ type: GET_BOOKING_RED, payload: response.data })
}

function* updateSaga(action) {
    yield updateRecord("booking", action.payload)
    // yield updateMultiPartRecord("booking", action.payload)
    yield put({ type: UPDATE_BOOKING_RED, payload: action.payload })
}
function* deleteSaga(action) {
    yield deleteRecord("booking", action.payload)
    yield put({ type: DELETE_BOOKING_RED, payload: action.payload })
}
export default function* bookingSaga() {
    yield takeEvery(CREATE_BOOKING, createSaga)
    yield takeEvery(GET_BOOKING, getSaga)
    yield takeEvery(UPDATE_BOOKING, updateSaga)
    yield takeEvery(DELETE_BOOKING, deleteSaga)
}