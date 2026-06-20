const TOKEN_KEY = "fx-token";
const USER_KEY = "fx-user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("fx-chat-user");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`/v1${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      (data.errors?.[0]?.message) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { username, password },
  });
  setAuth(data.token, data.user);
  return data;
}

export async function register({ name, username, email, password }) {
  const data = await request("/auth/register", {
    method: "POST",
    body: { name, username, email, password },
  });
  setAuth(data.token, data.user);
  return data;
}

export async function loginWithGoogle(credential) {
  const data = await request("/auth/google", {
    method: "POST",
    body: { credential },
  });
  setAuth(data.token, data.user);
  return data;
}

export async function fetchMe() {
  return request("/auth/me");
}

export async function fetchPosts({ page = 1, limit = 10, category, search, userId } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (userId) params.set("userId", userId);
  return request(`/posts?${params}`);
}

export async function createPost({ title, body, tags, imageUrl, published = true }) {
  return request("/posts", {
    method: "POST",
    body: { title, body, tags, imageUrl, published },
  });
}

import { uploadToSupabase } from "./supabase.js";

export async function uploadImage(fileOrBase64) {
  if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
    const file =
      fileOrBase64 instanceof File
        ? fileOrBase64
        : new File([fileOrBase64], "upload.jpg", { type: fileOrBase64.type || "image/jpeg" });
    return uploadToSupabase(file);
  }

  return request("/upload/image", {
    method: "POST",
    body: { image: fileOrBase64 },
  });
}

export async function updateProfile(updates) {
  return request("/users/", { method: "PATCH", body: updates });
}

export async function fetchUser(id) {
  return request(`/users/${id}`);
}

export async function fetchUsers() {
  return request("/users");
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

export async function fetchUserPosts(userId) {
  return request(`/users/${userId}/posts`);
}

export async function fetchInvites(userId) {
  return request(`/users/${userId}/invites`);
}

export async function acceptInvite(code) {
  return request("/invites/accept", { method: "POST", body: { code } });
}

export async function declineInvite(code) {
  return request("/invites/decline", { method: "POST", body: { code } });
}

export async function likePost(postId) {
  return request(`/posts/${postId}/likes`, { method: "POST" });
}

export async function createReply(postId, body) {
  return request(`/posts/${postId}/replies`, { method: "POST", body: { body } });
}

export default {
  login,
  register,
  loginWithGoogle,
  fetchMe,
  fetchPosts,
  createPost,
  uploadImage,
  updateProfile,
  fetchUser,
  fetchUsers,
  deleteUser,
  fetchUserPosts,
  fetchInvites,
  acceptInvite,
  declineInvite,
  likePost,
  createReply,
  getToken,
  getStoredUser,
  setAuth,
  clearAuth,
};
