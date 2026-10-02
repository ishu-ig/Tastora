import { CREATE_BOOKING, DELETE_BOOKING, GET_BOOKING, UPDATE_BOOKING } from "../Constant";

export function createBooking(data) {
    return {
        type: CREATE_BOOKING,
        payload: data
    }
}

export function getBooking() {
    return {
        type: GET_BOOKING
    }
}

export function updateBooking(data) {
    return {
        type: UPDATE_BOOKING,
        payload: data
    }
}

export function deleteBooking(data) {
    return {
        type: DELETE_BOOKING,
        payload: data
    }
}