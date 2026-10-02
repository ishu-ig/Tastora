import { put, takeEvery } from "redux-saga/effects";
import {
  CREATE_MEMBERSHIPPLAN,
  CREATE_MEMBERSHIPPLAN_RED,
  DELETE_MEMBERSHIPPLAN,
  DELETE_MEMBERSHIPPLAN_RED,
  GET_MEMBERSHIPPLAN,
  GET_MEMBERSHIPPLAN_RED,
  UPDATE_MEMBERSHIPPLAN,
  UPDATE_MEMBERSHIPPLAN_RED
} from "../Constant";

// Plans have no image, so we send JSON (createRecord / updateRecord),
// not multipart form data.
import {
  createRecord,
  deleteRecord,
  getRecord,
  updateRecord
} from "./Services/ApiCallingService";

// The backend answers { result: "Fail", reason } when it refuses something
// (duplicate name, plan still has active members, not an admin...).
function failMessage(response) {
  const reason = response?.reason;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") return Object.values(reason).join(", ");
  return "Something went wrong. Please try again.";
}

function* createSaga(action) {
  let response = yield createRecord("membershipplan", action.payload);
  if (response?.result === "Done") {
    yield put({ type: CREATE_MEMBERSHIPPLAN_RED, payload: response.data });
  } else {
    window.alert(failMessage(response));
  }
}

function* getSaga() {
  let response = yield getRecord("membershipplan");
  if (response?.result === "Done") {
    yield put({ type: GET_MEMBERSHIPPLAN_RED, payload: response.data });
  }
}

function* updateSaga(action) {
  let response = yield updateRecord("membershipplan", action.payload);
  if (response?.result === "Done") {
    yield put({ type: UPDATE_MEMBERSHIPPLAN_RED, payload: response.data });
  } else {
    window.alert(failMessage(response));
  }
}

function* deleteSaga(action) {
  let response = yield deleteRecord("membershipplan", action.payload);
  if (response?.result === "Done") {
    yield put({ type: DELETE_MEMBERSHIPPLAN_RED, payload: action.payload });
  } else {
    // e.g. "This plan has active members. Deactivate it instead of deleting."
    window.alert(failMessage(response));
  }
}

export default function* membershipPlanSagas() {
  yield takeEvery(CREATE_MEMBERSHIPPLAN, createSaga);
  yield takeEvery(GET_MEMBERSHIPPLAN, getSaga);
  yield takeEvery(UPDATE_MEMBERSHIPPLAN, updateSaga);
  yield takeEvery(DELETE_MEMBERSHIPPLAN, deleteSaga);
}