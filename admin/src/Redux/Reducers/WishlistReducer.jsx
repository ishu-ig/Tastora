import { CREATE_WISHLIST_RED, DELETE_WISHLIST_RED, GET_WISHLIST_RED, UPDATE_WISHLIST_RED } from "../Constant";

export default function WishlistReducer(state=[], action) {
    switch (action.type) {
        case CREATE_WISHLIST_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_WISHLIST_RED:
            return action.payload

        case UPDATE_WISHLIST_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_WISHLIST_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
