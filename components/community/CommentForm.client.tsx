"use client";
import { useState } from "react";
import { useOptimisticComment } from "@/lib/hooks/useOptimisticUpdate";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Comment } from "./CommentSection";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: Comment) => void;
  onCommentRemoved: (comment: Comment) => void;
}

export function CommentForm({
  postId,
  onCommentAdded,
  onCommentRemoved,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const { addComment, isLoading } = useOptimisticComment();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim() || isLoading) return;

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const tempId = Date.now().toString();
    const tempComment = {
      id: tempId,
      body,
      user: { name: user.user_metadata.name || "나" },
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    setBody("");

    await addComment(
      tempComment,
      onCommentAdded,
      () => onCommentRemoved(tempComment),
      async () => {
        const response = await fetch(
          `/api/community/posts/${postId}/comments`,
          {
            method: "POST",
            body: JSON.stringify({ body }),
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "댓글 작성에 실패했습니다.");
        }

        const result = await response.json();
        // Replace temp comment with real one from server
        onCommentRemoved(tempComment);
        onCommentAdded(result.data);
        return result.data;
      },
    );
  };

  return (
    <form
      className="flex flex-col gap-2 mt-2"
      onSubmit={handleSubmit}
      role="form"
      aria-live="polite"
    >
      <textarea
        className="w-full border rounded-lg px-3 py-2 min-h-[48px] text-sm"
        placeholder="댓글을 입력하세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        required
        aria-label="댓글 입력"
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          disabled={isLoading || !body.trim()}
        >
          {isLoading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
