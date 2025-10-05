const KEY = "tyb_user";
const TOKEN = "tyb_token";

export function isAuthed() {
  try { return !!localStorage.getItem(KEY) && !!localStorage.getItem(TOKEN); }
  catch { return false; }
}

export function saveAuth({ user, token }) {
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN, token);
}

export function readUser() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(TOKEN);
}
