"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

type OptimisticUpdateStatus = "idle" | "pending" | "error" | "success";

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface QueuedOperation<T> {
  optimisticUpdate: () => void;
  asyncOperation: () => Promise<T>;
  revertUpdate: () => void;
  options: OptimisticUpdateOptions<T>;
  id: number;
}

export function useOptimisticUpdate() {
  const [status, setStatus] = useState<OptimisticUpdateStatus>("idle");
  const operationQueue = useRef<QueuedOperation<unknown>[]>([]);
  const isProcessing = useRef(false);
  const operationCounter = useRef(0);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || operationQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    setStatus("pending");

    const operation = operationQueue.current.shift();
    if (!operation) {
      isProcessing.current = false;
      setStatus("idle");
      return;
    }

    try {
      operation.optimisticUpdate();
      const result = await operation.asyncOperation();

      if (operation.options.successMessage) {
        toast.success(operation.options.successMessage);
      }
      // The type of `result` is `unknown` here, so we need to cast it
      // to the appropriate type before passing it to the callback.
      (operation.options.onSuccess as (result: unknown) => void)?.(result);
      setStatus("success");
    } catch (error) {
      operation.revertUpdate();
      const errorObj =
        error instanceof Error
          ? error
          : new Error("알 수 없는 오류가 발생했습니다");
      const displayMessage =
        operation.options.errorMessage ||
        errorObj.message ||
        "작업을 완료할 수 없습니다";
      toast.error(displayMessage);
      operation.options.onError?.(errorObj);
      setStatus("error");

      // Clear queue on error to prevent inconsistent state
      operationQueue.current = [];
    } finally {
      isProcessing.current = false;
      // Process next item in the queue
      if (operationQueue.current.length > 0) {
        processQueue();
      } else {
        setStatus("idle");
      }
    }
  }, []);

  const executeOptimistic = useCallback(
    <TData = unknown>(
      optimisticUpdate: () => void,
      asyncOperation: () => Promise<TData>,
      revertUpdate: () => void,
      options: OptimisticUpdateOptions<TData> = {},
    ) => {
      const newOperation: QueuedOperation<TData> = {
        optimisticUpdate,
        asyncOperation,
        revertUpdate,
        options,
        id: operationCounter.current++,
      };
      operationQueue.current.push(newOperation as QueuedOperation<unknown>);
      processQueue();
    },
    [processQueue],
  );

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      operationQueue.current = [];
    };
  }, []);

  return {
    executeOptimistic,
    isLoading: status === "pending",
    status,
  };
}

// Specialized hook for like operations
export function useOptimisticLike() {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();

  const toggleLike = useCallback(
    async (
      postId: string,
      currentLiked: boolean,
      currentCount: number,
      updateState: (liked: boolean, count: number) => void,
      likeOperation: () => Promise<{ liked: boolean; count: number }>,
    ) => {
      const newLiked = !currentLiked;
      const newCount = newLiked ? currentCount + 1 : currentCount - 1;

      return executeOptimistic(
        () => updateState(newLiked, newCount),
        likeOperation,
        () => updateState(currentLiked, currentCount),
        {
          errorMessage: "좋아요 처리 중 오류가 발생했습니다",
        },
      );
    },
    [executeOptimistic],
  );

  return {
    toggleLike,
    isLoading,
  };
}

// Specialized hook for comment operations
export function useOptimisticComment() {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();

  const addComment = useCallback(
    async <TComment>(
      tempComment: TComment,
      addToList: (comment: TComment) => void,
      removeFromList: (comment: TComment) => void,
      submitComment: () => Promise<TComment>,
    ) => {
      return executeOptimistic(
        () => addToList(tempComment),
        submitComment,
        () => removeFromList(tempComment),
        {
          successMessage: "댓글이 작성되었습니다",
          errorMessage: "댓글 작성 중 오류가 발생했습니다",
        },
      );
    },
    [executeOptimistic],
  );

  const deleteComment = useCallback(
    async <TComment>(
      comment: TComment,
      removeFromList: (comment: TComment) => void,
      addToList: (comment: TComment) => void,
      deleteOperation: () => Promise<void>,
    ) => {
      return executeOptimistic(
        () => removeFromList(comment),
        deleteOperation,
        () => addToList(comment),
        {
          successMessage: "댓글이 삭제되었습니다",
          errorMessage: "댓글 삭제 중 오류가 발생했습니다",
        },
      );
    },
    [executeOptimistic],
  );

  return {
    addComment,
    deleteComment,
    isLoading,
  };
}
