"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Eye } from "lucide-react";
import { PostSummary } from "@/lib/types/community";

interface PostsSectionProps {
  userId: string;
  initialPosts: PostSummary[];
}

export function PostsSection({ userId: _userId, initialPosts }: PostsSectionProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);

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

  const handleEditPost = (postId: string) => {
    // Navigate to edit page - implementation depends on routing structure
    window.location.href = `/community/edit/${postId}`;
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("이 게시글을 삭제하시겠습니까?")) {
      // Implementation for post deletion
      // This would call a delete function and refresh the list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 게시글</h1>
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
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => handleEditPost(post.id)}
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