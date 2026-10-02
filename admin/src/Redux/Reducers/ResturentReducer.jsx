import { CREATE_RESTURENT_RED, DELETE_RESTURENT_RED, GET_RESTURENT_RED, UPDATE_RESTURENT_RED } from "../Constant";

export default function ResturentReducer(state=[], action) {
    switch (action.type) {
        case CREATE_RESTURENT_RED:
            let newstate = [...state]
            newstate.push(action.payload)
            return newstate

        case GET_RESTURENT_RED:
            return action.payload

        case UPDATE_RESTURENT_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].phone = action.payload.phone
            state[index].pic = action.payload.pic
            state[index].seatAvailable = action.payload.seatAvailable
            state[index].reservationPrice = action.payload.reservationPrice
            state[index].discount = action.payload.discount
            state[index].finalPrice = action.payload.finalPrice
            state[index].maincategory = action.payload.maincategory
            state[index].subcategory = action.payload.subcategory
            state[index].rating = action.payload.rating
            state[index].address = action.payload.address
            state[index].status = action.payload.status
            state[index].active = action.payload.active
            state[index].openTime = action.payload.openTime
            state[index].closeTime = action.payload.closeTime
            return state

        case DELETE_RESTURENT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
