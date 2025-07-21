"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UsePostInteractionsProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export function usePostInteractions({
  postId,
  initialLikeCount,
  initialIsLiked,
}: UsePostInteractionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error("좋아요를 누르려면 로그인이 필요합니다");
      router.push("/auth/sign-in");
      return;
    }

    if (isLikeLoading) return;

    // 낙관적 UI 업데이트
    const newIsLiked = !isLiked;
    const newLikeCount = likeCount + (newIsLiked ? 1 : -1);

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    setIsLikeLoading(true);

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();

      // 서버 응답으로 상태 업데이트 (낙관적 업데이트가 틀렸을 경우 대비)
      setIsLiked(data.liked);
      setLikeCount(data.count);

      router.refresh(); // 페이지 데이터 갱신
    } catch (_error) {
      // 에러 발생 시 원래 상태로 복원
      setIsLiked(initialIsLiked);
      setLikeCount(initialLikeCount);
      toast.error("좋아요 처리 중 오류가 발생했습니다");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleCommentClick = () => {
    if (!user) {
      toast.error("댓글을 작성하려면 로그인이 필요합니다");
      router.push("/auth/sign-in");
      return;
    }

    router.push(`/community/${postId}#comments`);
  };

  const handleShareClick = async () => {
    try {
      const url = `${window.location.origin}/community/${postId}`;

      if (navigator.share) {
        await navigator.share({
          title: "커뮤니티 게시글 공유",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("링크가 클립보드에 복사되었습니다");
      }
    } catch (_error) {
      console.error("공유 중 오류 발생");
    }
  };

  return {
    isLiked,
    likeCount,
    isLikeLoading,
    handleLikeToggle,
    handleCommentClick,
    handleShareClick,
  };
}
