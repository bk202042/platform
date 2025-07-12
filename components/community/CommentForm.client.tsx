'use client';
import { useState } from 'react';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: { body: string; user: { name: string }; created_at: string }) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    onCommentAdded({ body, user: { name: '나' }, created_at: new Date().toISOString() });
    setBody('');
    await fetch(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
      headers: { 'Content-Type': 'application/json' },
    });
    setLoading(false);
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
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm"
          disabled={loading || !body.trim()}
        >
          등록
        </button>
      </div>
    </form>
  );
}
