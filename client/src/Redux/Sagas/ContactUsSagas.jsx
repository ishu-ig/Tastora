import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CONTACTUS, CREATE_CONTACTUS_RED, DELETE_CONTACTUS, DELETE_CONTACTUS_RED, GET_CONTACTUS, GET_CONTACTUS_RED, UPDATE_CONTACTUS, UPDATE_CONTACTUS_RED } from "../Constant";
import { createRecord, deleteRecord, getRecord,  updateRecord } from "./Services/ApiCallingService";
// import { createMultiPartRecord, deleteRecord, getRecord, updateMultiPartRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    let response = yield createRecord("contactus", action.payload)
    // let response = yield createMultiPartRecord("contactus", action.payload)
    yield put({ type: CREATE_CONTACTUS_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("contactus")
    yield put({ type: GET_CONTACTUS_RED, payload: response.data })
}

function* updateSaga(action) {
    yield updateRecord("contactus", action.payload)
    // yield updateMultiPartRecord("contactus", action.payload)
    yield put({ type: UPDATE_CONTACTUS_RED, payload: action.payload })
}
function* deleteSaga(action) {
    yield deleteRecord("contactus", action.payload)
    yield put({ type: DELETE_CONTACTUS_RED, payload: action.payload })
}
export default function* contactUsSaga() {
    yield takeEvery(CREATE_CONTACTUS, createSaga)
    yield takeEvery(GET_CONTACTUS, getSaga)
    yield takeEvery(UPDATE_CONTACTUS, updateSaga)
    yield takeEvery(DELETE_CONTACTUS, deleteSaga)
}