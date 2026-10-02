import {
    CREATE_COUPON_RED,
    DELETE_COUPON_RED,
    GET_COUPON,
    GET_COUPON_RED,
    UPDATE_COUPON_RED,
    VALIDATE_COUPON,
    VALIDATE_COUPON_RED,
} from "../Constant"

const initialState = {
    coupons: [],
    couponsLoaded: false,
    couponsLoading: false,
    validationResult: null, // { valid, discountAmount, couponId, code } | { result:'Fail', reason }
    validationLoading: false,
}

export default function CouponReducer(state = initialState, action) {
    switch (action.type) {
        case GET_COUPON:
            return {
                ...state,
                couponsLoading: true,
            }

        case CREATE_COUPON_RED:
            return {
                ...state,
                coupons: [action.payload, ...state.coupons],
            }

        case GET_COUPON_RED:
            return {
                ...state,
                coupons: Array.isArray(action.payload) ? action.payload : [],
                couponsLoaded: true,
                couponsLoading: false,
            }

        case UPDATE_COUPON_RED:
            return {
                ...state,
                coupons: state.coupons.map(x =>
                    x._id === action.payload._id ? action.payload : x
                ),
            }

        case DELETE_COUPON_RED:
            return {
                ...state,
                coupons: state.coupons.filter(x => x._id !== action.payload._id),
            }

        case VALIDATE_COUPON:
            return {
                ...state,
                validationResult: null,
                validationLoading: true,
            }

        case VALIDATE_COUPON_RED:
            return {
                ...state,
                validationResult: action.payload,
                validationLoading: false,
            }

        default:
            return state
    }
}
