import { CREATE_MAINCATEGORY_RED, DELETE_MAINCATEGORY_RED, GET_MAINCATEGORY_RED, UPDATE_MAINCATEGORY_RED } from "../Constant";

export default function MaincategoryReducer(state=[], action) {
    switch (action.type) {
        case CREATE_MAINCATEGORY_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_MAINCATEGORY_RED:
            return action.payload

        case UPDATE_MAINCATEGORY_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_MAINCATEGORY_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
