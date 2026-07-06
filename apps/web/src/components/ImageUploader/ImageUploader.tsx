import { ImagePlus, Loader2, X } from "lucide-react";
import { Button, cn } from "@eventsphere/ui";
import { ACCEPTED_IMAGE_TYPES } from "./const";
import { useImageUploader } from "./useImageUploader";
import type { ImageUploaderProps } from "./types";

export function ImageUploader({ value, onChange, folder, label = "Upload image", className }: ImageUploaderProps) {
  const { inputRef, isUploading, handleFile, handleRemove, openFilePicker } = useImageUploader({ folder, onChange });

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="size-16 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full border bg-background p-0.5"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex size-16 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          <ImagePlus className="size-5" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={openFilePicker}>
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : label}
      </Button>
    </div>
  );
}
