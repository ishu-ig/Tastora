import { CREATE_MEMBERSHIP, DELETE_MEMBERSHIP, GET_MEMBERSHIP, UPDATE_MEMBERSHIP } from "../Constant"

export function createMembership(data) {
    return {
        type: CREATE_MEMBERSHIP,
        payload: data
    }
}

export function getMembership() {
    return {
        type: GET_MEMBERSHIP
    }
}

export function updateMembership(data) {
    return {
        type: UPDATE_MEMBERSHIP,
        payload: data
    }
}

export function deleteMembership(data) {
    return {
        type: DELETE_MEMBERSHIP,
        payload: data
    }
}