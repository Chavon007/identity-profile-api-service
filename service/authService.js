import crypto from "crypto";
import dotenv from "dotenv";
import axios from "axios";
import userModel from "../model/userModel";
import { generateToken, generateRefreshToken } from "../utlis/token";
import refreshTokenModel from "../model/refreshTokenModel";

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

export const handlecallback = async (code, state) => {
  if (!stateStore.has(state)) {
    throw new Error("Invalid state parameter");
  }
  stateStore.delete(state);

  //   exchange code with access token

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_url: process.env.GITHUB_CALLBACK_URL,
    },
    {
      headers: { Accept: "application/json" },
    },
  );
  const gitHubAccessToken = tokenResponse.data.access_token;
  //   get user info from github
  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${gitHubAccessToken}` },
  });

  //   get email if not public

  let email = userResponse.data.email;
  if (!email) {
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${gitHubAccessToken}` },
      },
    );

    const primaryEmail = emailResponse.data.find(
      (e) => e.primary && e.verified,
    );
    email = primaryEmail?.email || null;
  }

  const githubUser = userResponse.data;

  //   upsert user
  let user = await userModel.findOne({ github_id: String(githubUser.id) });

  if (!user) {
    user = await userModel.create({
      github_id: String(githubUser.id),
      username: githubUser.login,
      email,
      avatar_url: githubUser.avatar_url,
      last_login_at: new Date(),
    });
  } else {
    user.last_login_at = new Date();
    user.avatar_url = githubUser.avatar_url;
    await user.save();
  }

  if (!user.is_active) {
    throw new Error("Account is not active");
  }

  //   Generate token for user
  const accessToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);

  //   hash and store refresh token

  const hashed = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await refreshTokenModel.create({
    user_id: user._id,
    token_hashed: hashed,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  return { user, accessToken, refreshTokenModel: newRefreshToken };
};
