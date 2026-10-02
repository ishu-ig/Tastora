import { CREATE_THALI_RED, DELETE_THALI_RED, GET_THALI_RED, UPDATE_THALI_RED } from "../Constant"
export default function ThaliReducer(state = [], action) {
    switch (action.type) {
        case CREATE_THALI_RED: {
            let newState = [...state]
            newState.unshift(action.payload)
            return newState
        }

        case GET_THALI_RED:
            return action.payload

        case UPDATE_THALI_RED: {
            let newState = [...state]
            let index = newState.findIndex(x => x._id === action.payload._id)
            if (index !== -1) {
                newState[index] = { ...newState[index], ...action.payload }
            }
            return newState
        }

        case DELETE_THALI_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}