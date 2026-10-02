import { CREATE_COMBO, DELETE_COMBO, GET_COMBO, UPDATE_COMBO } from "../Constant";

export function createCombo(data) {
    return {
        type: CREATE_COMBO,
        payload: data
    }
}

export function getCombo() {
    return {
        type: GET_COMBO
    }
}

export function updateCombo(data) {
    return {
        type: UPDATE_COMBO,
        payload: data
    }
}

export function deleteCombo(data) {
    return {
        type: DELETE_COMBO,
        payload: data
    }
}