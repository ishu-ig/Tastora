import { getAuthUser } from "../../../util/cookie";

function getAuthToken() {
    return getAuthUser().token || localStorage.getItem("token") || "";
}

export async function createRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthToken()
            },
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function createMultiPartRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "authorization": getAuthToken()
            },
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function getRecord(collection) {
    try {
        let url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`

        if (collection === "cart" || collection === "wishlist") {
            url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${localStorage.getItem("userid")}`
        }
        else if (
            (collection === "checkout" || collection === "booking") &&
            localStorage.getItem("role") === "Buyer"
        ) {
            url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/user/${localStorage.getItem("userid")}`
        }

        let response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthToken()
            }
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function updateRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${payload._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthToken()
            },
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function updateMultiPartRecord(collection, payload) {
    try {
        const id = typeof payload.get === "function" ? payload.get("_id") : payload._id;
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "authorization": getAuthToken()
            },
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function deleteRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${payload._id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthToken()
            }
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}