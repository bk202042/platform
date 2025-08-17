"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { PostSummary } from "@/lib/types/community";
import { useSearchParams } from "next/navigation";

interface PostsSectionProps {
  userId: string;
  initialPosts: PostSummary[];
}

export function PostsSection({ userId: _userId, initialPosts }: PostsSectionProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const searchParams = useSearchParams();

  // Handle URL parameters for notifications
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "post_updated") {
      setNotification({
        type: "success",
        message: "게시글이 성공적으로 수정되었습니다.",
      });
    } else if (error === "edit_expired") {
      setNotification({
        type: "error", 
        message: "게시글 수정 기간이 만료되었습니다. (24시간 제한)",
      });
    }

    // Clear notification after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "게시됨";
      case "draft":
        return "임시저장";
      case "archived":
        return "보관됨";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canEditPost = (post: PostSummary) => {
    const postAge = Date.now() - new Date(post.created_at).getTime();
    const hoursSinceCreated = postAge / (1000 * 60 * 60);
    return hoursSinceCreated < 24;
  };

  const getEditTooltip = (post: PostSummary) => {
    if (canEditPost(post)) {
      return "게시글 수정";
    }
    return "수정 기간이 만료되었습니다 (24시간 제한)";
  };

  const handleEditPost = (postId: string, post: PostSummary) => {
    if (canEditPost(post)) {
      window.location.href = `/community/edit/${postId}`;
    } else {
      setNotification({
        type: "error",
        message: "게시글은 작성 후 24시간 내에만 수정할 수 있습니다.",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("이 게시글을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/community/posts/${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "삭제에 실패했습니다.");
        }

        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setNotification({
          type: "success",
          message: "게시글이 삭제되었습니다.",
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        setNotification({
          type: "error",
          message: error instanceof Error ? error.message : "게시글 삭제 중 오류가 발생했습니다.",
        });
      }
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          notification.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className={`ml-auto text-sm hover:underline ${
              notification.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 게시글</h1>
          <p className="text-sm text-gray-600 mt-1">작성한 게시글을 관리하고 수정할 수 있습니다.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = "/community"}
        >
          새 게시글 작성
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">아직 작성한 게시글이 없습니다.</p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = "/community"}
          >
            첫 게시글 작성하기
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {post.title || "제목 없음"}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{formatDate(post.created_at)}</span>
                      <span>•</span>
                      <span>{post.apartment_name}</span>
                      <span>•</span>
                      <span>{post.city_name}</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => window.location.href = `/community/${post.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={canEditPost(post) 
                        ? "text-gray-600 hover:text-gray-900" 
                        : "text-gray-400 cursor-not-allowed"
                      }
                      onClick={() => handleEditPost(post.id, post)}
                      title={getEditTooltip(post)}
                      disabled={!canEditPost(post)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}