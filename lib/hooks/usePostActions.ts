"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CommunityCategory } from "@/lib/validation/community";
import { invalidatePostCaches } from "./useCommunityData";

interface CreatePostData {
  apartment_id: string;
  category: CommunityCategory;
  title?: string;
  body: string;
  images?: string[];
}

export function usePostActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const createPost = async (data: CreatePostData) => {
    if (!user) {
      toast.error("게시글을 작성하려면 로그인이 필요합니다");
      router.push("/auth/sign-in");
      return { success: false, error: "인증이 필요합니다" };
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "게시글 작성에 실패했습니다");
      }

      // 캐시 무효화
      invalidatePostCaches();

      // 페이지 갱신
      router.refresh();

      toast.success("게시글이 성공적으로 작성되었습니다");
      return { success: true, data: result.data };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "게시글 작성 중 오류가 발생했습니다";

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error("게시글을 삭제하려면 로그인이 필요합니다");
      return { success: false };
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "게시글 삭제에 실패했습니다");
      }

      // 캐시 무효화
      invalidatePostCaches();

      // 페이지 갱신
      router.refresh();

      toast.success("게시글이 삭제되었습니다");
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "게시글 삭제 중 오류가 발생했습니다";

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPost,
    deletePost,
    isLoading,
  };
}
