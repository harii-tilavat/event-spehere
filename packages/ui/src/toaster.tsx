import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "!bg-card !text-card-foreground !border-border",
        },
      }}
    />
  );
}
