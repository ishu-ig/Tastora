import { put, takeEvery } from "redux-saga/effects";
import { CREATE_RESTURENT, CREATE_RESTURENT_RED, DELETE_RESTURENT, DELETE_RESTURENT_RED, GET_RESTURENT, GET_RESTURENT_RED, UPDATE_RESTURENT, UPDATE_RESTURENT_RED } from "../Constant";
// import { createRecord, deleteRecord, getRecord,  updateRecord } from "./Services/ApiCallingService";
import { createMultiPartRecord, deleteRecord, getRecord, updateMultiPartRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    // let response = yield createRecord("resturent", action.payload)
    let response = yield createMultiPartRecord("resturent", action.payload)
    yield put({ type: CREATE_RESTURENT_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("resturent")
    yield put({ type: GET_RESTURENT_RED, payload: response.data })
}

function* updateSaga(action) {
    // yield updateRecord("resturent", action.payload)
    // yield put({ type: UPDATE_RESTURENT_RED, payload: action.payload })
    let response = yield updateMultiPartRecord("resturent", action.payload)
    yield put({ type: UPDATE_RESTURENT_RED, payload: response.data })
}
function* deleteSaga(action) {
    yield deleteRecord("resturent", action.payload)
    yield put({ type: DELETE_RESTURENT_RED, payload: action.payload })
}
export default function* resturentSaga() {
    yield takeEvery(CREATE_RESTURENT, createSaga)
    yield takeEvery(GET_RESTURENT, getSaga)
    yield takeEvery(UPDATE_RESTURENT, updateSaga)
    yield takeEvery(DELETE_RESTURENT, deleteSaga)
}