import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CART, CREATE_CART_RED, DELETE_CART, DELETE_CART_RED, GET_CART, GET_CART_RED, UPDATE_CART, UPDATE_CART_RED } from "../Constant";
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Services/ApiCallingService";

function* createSaga(action) {
    const response = yield createRecord("cart", action.payload)
    if (response?.result === "Done") {
        yield put({ type: CREATE_CART_RED, payload: response.data })
    } else {
        console.error("Cart create failed:", response?.reason || response?.message || "Unknown error")
    }
}

function* getSaga(action) {
    const response = yield getRecord("cart", action.payload)
    if (response?.result === "Done") {
        yield put({ type: GET_CART_RED, payload: response.data })
    }
}

function* updateSaga(action) {
    const response = yield updateRecord("cart", action.payload)
    if (response?.result === "Fail") {
        console.error("Cart update failed:", response.reason)
        return
    }
    // Prefer the server's copy (it recalculates total), else fall back to the request.
    yield put({ type: UPDATE_CART_RED, payload: response?.data || action.payload })
}

function* deleteSaga(action) {
    const response = yield deleteRecord("cart", action.payload)
    if (response?.result === "Fail") {
        // "Record Not Found" means the item is already gone from the DB
        // (e.g. double-delete or already removed). Still clean up Redux state.
        const reason = response?.reason || response?.message || "";
        const alreadyGone =
            reason === "Record Not Found" ||
            String(reason).toLowerCase().includes("not found");
        if (!alreadyGone) {
            console.error("Cart delete failed:", reason);
            return;
        }
        // fall through — treat as success
    }
    yield put({ type: DELETE_CART_RED, payload: action.payload })
}

export default function* cartSaga() {
    yield takeEvery(CREATE_CART, createSaga)
    yield takeEvery(GET_CART, getSaga)
    yield takeEvery(UPDATE_CART, updateSaga)
    yield takeEvery(DELETE_CART, deleteSaga)
}