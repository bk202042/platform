'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import { toastUtils, handleApiError, withRetry } from '@/lib/utils/toast';

interface ToastContextType {
  // Success toasts
  showSuccess: (message: string, description?: string) => void;
  showPostCreated: () => void;
  showCommentAdded: () => void;
  showLiked: () => void;
  showUnliked: () => void;

  // Error toasts
  showError: (message: string, description?: string) => void;
  showNetworkError: () => void;
  showAuthError: () => void;
  showValidationError: (message: string) => void;

  // Loading toasts
  showLoading: (message: string) => string | number; // Returns toast ID
  dismissToast: (toastId: string | number) => void;

  // Promise toasts
  showPromiseToast: (
    promise: Promise<unknown>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => void;

  // Utility functions
  handleApiError: (error: unknown, context?: string) => void;
  withRetry: <T>(operation: () => Promise<T>, maxRetries?: number, context?: string) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  // Success toasts
  const showSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, description ? { description } : undefined);
  }, []);

  const showPostCreated = useCallback(() => {
    toastUtils.success.postCreated();
  }, []);

  const showCommentAdded = useCallback(() => {
    toastUtils.success.commentAdded();
  }, []);

  const showLiked = useCallback(() => {
    toastUtils.success.liked();
  }, []);

  const showUnliked = useCallback(() => {
    toastUtils.success.unliked();
  }, []);

  // Error toasts
  const showError = useCallback((message: string, description?: string) => {
    toast.error(message, description ? { description } : undefined);
  }, []);

  const showNetworkError = useCallback(() => {
    toastUtils.error.network();
  }, []);

  const showAuthError = useCallback(() => {
    toastUtils.error.auth();
  }, []);

  const showValidationError = useCallback((message: string) => {
    toastUtils.error.validation(message);
  }, []);

  // Loading toasts
  const showLoading = useCallback((message: string) => {
    return toast.loading(message);
  }, []);

  const dismissToast = useCallback((toastId: string | number) => {
    toast.dismiss(toastId);
  }, []);

  // Promise toasts
  const showPromiseToast = useCallback((
    promise: Promise<unknown>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (error) => {
        const errorMessage = error instanceof Error ? error.message : messages.error;
        return `${messages.error}: ${errorMessage}`;
      }
    });
  }, []);

  const value: ToastContextType = {
    showSuccess,
    showPostCreated,
    showCommentAdded,
    showLiked,
    showUnliked,
    showError,
    showNetworkError,
    showAuthError,
    showValidationError,
    showLoading,
    dismissToast,
    showPromiseToast,
    handleApiError,
    withRetry,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook for optimistic updates with toast feedback
export function useOptimisticToast() {
  const { showLoading, dismissToast, showSuccess, showError } = useToast();

  const performOptimisticUpdate = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: {
      loadingMessage: string;
      successMessage: string;
      errorMessage: string;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
      rollback?: () => void;
    }
  ) => {
    const toastId = showLoading(options.loadingMessage);

    try {
      const result = await operation();
      dismissToast(toastId);
      showSuccess(options.successMessage);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      dismissToast(toastId);
      showError(options.errorMessage);
      options.rollback?.();
      options.onError?.(error);
      throw error;
    }
  }, [showLoading, dismissToast, showSuccess, showError]);

  return { performOptimisticUpdate };
}

// Hook for confirmation dialogs with toast feedback
export function useConfirmationToast() {
  const { showPromiseToast } = useToast();

  const confirmAction = useCallback(async <T,>(
    action: () => Promise<T>,
    options: {
      title: string;
      description: string;
      confirmLabel?: string;
      cancelLabel?: string;
      loadingMessage: string;
      successMessage: string;
      errorMessage: string;
    }
  ) => {
    // For now, we'll use a simple confirm dialog
    // In a real app, you might want to use a custom modal
    const confirmed = window.confirm(`${options.title}\n\n${options.description}`);

    if (!confirmed) {
      return null;
    }

    return showPromiseToast(action(), {
      loading: options.loadingMessage,
      success: options.successMessage,
      error: options.errorMessage,
    });
  }, [showPromiseToast]);

  return { confirmAction };
}
