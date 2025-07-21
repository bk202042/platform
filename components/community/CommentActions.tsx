"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CommentActionsProps {
  postId: string;
  commentId: string;
  isOwner: boolean;
}

export function CommentActions({
  postId,
  commentId,
  isOwner,
}: CommentActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!isOwner) {
      toast.error("댓글 삭제 권한이 없습니다.");
      return;
    }

    if (isDeleting) return;

    const confirmed = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/community/comments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, commentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "댓글 삭제에 실패했습니다.");
      }

      toast.success("댓글이 삭제되었습니다.");
      router.refresh(); // 페이지 데이터 갱신
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "댓글 삭제 중 오류가 발생했습니다.";

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <AlertCircle className="h-4 w-4 mr-1" />
      ) : (
        <Trash2 className="h-4 w-4 mr-1" />
      )}
      <span className="text-xs">삭제</span>
    </Button>
  );
}
