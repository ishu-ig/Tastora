import { CREATE_BOOKING_RED, DELETE_BOOKING_RED, GET_BOOKING_RED, UPDATE_BOOKING_RED } from "../Constant";

export default function BookingReducer(state=[], action) {
    switch (action.type) {
        case CREATE_BOOKING_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_BOOKING_RED:
            return action.payload

        case UPDATE_BOOKING_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].qty = action.payload.qty
            state[index].total = action.payload.total
            return state

        case DELETE_BOOKING_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
