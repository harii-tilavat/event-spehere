import type { ApiSuccess, UploadResultDto } from "@eventsphere/shared";

export type { UploadResultDto };

export type UploadFolder = "avatars" | "categories" | "venues" | "events" | "organizers";

export interface UploadImageVariables {
  file: File;
  folder: UploadFolder;
}

export type UploadResponse = ApiSuccess<UploadResultDto>;
