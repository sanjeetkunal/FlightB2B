import { api, hasApi } from "./client";

export { hasApi }; // re-export

// expected response { token: "jwt", user: { email, name, ... } }
export async function loginAPI(email, password) {
  return api("/auth/login", { method: "POST", body: { email, password } });
}
