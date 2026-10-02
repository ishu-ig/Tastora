/**
 * Cookie utilities for client-side cookie management and auth state.
 */

export function setCookie(name, value, days = 15) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value ?? "")}${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const val = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function setAuthCookies(data, token) {
  const days = 15;
  setCookie("islogin", "true", days);
  setCookie("login", "true", days);
  if (data?._id) setCookie("userid", data._id, days);
  if (data?.role) setCookie("role", data.role.toLowerCase(), days);
  if (data?.name) setCookie("name", data.name, days);
  if (token) setCookie("token", token, days);
}

export function clearAuthCookies() {
  deleteCookie("islogin");
  deleteCookie("login");
  deleteCookie("userid");
  deleteCookie("role");
  deleteCookie("name");
  deleteCookie("token");
  try {
    localStorage.removeItem("login");
    localStorage.removeItem("name");
    localStorage.removeItem("userid");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
  } catch (err) {
    console.error("Error clearing localStorage:", err);
  }
}

export function getAuthUser() {
  const isLogin =
    getCookie("islogin") === "true" ||
    getCookie("login") === "true" ||
    localStorage.getItem("login") === "true";

  const userId =
    getCookie("userid") ||
    localStorage.getItem("userid") ||
    "";

  const role = (
    getCookie("role") ||
    localStorage.getItem("role") ||
    ""
  ).toLowerCase();

  const name =
    getCookie("name") ||
    localStorage.getItem("name") ||
    "";

  const token =
    getCookie("token") ||
    localStorage.getItem("token") ||
    "";

  return { isLogin, userId, role, name, token };
}
