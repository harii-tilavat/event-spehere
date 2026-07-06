import { buildKey, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { authPaths } from "./paths";

export const queryEndpoints = {
  getMe: (): QueryEndpoint => ({
    url: authPaths.me(),
    queryKey: buildKey("auth", "me"),
  }),
};

export const mutationEndpoints = {
  register: (): MutationEndpoint => ({ mutationKey: buildKey("auth", "register"), url: authPaths.register() }),
  login: (): MutationEndpoint => ({ mutationKey: buildKey("auth", "login"), url: authPaths.login() }),
  logout: (): MutationEndpoint => ({ mutationKey: buildKey("auth", "logout"), url: authPaths.logout() }),
  verifyEmail: (): MutationEndpoint => ({ mutationKey: buildKey("auth", "verifyEmail"), url: authPaths.verifyEmail() }),
  resendVerification: (): MutationEndpoint => ({
    mutationKey: buildKey("auth", "resendVerification"),
    url: authPaths.resendVerification(),
  }),
  forgotPassword: (): MutationEndpoint => ({
    mutationKey: buildKey("auth", "forgotPassword"),
    url: authPaths.forgotPassword(),
  }),
  resetPassword: (): MutationEndpoint => ({
    mutationKey: buildKey("auth", "resetPassword"),
    url: authPaths.resetPassword(),
  }),
  changePassword: (): MutationEndpoint => ({
    mutationKey: buildKey("auth", "changePassword"),
    url: authPaths.changePassword(),
  }),
};
