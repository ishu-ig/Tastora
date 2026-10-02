import api from "@/lib/axiosInstance";

function getAuthToken() {
    if (typeof window === "undefined") return "";

    try {
        const localToken = localStorage.getItem("token");
        if (localToken) return localToken;

        const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
    } catch (e) {
        console.error("Error reading auth token:", e);
    }

    return "";
}

function getHeaders(isMultiPart = false) {
    const token = getAuthToken();
    const headers = {};
    if (token) {
        headers["authorization"] = token;
        headers["Authorization"] = token;
    }
    if (isMultiPart) {
        headers["Content-Type"] = "multipart/form-data";
    } else {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

export async function createRecord(collection, payload) {
    try {
        const response = await api.post(`/${collection}`, payload, {
            headers: getHeaders(false),
        });
        return response.data;
    } catch (error) {
        console.error(`Error in createRecord (${collection}):`, error?.response?.data || error.message);
        return error?.response?.data || { result: "Fail", message: error.message };
    }
}

export async function createMultiPartRecord(collection, payload) {
    try {
        const response = await api.post(`/${collection}`, payload, {
            headers: getHeaders(true),
        });
        return response.data;
    } catch (error) {
        console.error(`Error in createMultiPartRecord (${collection}):`, error?.response?.data || error.message);
        return error?.response?.data || { result: "Fail", message: error.message };
    }
}

export async function getRecord(collection, requestedUserId = "") {
    try {
        let endpoint = `/${collection}`;

        const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userid") : "";
        const userIdCookie = typeof document !== "undefined"
            ? document.cookie.match(/(?:^|;\s*)userid=([^;]+)/)?.[1]
            : "";
        const userId = requestedUserId || storedUserId || (userIdCookie ? decodeURIComponent(userIdCookie) : "");
        const role = typeof window !== "undefined" ? localStorage.getItem("role") : "";

        if (collection === "cart" || collection === "wishlist") {
            if (!userId) return { result: "Done", data: [] };
            // Use explicit /user/:userid route to hit getRecord (not getSingleRecord)
            endpoint = `/${collection}/user/${encodeURIComponent(userId)}`;
        } else if (
            (collection === "checkout" || collection === "booking") &&
            role === "Buyer"
        ) {
            endpoint = `/${collection}/user/${userId}`;
        }

        const response = await api.get(endpoint, {
            headers: getHeaders(false),
        });
        return response.data;
    } catch (error) {
        console.error(`Error in getRecord (${collection}):`, error?.response?.data || error.message);
        return error?.response?.data || { result: "Fail", data: [] };
    }
}

export async function updateRecord(collection, payload) {
    try {
        const response = await api.put(`/${collection}/${payload._id}`, payload, {
            headers: getHeaders(false),
        });
        return response.data;
    } catch (error) {
        console.error(`Error in updateRecord (${collection}):`, error?.response?.data || error.message);
        return error?.response?.data || { result: "Fail", message: error.message };
    }
}

export async function updateMultiPartRecord(collection, payload) {
    try {
        const id = typeof payload.get === "function" ? payload.get("_id") : payload._id;
        const response = await api.put(`/${collection}/${id}`, payload, {
            headers: getHeaders(true),
        });
        return response.data;
    } catch (error) {
        console.error(`Error in updateMultiPartRecord (${collection}):`, error?.response?.data || error.message);
        return error?.response?.data || { result: "Fail", message: error.message };
    }
}

export async function deleteRecord(collection, payload) {
    try {
        const id = payload?._id;
        if (!id) {
            console.warn(`deleteRecord (${collection}): no _id in payload, skipping.`);
            return { result: "Fail", reason: "No ID provided" };
        }
        const response = await api.delete(`/${collection}/${id}`, {
            headers: getHeaders(false),
        });
        return response.data;
    } catch (error) {
        // Axios rejects on 4xx/5xx – the server body lives in error.response.data.
        // Return it so callers can inspect result/reason (e.g. "Record Not Found").
        const serverBody = error?.response?.data;
        if (serverBody && typeof serverBody === "object") return serverBody;
        console.error(`Error in deleteRecord (${collection}):`, error.message);
        return { result: "Fail", message: error.message };
    }
}