import { buildKey, type MutationEndpoint } from "@/api/core";
import { uploadPaths } from "./paths";

export const mutationEndpoints = {
  uploadImage: (): MutationEndpoint => ({
    mutationKey: buildKey("uploads", "image"),
    url: uploadPaths.image(),
  }),
};
