import { CREATE_MEMBERSHIPPLAN_RED, DELETE_MEMBERSHIPPLAN_RED, GET_MEMBERSHIPPLAN_RED, UPDATE_MEMBERSHIPPLAN_RED } from "../Constant"

export default function MembershipPlanReducer(state = [], action) {
    switch (action.type) {
        case CREATE_MEMBERSHIPPLAN_RED:
            return [action.payload, ...state]

        case GET_MEMBERSHIPPLAN_RED:
            return action.payload

        case UPDATE_MEMBERSHIPPLAN_RED:
            return state.map((x) => (x._id === action.payload._id ? { ...x, ...action.payload } : x))

        case DELETE_MEMBERSHIPPLAN_RED:
            return state.filter((x) => x._id !== action.payload._id)

        default:
            return state
    }
}