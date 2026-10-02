import { CREATE_MEMBERSHIP_RED, DELETE_MEMBERSHIP_RED, GET_MEMBERSHIP_RED, UPDATE_MEMBERSHIP_RED } from "../Constant"

export default function MembershipReducer(state = [], action) {
    switch (action.type) {
        case CREATE_MEMBERSHIP_RED:
            return [action.payload, ...state]

        case GET_MEMBERSHIP_RED:
            return action.payload

        case UPDATE_MEMBERSHIP_RED:
            return state.map((x) => (x._id === action.payload._id ? { ...x, ...action.payload } : x))

        case DELETE_MEMBERSHIP_RED:
            return state.filter((x) => x._id !== action.payload._id)

        default:
            return state
    }
}