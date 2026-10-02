import { put, takeEvery } from "redux-saga/effects";
import {
  CREATE_THALI,
  CREATE_THALI_RED,
  DELETE_THALI,
  DELETE_THALI_RED,
  GET_THALI,
  GET_THALI_RED,
  UPDATE_THALI,
  UPDATE_THALI_RED
} from "../Constant";

import {
  createMultiPartRecord,
  deleteRecord,
  getRecord,
  updateMultiPartRecord
} from "./Services/ApiCallingService";

function* createSaga(action) {
  let response = yield createMultiPartRecord("thali", action.payload);
  yield put({
    type: CREATE_THALI_RED,
    payload: response.data
  });
}

function* getSaga() {
  let response = yield getRecord("thali");
  yield put({
    type: GET_THALI_RED,
    payload: response.data
  });
}

function* updateSaga(action) {
  let response = yield updateMultiPartRecord("thali", action.payload);
  yield put({
    type: UPDATE_THALI_RED,
    payload: response.data
  });
}

function* deleteSaga(action) {
  yield deleteRecord("thali", action.payload);
  yield put({
    type: DELETE_THALI_RED,
    payload: action.payload
  });
}

export default function* thaliSagas() {
  yield takeEvery(CREATE_THALI, createSaga);
  yield takeEvery(GET_THALI, getSaga);
  yield takeEvery(UPDATE_THALI, updateSaga);
  yield takeEvery(DELETE_THALI, deleteSaga);
}