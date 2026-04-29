import Csrf from "csrf";
import {
  getGithubRedirectUrl,
  handlecallback,
  refresh,
  logoutUser,
} from "../service/authService.js";

const csrf = new Csrf();

export const redirectToGitHub = (req, res) => {
  const { code_challenge, code_challenge_method } = req.query;
  const { url } = getGithubRedirectUrl(code_challenge, code_challenge_method);
  res.redirect(url);
};

export const handleGithubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing code or state" });
    }

    const { user, accessToken, refreshToken } = await handlecallback(
      code,
      state,
    );

    // Check if request is from browser or CLI
    const acceptsHtml = req.headers.accept?.includes("text/html");

    if (acceptsHtml) {
      // Browser — redirect to Next.js callback route to set cookies
      return res.redirect(
        `https://insighta-web-vert.vercel.app/api/auth/callback?token=${accessToken}&refresh_token=${refreshToken}`
      );
    }

    // CLI — return JSON
    return res.status(200).json({
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    if (err.message === "ACCOUNT_INACTIVE") {
      return res
        .status(403)
        .json({ status: "error", message: "Account is deactivated" });
    }
    return res.status(500).json({ status: "error", message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.body.refresh_token || req.cookies.refresh_token;

    if (!token) {
      return res
        .status(400)
        .json({ status: "error", message: "Refresh token required" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await refresh(token);

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 60 * 1000,
      sameSite: "none",
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000,
      sameSite: "none",
    });

    return res.status(200).json({
      status: "success",
      access_token: accessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ status: "error", message: err.message });
  }
};

export const getCsrfToken = async (req, res) => {
  try {
    const secret = await csrf.secret();
    const token = csrf.create(secret);

    res.cookie("csrf_secret", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ csrfToken: token });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.body.refresh_token || req.cookies.refresh_token;

    await logoutUser(token);

    res.clearCookie("token");
    res.clearCookie("refresh_token");

    return res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

export const getMe = (req, res) => {
  return res.status(200).json({
    status: "success",
    data: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatar_url: req.user.avatar_url,
    },
  });
};