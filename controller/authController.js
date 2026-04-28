import {
  getGithubRedirectUrl,
  handlecallback,
  refresh,
  logoutUser,
} from "../service/authService.js";

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
        .json({ status: "error", message: " Missing code or state" });
    }

    const { user, accessToken, refreshToken } = await handlecallback(
      code,
      state,
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: "production",
      maxAge: 3 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: "production",
      maxAge: 5 * 60 * 1000,
      sameSite: "strict",
    });

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
      sameSite: "strict",
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000,
      sameSite: "strict",
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
