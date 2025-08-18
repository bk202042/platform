import React from "react";

export interface Comment {
  id: string;
  body: string;
  user?: { name?: string };
  created_at: string;
  parent_id?: string | null;
  children?: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  onReply?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
}

export function CommentList({ comments, onReply, onDelete }: CommentListProps) {
  return (
    <ul className="flex flex-col gap-3 mt-2" role="list">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className={`bg-zinc-50/80 rounded-lg p-3 shadow-sm border border-zinc-100/50 ${comment.parent_id ? "ml-6" : ""}`}
          role="listitem"
        >
          <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1">
            <span className="font-semibold text-zinc-900">{comment.user?.name || "익명"}</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-500 font-medium">
              {new Date(comment.created_at).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="text-sm text-zinc-900 mb-2 whitespace-pre-line leading-6 font-normal">
            {comment.body}
          </div>
          <div className="flex gap-2">
            {onReply && (
              <button
                type="button"
                className="text-blue-600 text-xs font-semibold hover:text-blue-700 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 px-1 py-0.5 rounded-sm hover:bg-blue-50/80"
                onClick={() => onReply(comment)}
                aria-label="답글 달기"
              >
                답글
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="text-red-500 text-xs font-semibold hover:text-red-600 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 px-1 py-0.5 rounded-sm hover:bg-red-50/80"
                onClick={() => onDelete(comment)}
                aria-label="댓글 삭제"
              >
                삭제
              </button>
            )}
          </div>
          {/* 대댓글(자식) 재귀 렌더링 */}
          {comment.children && comment.children.length > 0 && (
            <CommentList
              comments={comment.children}
              onReply={onReply}
              onDelete={onDelete}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
