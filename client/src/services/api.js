const TOKEN_KEY = "fx-token";
const USER_KEY = "fx-user";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/v1${normalized}`;
}

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

  const res = await fetch(apiUrl(path), { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const validationMsg = data.errors?.map((e) => e.message).filter(Boolean).join(". ");
    const msg =
      data.message ||
      data.error ||
      validationMsg ||
      "Request failed";
    const err = new Error(msg);
    if (data.code) err.code = data.code;
    if (data.email) err.email = data.email;
    throw err;
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
  return request("/auth/register", {
    method: "POST",
    body: { name, username, email, password },
  });
}

export async function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword({ token, password }) {
  return request("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export async function fetchMe() {
  return request("/auth/me");
}

export async function fetchPosts({ page = 1, limit = 10, category, search, userId, feed } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (userId) params.set("userId", String(userId));
  if (feed) params.set("feed", feed);
  return request(`/posts?${params}`);
}

export async function createPost({
  title,
  body,
  tags,
  imageUrl,
  attachmentUrl,
  attachmentType,
  attachmentName,
  published = true,
}) {
  return request("/posts", {
    method: "POST",
    body: { title, body, tags, imageUrl, attachmentUrl, attachmentType, attachmentName, published },
  });
}

import { uploadToSupabase } from "./supabase.js";

export async function uploadProjectFile(file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(apiUrl("/upload/file"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || "Upload failed");
  }
  return data;
}

export async function uploadAvatar(file) {
  const token = getToken();
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(apiUrl("/upload/image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || "Upload failed");
  }
  return data;
}

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

export async function followUser(userId) {
  return request(`/users/${userId}/follow`, { method: "POST" });
}

export async function unfollowUser(userId) {
  return request(`/users/${userId}/follow`, { method: "DELETE" });
}

export async function fetchUsers({ page = 1, limit = 30, discover = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (discover) params.set("discover", "true");
  return request(`/users?${params}`);
}

export async function fetchCreators({ page = 1, limit = 30 } = {}) {
  return fetchUsers({ page, limit, discover: true });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

export async function fetchUserFollowers(userId, { page = 1, limit = 30 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/users/${userId}/followers?${params}`);
}

export async function fetchUserFollowing(userId, { page = 1, limit = 30 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/users/${userId}/following?${params}`);
}

export async function fetchUserPosts(userId, { page = 1, limit = 30 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/users/${userId}/posts?${params}`);
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

export async function fetchPostFeedbackRoom(postId) {
  return request(`/posts/${postId}/feedback-room`);
}

export async function likePost(postId, emoji = "👍") {
  return request(`/posts/${postId}/likes`, {
    method: "POST",
    body: { emoji },
  });
}

export async function createReply(postId, body) {
  return request(`/posts/${postId}/replies`, { method: "POST", body: { body } });
}

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  fetchMe,
  fetchPosts,
  createPost,
  uploadProjectFile,
  uploadAvatar,
  uploadImage,
  updateProfile,
  fetchUser,
  fetchUserFollowers,
  fetchUserFollowing,
  fetchUsers,
  fetchCreators,
  deleteUser,
  fetchUserPosts,
  fetchInvites,
  acceptInvite,
  declineInvite,
  likePost,
  followUser,
  unfollowUser,
  createReply,
  getToken,
  getStoredUser,
  setAuth,
  clearAuth,
};
