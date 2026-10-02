import { CREATE_CART_RED, DELETE_CART_RED, GET_CART_RED, UPDATE_CART_RED } from "../Constant";

export default function CartReducer(state = [], action) {
    switch (action.type) {
        case CREATE_CART_RED: {
            const item = action.payload
            if (!item?._id) return state
            const index = state.findIndex(x => x._id === item._id)
            // The server merges duplicates and returns the existing line,
            // so replace it instead of pushing a second copy.
            if (index === -1) return [...state, item]
            const next = [...state]
            next[index] = item
            return next
        }

        case GET_CART_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_CART_RED: {
            const targetId = action.payload?._id;
            if (!targetId) return state;

            let changed = false;
            const nextState = state.map((x) => {
                if (x._id !== targetId) return x;

                const merged = { ...x, ...action.payload };
                const same =
                    merged.qty === x.qty &&
                    merged.total === x.total &&
                    merged.variant === x.variant;

                if (same) return x;

                changed = true;
                return merged;
            });

            return changed ? nextState : state;
        }

        case DELETE_CART_RED:
            return state.filter(x => x._id !== action.payload?._id)

        default:
            return state
    }
}