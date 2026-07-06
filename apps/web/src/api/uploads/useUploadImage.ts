import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { UploadImageVariables, UploadResponse, UploadResultDto } from "./types";

export const useUploadImage = (options: MutationConfig<UploadResultDto, UploadImageVariables> = {}) => {
  const { mutationKey, url } = mutationEndpoints.uploadImage();
  const { onSuccess, onError } = useQueryHandlers<UploadResultDto, UploadImageVariables>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ file, folder }) => {
      const form = new FormData();
      form.append("image", file);
      form.append("folder", folder);
      const res = await postCall<UploadResponse>(url!, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data.data;
    },
    onSuccess,
    onError,
  });
};
