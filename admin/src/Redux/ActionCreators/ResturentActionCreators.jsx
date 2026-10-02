import { CREATE_RESTURENT, DELETE_RESTURENT, GET_RESTURENT, UPDATE_RESTURENT } from "../Constant";

export function createResturent(data) {
    return {
        type: CREATE_RESTURENT,
        payload: data
    }
}

export function getResturent() {
    return {
        type: GET_RESTURENT
    }
}

export function updateResturent(data) {
    return {
        type: UPDATE_RESTURENT,
        payload: data
    }
}

export function deleteResturent(data) {
    return {
        type: DELETE_RESTURENT,
        payload: data
    }
}