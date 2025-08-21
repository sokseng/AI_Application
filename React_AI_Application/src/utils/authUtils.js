import axiosInstance from "./axiosInstance";

export const getAccessToken = () => localStorage.getItem("access_token");

export const isTokenExpired = async (token) => {
  try {
    const resp = await axiosInstance.post("/user/verify_token", { token });
    return !resp.data;
  } catch {
    return true;
  }
};

export function clearTokens() {
  localStorage.removeItem("access_token");
}

export function logout() {
  clearTokens();
  window.location.href = "/"; // Redirect to login page
}