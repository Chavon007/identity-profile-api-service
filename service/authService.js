import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const stateStore = new Map();

export const getGithubRedirectUrl = () => {
  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, true);

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_url: process.env.GITHUB_CALLBACK_URL,
    scope: "user:email",
    state,
  });

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    state,
  };
};
