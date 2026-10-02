import { CREATE_CONTACTUS_RED, DELETE_CONTACTUS_RED, GET_CONTACTUS_RED, UPDATE_CONTACTUS_RED } from "../Constant";

export default function ContactUsReducer(state=[], action) {
    switch (action.type) {
        case CREATE_CONTACTUS_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_CONTACTUS_RED:
            return action.payload

        case UPDATE_CONTACTUS_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_CONTACTUS_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
