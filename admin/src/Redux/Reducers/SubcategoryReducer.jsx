import { CREATE_SUBCATEGORY_RED, DELETE_SUBCATEGORY_RED, GET_SUBCATEGORY_RED, UPDATE_SUBCATEGORY_RED } from "../Constant";

export default function SubcategoryReducer(state=[], action) {
    switch (action.type) {
        case CREATE_SUBCATEGORY_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_SUBCATEGORY_RED:
            return action.payload

        case UPDATE_SUBCATEGORY_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].maincategory = action.payload.maincategory
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_SUBCATEGORY_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
