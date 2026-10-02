import {
    CREATE_COUPON,
    DELETE_COUPON,
    GET_COUPON,
    UPDATE_COUPON,
    VALIDATE_COUPON,
} from "../Constant"

export function createCoupon(data) {
    return { type: CREATE_COUPON, payload: data }
}

export function getCoupon() {
    return { type: GET_COUPON }
}

export function updateCoupon(data) {
    return { type: UPDATE_COUPON, payload: data }
}

export function deleteCoupon(data) {
    return { type: DELETE_COUPON, payload: data }
}

export function validateCoupon(data) {
    return { type: VALIDATE_COUPON, payload: data }
}
