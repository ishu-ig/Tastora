import {
    CREATE_THALI_RED,
    DELETE_THALI_RED,
    GET_THALI_RED,
    UPDATE_THALI_RED,
} from "../Constant";

export default function ThaliReducer(state = [], action) {
    switch (action.type) {
        case CREATE_THALI_RED:
            // Guard: the list page may already have fetched the new thali
            if (state.some((x) => x._id === action.payload._id)) return state;
            return [action.payload, ...state];

        case GET_THALI_RED:
            return action.payload;

        case UPDATE_THALI_RED:
            // New array + new object so components re-render
            return state.map((x) =>
                x._id === action.payload._id ? { ...x, ...action.payload } : x
            );

        case DELETE_THALI_RED:
            return state.filter((x) => x._id !== action.payload._id);

        default:
            return state;
    }
}