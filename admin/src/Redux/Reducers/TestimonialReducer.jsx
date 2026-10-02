import { CREATE_TESTIMONIAL_RED, DELETE_TESTIMONIAL_RED, GET_TESTIMONIAL_RED, UPDATE_TESTIMONIAL_RED } from "../Constant";

export default function TestimonialReducer(state=[], action) {
    switch (action.type) {
        case CREATE_TESTIMONIAL_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_TESTIMONIAL_RED:
            return action.payload

        case UPDATE_TESTIMONIAL_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_TESTIMONIAL_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
