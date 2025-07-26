import React, { useState } from "react";
import { createCommentSchema } from "@/lib/validation/community";

interface CommentFormProps {
  onSubmit: (values: { body: string; parent_id?: string | null }) => void;
  parentId?: string | null;
  loading?: boolean;
  defaultValue?: string;
}

export function CommentForm({
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
      post_id: "dummy",
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
    <form className="flex flex-col gap-2 mt-2" onSubmit={handleSubmit}>
      <textarea
        className="w-full border rounded-lg px-3 py-2 min-h-[48px] text-sm"
        placeholder="댓글을 입력하세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        required
        aria-label="댓글 입력"
        disabled={loading}
      />
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-300"
          disabled={loading || !body.trim()}
        >
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
