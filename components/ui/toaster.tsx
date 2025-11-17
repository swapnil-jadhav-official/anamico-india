"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(
        ({ id, title, description, action, variant, open, onOpenChange }) => {
          const isDestructive = variant === "destructive";
          const content = description || title;

          return (
            <Toast
              key={id}
              variant={variant}
              open={open}
              onOpenChange={onOpenChange}
            >
              <div className="flex-1 grid gap-1 items-center">
                {title && (
                  <ToastTitle className={isDestructive ? "text-white" : ""}>
                    {title}
                  </ToastTitle>
                )}
                {content && (
                  <ToastDescription
                    className={isDestructive ? "text-white/90" : ""}
                  >
                    {content}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        }
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
