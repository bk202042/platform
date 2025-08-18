"use client";

import React, { useState, useCallback } from "react";
import { MessageCircle, Trash2, Reply, AlertCircle } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  validateCommentContent,
  validateCommentDeletion,
} from "@/lib/validation/community";

export interface Comment {
  id: string;
  body: string;
  user?: { name?: string };
  created_at: string;
  parent_id?: string | null;
  children?: Comment[];
  user_id?: string;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  depth?: number;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const isOwner = currentUserId && comment.user_id === currentUserId;
  const maxDepth = 3; // Maximum nesting depth for readability
  const canReply = depth < maxDepth;

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return diffInMinutes < 1 ? "방금 전" : `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div
      className={`${depth > 0 ? "ml-3 sm:ml-6 pl-2 sm:pl-4 border-l-2 border-zinc-200/60" : ""}`}
    >
      <div className="bg-zinc-50/80 rounded-lg p-3 sm:p-4 mb-3 shadow-sm border border-zinc-100/50">
        {/* Comment header */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-zinc-600 min-w-0 flex-1">
            <span className="font-semibold text-zinc-900 truncate">
              {comment.user?.name || "익명"}
            </span>
            <span aria-hidden="true" className="flex-shrink-0">
              ·
            </span>
            <span className="text-xs sm:text-sm text-zinc-500 whitespace-nowrap font-medium">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {canReply && (
              <button
                type="button"
                className="text-blue-600 text-xs sm:text-sm font-semibold hover:text-blue-700 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-blue-50/80 min-h-[32px]"
                onClick={() => onReply(comment)}
                aria-label="답글 달기"
              >
                <Reply size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">답글</span>
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                className="text-red-500 text-xs sm:text-sm font-semibold hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-red-50/80 min-h-[32px]"
                onClick={() => onDelete(comment)}
                aria-label="댓글 삭제"
              >
                <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">삭제</span>
              </button>
            )}
          </div>
        </div>

        {/* Comment content */}
        <div className="text-zinc-900 whitespace-pre-line leading-7 text-sm sm:text-base font-normal">
          {comment.body}
        </div>
      </div>

      {/* Render child comments recursively */}
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-0">
          {comment.children.map((childComment) => (
            <CommentItem
              key={childComment.id}
              comment={childComment}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle comment submission
  const handleCommentSubmit = useCallback(
    async (values: { body: string; parent_id?: string | null }) => {
      if (!currentUserId) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // Validate comment content before submission
      const contentValidation = validateCommentContent(values.body);
      if (!contentValidation.isValid) {
        toast.error(
          contentValidation.error || "댓글 내용이 올바르지 않습니다.",
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(
          `/api/community/posts/${postId}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              body: contentValidation.sanitizedBody, // Use sanitized content
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "댓글 작성에 실패했습니다.");
        }

        // Create optimistic comment for immediate UI feedback
        const optimisticComment: Comment = {
          id: result.data.id,
          body: contentValidation.sanitizedBody!,
          user: { name: "나" }, // Will be updated on page refresh
          created_at: new Date().toISOString(),
          parent_id: values.parent_id,
          children: [],
          user_id: currentUserId,
        };

        // Add comment to local state
        if (values.parent_id) {
          // Add as reply to existing comment
          setComments((prevComments) => {
            const addReplyToComment = (comments: Comment[]): Comment[] => {
              return comments.map((comment) => {
                if (comment.id === values.parent_id) {
                  return {
                    ...comment,
                    children: [...(comment.children || []), optimisticComment],
                  };
                } else if (comment.children && comment.children.length > 0) {
                  return {
                    ...comment,
                    children: addReplyToComment(comment.children),
                  };
                }
                return comment;
              });
            };
            return addReplyToComment(prevComments);
          });
        } else {
          // Add as top-level comment
          setComments((prevComments) => [...prevComments, optimisticComment]);
        }

        setReplyingTo(null);
        toast.success("댓글이 작성되었습니다.");
      } catch (error) {
        console.error("Comment submission error:", error);
        toast.error(
          error instanceof Error ? error.message : "댓글 작성에 실패했습니다.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, currentUserId],
  );

  // Handle comment deletion
  const handleCommentDelete = useCallback(
    async (comment: Comment) => {
      // Validate deletion permission using validation function
      const deletionValidation = validateCommentDeletion(
        { user_id: comment.user_id || "" },
        currentUserId || "",
      );

      if (!deletionValidation.isValid) {
        toast.error(
          deletionValidation.error || "댓글을 삭제할 권한이 없습니다.",
        );
        return;
      }

      setIsDeleting(true);
      try {
        const response = await fetch("/api/community/comments/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, commentId: comment.id }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "댓글 삭제에 실패했습니다.");
        }

        // Remove comment from local state
        setComments((prevComments) => {
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments.filter((c) => {
              if (c.id === comment.id) {
                return false;
              }
              if (c.children && c.children.length > 0) {
                c.children = removeComment(c.children);
              }
              return true;
            });
          };
          return removeComment(prevComments);
        });

        setDeletingComment(null);
        toast.success("댓글이 삭제되었습니다.");
      } catch (error) {
        console.error("Comment deletion error:", error);
        toast.error(
          error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.",
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [postId, currentUserId],
  );

  // Handle reply button click
  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
  }, []);

  // Handle delete button click
  const handleDeleteClick = useCallback((comment: Comment) => {
    setDeletingComment(comment);
  }, []);

  return (
    <section className="space-y-6">
      {/* Comment form */}
      <div className="bg-white border border-zinc-200/60 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">댓글 작성</h3>
        {currentUserId ? (
          <CommentForm postId={postId} onSubmit={handleCommentSubmit} loading={isSubmitting} />
        ) : (
          <div className="text-center py-8 text-zinc-500 bg-zinc-50/60 rounded-lg border border-zinc-100/50">
            <div className="w-12 h-12 mx-auto mb-3 bg-zinc-200/70 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 mb-2">
              로그인이 필요합니다
            </p>
            <p className="text-xs text-zinc-500 font-medium">
              댓글을 작성하려면 로그인해주세요.
            </p>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
            댓글 {comments.length}개
          </h3>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={handleReply}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 bg-zinc-50/60 rounded-lg border border-zinc-100/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100/80 rounded-full flex items-center justify-center">
              <MessageCircle size={24} className="text-zinc-400" />
            </div>
            <p className="text-base font-semibold text-zinc-700 mb-2">
              아직 댓글이 없습니다
            </p>
            <p className="text-sm text-zinc-500 font-medium">
              첫 번째 댓글을 남겨서 대화를 시작해보세요!
            </p>
          </div>
        )}
      </div>

      {/* Reply dialog */}
      {replyingTo && (
        <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>답글 작성</DialogTitle>
              <DialogDescription>
                {replyingTo.user?.name || "익명"}님의 댓글에 답글을 작성합니다.
              </DialogDescription>
            </DialogHeader>

            {/* Original comment preview */}
            <div className="bg-zinc-50/80 rounded-lg p-3 mb-4 border border-zinc-100/50">
              <div className="text-sm text-zinc-600 mb-1 font-medium">
                <span className="font-medium">
                  {replyingTo.user?.name || "익명"}
                </span>
              </div>
              <div className="text-sm text-zinc-900 line-clamp-3 leading-6 font-normal">
                {replyingTo.body}
              </div>
            </div>

            {currentUserId ? (
              <CommentForm
                postId={postId}
                onSubmit={(values) =>
                  handleCommentSubmit({ ...values, parent_id: replyingTo.id })
                }
                loading={isSubmitting}
                defaultValue=""
              />
            ) : (
              <div className="text-center py-4 text-zinc-500">
                <p className="text-sm">로그인이 필요합니다.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      {deletingComment && (
        <Dialog
          open={!!deletingComment}
          onOpenChange={() => setDeletingComment(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                댓글 삭제
              </DialogTitle>
              <DialogDescription>
                이 댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            {/* Comment preview */}
            <div className="bg-zinc-50/80 rounded-lg p-3 mb-4 border border-zinc-100/50">
              <div className="text-sm text-zinc-900 line-clamp-3 leading-6 font-normal">
                {deletingComment.body}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingComment(null)}
                disabled={isDeleting}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCommentDelete(deletingComment)}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
