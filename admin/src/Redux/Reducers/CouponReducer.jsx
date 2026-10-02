import {
    CREATE_COUPON_RED,
    DELETE_COUPON_RED,
    GET_COUPON_RED,
    UPDATE_COUPON_RED,
} from "../Constant"

const initialState = []

export default function CouponReducer(state = initialState, action) {
    switch (action.type) {
        case CREATE_COUPON_RED:
            return [action.payload, ...state]

        case GET_COUPON_RED:
            return action.payload

        case UPDATE_COUPON_RED:
            return state.map(x =>
                x._id === action.payload._id ? action.payload : x
            )

        case DELETE_COUPON_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
