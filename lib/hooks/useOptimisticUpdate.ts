'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  revertOnError?: boolean;
}

export function useOptimisticUpdate() {
  const [isLoading, setIsLoading] = useState(false);

  const executeOptimistic = useCallback(async <TData = unknown>(
    optimisticUpdate: () => void,
    asyncOperation: () => Promise<TData>,
    revertUpdate: () => void,
    options: OptimisticUpdateOptions<TData> = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      revertOnError = true,
    } = options;

    setIsLoading(true);

    try {
      // Apply optimistic update immediately
      optimisticUpdate();

      // Execute the async operation
      const result = await asyncOperation();

      // Handle success
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(result);

      return result;
    } catch (error) {
      // Revert the optimistic update on error
      if (revertOnError) {
        revertUpdate();
      }

      const errorObj = error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다');

      // Handle error
      const displayMessage = errorMessage || errorObj.message || '작업을 완료할 수 없습니다';
      toast.error(displayMessage);

      onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeOptimistic,
    isLoading,
  };
}

// Specialized hook for like operations
export function useOptimisticLike() {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();

  const toggleLike = useCallback(async (
    postId: string,
    currentLiked: boolean,
    currentCount: number,
    updateState: (liked: boolean, count: number) => void,
    likeOperation: () => Promise<{ liked: boolean; count: number }>
  ) => {
    const newLiked = !currentLiked;
    const newCount = newLiked ? currentCount + 1 : currentCount - 1;

    return executeOptimistic(
      () => updateState(newLiked, newCount),
      likeOperation,
      () => updateState(currentLiked, currentCount),
      {
        errorMessage: '좋아요 처리 중 오류가 발생했습니다',
      }
    );
  }, [executeOptimistic]);

  return {
    toggleLike,
    isLoading,
  };
}

// Specialized hook for comment operations
export function useOptimisticComment() {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();

  const addComment = useCallback(async <TComment>(
    tempComment: TComment,
    addToList: (comment: TComment) => void,
    removeFromList: (comment: TComment) => void,
    submitComment: () => Promise<TComment>
  ) => {
    return executeOptimistic(
      () => addToList(tempComment),
      submitComment,
      () => removeFromList(tempComment),
      {
        successMessage: '댓글이 작성되었습니다',
        errorMessage: '댓글 작성 중 오류가 발생했습니다',
      }
    );
  }, [executeOptimistic]);

  const deleteComment = useCallback(async <TComment>(
    comment: TComment,
    removeFromList: (comment: TComment) => void,
    addToList: (comment: TComment) => void,
    deleteOperation: () => Promise<void>
  ) => {
    return executeOptimistic(
      () => removeFromList(comment),
      deleteOperation,
      () => addToList(comment),
      {
        successMessage: '댓글이 삭제되었습니다',
        errorMessage: '댓글 삭제 중 오류가 발생했습니다',
      }
    );
  }, [executeOptimistic]);

  return {
    addComment,
    deleteComment,
    isLoading,
  };
}
