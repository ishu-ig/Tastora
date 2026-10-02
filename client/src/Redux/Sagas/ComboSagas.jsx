import { put, takeEvery } from "redux-saga/effects";
import { CREATE_COMBO, CREATE_COMBO_RED, DELETE_COMBO, DELETE_COMBO_RED, GET_COMBO, GET_COMBO_RED, UPDATE_COMBO, UPDATE_COMBO_RED } from "../Constant";
// import { createRecord, deleteRecord, getRecord,  updateRecord } from "./Services/ApiCallingService";
import { createMultiPartRecord, deleteRecord, getRecord, updateMultiPartRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    // let response = yield createRecord("subcategory", action.payload)
    let response = yield createMultiPartRecord("combo", action.payload)
    yield put({ type: CREATE_COMBO_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("combo")
    yield put({ type: GET_COMBO_RED, payload: response.data })
}

function* updateSaga(action) {
    // yield updateRecord("subcategory", action.payload)
    // yield put({ type: UPDATE_SUBCATEGORY_RED, payload: action.payload })
    let response = yield updateMultiPartRecord("combo", action.payload)
    yield put({ type: UPDATE_COMBO_RED, payload: response.data })
}
function* deleteSaga(action) {
    yield deleteRecord("combo", action.payload)
    yield put({ type: DELETE_COMBO_RED, payload: action.payload })
}
export default function* comboSaga() {
    yield takeEvery(CREATE_COMBO, createSaga)
    yield takeEvery(GET_COMBO, getSaga)
    yield takeEvery(UPDATE_COMBO, updateSaga)
    yield takeEvery(DELETE_COMBO, deleteSaga)
}