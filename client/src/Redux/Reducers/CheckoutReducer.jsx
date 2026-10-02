import { CREATE_CHECKOUT_RED, DELETE_CHECKOUT_RED, GET_CHECKOUT_RED, UPDATE_CHECKOUT_RED } from "../Constant";

export default function CheckoutReducer(state = [], action) {
    switch (action.type) {
        case CREATE_CHECKOUT_RED:
            return [...state, action.payload]

        case GET_CHECKOUT_RED:
            return action.payload

        // The old version mutated `state` and returned the same array, so
        // React-Redux saw no change and components never re-rendered.
        // Return a NEW array with a NEW object for the changed order.
        case UPDATE_CHECKOUT_RED:
            return state.map(x =>
                x._id === action.payload._id
                    ? {
                        ...x,
                        orderStatus: action.payload.orderStatus,
                        paymentMode: action.payload.paymentMode,
                        paymentStatus: action.payload.paymentStatus,
                        // schema field is `rppid` (the old code wrote `rippid`, which
                        // is not in the schema and was silently dropped)
                        rppid: action.payload.rppid,
                        deliveryBoy: action.payload.deliveryBoy ?? x.deliveryBoy,
                        isaccept: action.payload.isaccept ?? x.isaccept,
                    }
                    : x
            )

        case DELETE_CHECKOUT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}