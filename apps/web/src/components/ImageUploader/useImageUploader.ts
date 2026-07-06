import { useRef } from "react";
import { toast } from "sonner";
import { useUploadImage, type UploadFolder } from "@/api";
import { MAX_IMAGE_BYTES } from "./const";

interface UseImageUploaderArgs {
  folder: UploadFolder;
  onChange: (url: string | null) => void;
}

export function useImageUploader({ folder, onChange }: UseImageUploaderArgs) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage({
    onSuccess: (result) => onChange(result.url),
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    uploadImage.mutate({ file, folder });
  };

  const openFilePicker = () => inputRef.current?.click();
  const handleRemove = () => onChange(null);

  return {
    inputRef,
    isUploading: uploadImage.isPending,
    handleFile,
    handleRemove,
    openFilePicker,
  };
}
