"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createCommunityPost } from "@/app/community/_lib/actions";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";
import { z } from "zod";

export function useCommunityPost() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const createPost = useCallback(
    async (
      values: z.infer<typeof createPostSchema>,
      onSuccess?: () => void
    ) => {
      if (!user) {
        toast.error("로그인이 필요합니다");
        return { success: false, error: "로그인이 필요합니다" };
      }

      setIsSubmitting(true);
      setError("");

      try {
        // Convert values to FormData (reuse logic from client-actions.ts)
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              formData.append(key, item);
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Call createCommunityPost with two arguments
        const result = await createCommunityPost({}, formData);

        if (result.error) {
          setError(result.error);
          toast.error(result.error);
          return { success: false, error: result.error };
        } else if (result.success) {
          toast.success(result.success);
          onSuccess?.();
          return { success: true, data: result.data };
        }
      } catch (_err) {
        const errorMessage = "게시글 작성 중 오류가 발생했습니다";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }

      return { success: false, error: "알 수 없는 오류가 발생했습니다" };
    },
    [user]
  );

  const resetError = useCallback(() => {
    setError("");
  }, []);

  return {
    createPost,
    isSubmitting,
    error,
    resetError,
    isAuthenticated: !!user,
  };
}
