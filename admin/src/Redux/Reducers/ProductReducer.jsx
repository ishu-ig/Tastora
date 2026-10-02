import { CREATE_PRODUCT_RED, DELETE_PRODUCT_RED, GET_PRODUCT_RED, UPDATE_PRODUCT_RED } from "../Constant";

export default function ProductReducer(state=[], action) {
    switch (action.type) {
        case CREATE_PRODUCT_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_PRODUCT_RED:
            return action.payload

        case UPDATE_PRODUCT_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].maincategory = action.payload.maincategory
            state[index].subcategory = action.payload.subcategory
            state[index].resturent = action.payload.resturent
            state[index].basePrice = action.payload.basePrice
            state[index].discount = action.payload.discount
            state[index].finalPrice = action.payload.finalPrice
            state[index].availability = action.payload.availability
            state[index].description = action.payload.description
            state[index].rating = action.payload.rating
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_PRODUCT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
