import type { UploadFolder } from "@/api";

export interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  label?: string;
  className?: string;
}
