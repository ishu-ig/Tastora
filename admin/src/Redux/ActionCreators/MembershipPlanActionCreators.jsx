import { CREATE_MEMBERSHIPPLAN, DELETE_MEMBERSHIPPLAN, GET_MEMBERSHIPPLAN, UPDATE_MEMBERSHIPPLAN } from "../Constant"

export function createMembershipPlan(data) {
    return {
        type: CREATE_MEMBERSHIPPLAN,
        payload: data
    }
}

export function getMembershipPlan() {
    return {
        type: GET_MEMBERSHIPPLAN
    }
}

export function updateMembershipPlan(data) {
    return {
        type: UPDATE_MEMBERSHIPPLAN,
        payload: data
    }
}

export function deleteMembershipPlan(data) {
    return {
        type: DELETE_MEMBERSHIPPLAN,
        payload: data
    }
}