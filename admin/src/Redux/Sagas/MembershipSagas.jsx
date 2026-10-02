import { put, takeEvery } from "redux-saga/effects";
import {
  CREATE_MEMBERSHIP,
  CREATE_MEMBERSHIP_RED,
  DELETE_MEMBERSHIP,
  DELETE_MEMBERSHIP_RED,
  GET_MEMBERSHIP,
  GET_MEMBERSHIP_RED,
  UPDATE_MEMBERSHIP,
  UPDATE_MEMBERSHIP_RED
} from "../Constant";

import {
  createRecord,
  deleteRecord,
  getRecord,
  updateRecord
} from "./Services/ApiCallingService";

function failMessage(response) {
  const reason = response?.reason;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") return Object.values(reason).join(", ");
  return "Something went wrong. Please try again.";
}

// NOTE: the backend has no POST /membership or DELETE /membership/:id.
// Customers buy through POST /membership/order and /membership/verify
// (Razorpay), and admins only list and cancel. create/delete are kept
// here only so the action creators you already have still work.
function* createSaga(action) {
  let response = yield createRecord("membership", action.payload);
  if (response?.result === "Done") {
    yield put({ type: CREATE_MEMBERSHIP_RED, payload: response.data });
  } else {
    window.alert(failMessage(response));
  }
}

function* getSaga() {
  let response = yield getRecord("membership");
  if (response?.result === "Done") {
    yield put({ type: GET_MEMBERSHIP_RED, payload: response.data });
  }
}

// Used by the admin Cancel button: payload = { _id, status: "canceled" }
function* updateSaga(action) {
  let response = yield updateRecord("membership", action.payload);
  if (response?.result === "Done") {
    yield put({ type: UPDATE_MEMBERSHIP_RED, payload: response.data });
  } else {
    window.alert(failMessage(response));
  }
}

function* deleteSaga(action) {
  let response = yield deleteRecord("membership", action.payload);
  if (response?.result === "Done") {
    yield put({ type: DELETE_MEMBERSHIP_RED, payload: action.payload });
  } else {
    window.alert(failMessage(response));
  }
}

export default function* membershipSagas() {
  yield takeEvery(CREATE_MEMBERSHIP, createSaga);
  yield takeEvery(GET_MEMBERSHIP, getSaga);
  yield takeEvery(UPDATE_MEMBERSHIP, updateSaga);
  yield takeEvery(DELETE_MEMBERSHIP, deleteSaga);
}