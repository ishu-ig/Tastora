import { CREATE_BANNER, DELETE_BANNER, GET_BANNER, UPDATE_BANNER } from "../Constant"

export function createBanner(data) {
    return {
        type: CREATE_BANNER,
        payload: data
    }
}

export function getBanner() {
    return {
        type: GET_BANNER
    }
}

export function updateBanner(data) {
    return {
        type: UPDATE_BANNER,
        payload: data
    }
}

export function deleteBanner(data) {
    return {
        type: DELETE_BANNER,
        payload: data
    }
}