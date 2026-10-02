import { CREATE_THALI, DELETE_THALI, GET_THALI, UPDATE_THALI } from "../Constant"

export function createThali(data) {
    return {
        type: CREATE_THALI,
        payload: data
    }
}

export function getThali() {
    return {
        type: GET_THALI
    }
}

export function updateThali(data) {
    return {
        type: UPDATE_THALI,
        payload: data
    }
}

export function deleteThali(data) {
    return {
        type: DELETE_THALI,
        payload: data
    }
}