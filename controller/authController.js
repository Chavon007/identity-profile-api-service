import { getGithubRedirectUrl } from "../service/authService.js";

export const redirectToGitHub = (req, res) => {
  const { url } = getGithubRedirectUrl();
  res.redirect(url);
};
