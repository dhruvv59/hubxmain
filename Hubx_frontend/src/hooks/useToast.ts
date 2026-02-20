import { useState, useCallback } from "react";
import { ToastVariant } from "@/components/ui/AppToast";

interface ToastState {
  message: string;
  variant: ToastVariant;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "success",
    isVisible: false,
  });

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success", duration: number = 3000) => {
      setToast({
        message,
        variant,
        isVisible: true,
      });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, duration);

      return () => clearTimeout(timer);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    info,
    warning,
  };
}
