import { CREATE_COMBO_RED, DELETE_COMBO_RED, GET_COMBO_RED, UPDATE_COMBO_RED } from "../Constant";

export default function ComboReducer(state = [], action) {
    switch (action.type) {
        case CREATE_COMBO_RED:
            return [...state, action.payload]

        case GET_COMBO_RED:
            return action.payload

        case UPDATE_COMBO_RED:
            return state.map(x =>
                x._id === action.payload._id
                    ? {
                        ...x,
                        name: action.payload.name,
                        items: action.payload.items,
                        description: action.payload.description,
                        price: action.payload.price,
                        image: action.payload.image,
                        products: action.payload.products,
                    }
                    : x
            )

        case DELETE_COMBO_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}