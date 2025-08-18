import React, { useState } from "react";
import { createCommentSchema } from "@/lib/validation/community";

interface CommentFormProps {
  postId: string;
  onSubmit: (values: { body: string; parent_id?: string | null }) => void;
  parentId?: string | null;
  loading?: boolean;
  defaultValue?: string;
}

export function CommentForm({
  postId,
  onSubmit,
  parentId,
  loading,
  defaultValue,
}: CommentFormProps) {
  const [body, setBody] = useState(defaultValue || "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createCommentSchema.safeParse({
      post_id: postId,
      body,
      parent_id: parentId,
    });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "댓글을 입력해 주세요.");
      return;
    }
    setError(null);
    onSubmit({ body, parent_id: parentId });
    setBody("");
  }

  return (
    <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubmit}>
      <textarea
        className="w-full border border-zinc-200/60 rounded-lg px-3 py-2.5 min-h-[72px] text-sm placeholder:text-zinc-500 text-zinc-900 leading-6 font-normal bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none disabled:bg-zinc-50/50 disabled:text-zinc-500"
        placeholder="댓글을 입력하세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        required
        aria-label="댓글 입력"
        disabled={loading}
      />
      {error && <div className="text-red-500 text-xs font-medium bg-red-50/50 border border-red-100 rounded-md px-2.5 py-1.5">{error}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm disabled:bg-zinc-300 disabled:text-zinc-500 shadow-sm hover:shadow-md"
          disabled={loading || !body.trim()}
        >
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
