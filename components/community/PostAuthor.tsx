"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface PostAuthorProps {
  userId: string;
  createdAt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PostAuthor({
  userId,
  createdAt,
  className = "",
  size = "md",
}: PostAuthorProps) {
  const [displayName, setDisplayName] = useState<string>("사용자");
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;

      setIsLoading(true);
      try {
        // 프로필 정보 가져오기
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Failed to load user profile:", error);
          return;
        }

        // 사용자 이름 설정
        if (profileData) {
          const fullName =
            `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
          setDisplayName(
            fullName || profileData.email?.split("@")[0] || "사용자"
          );

          // 아바타 URL이 있으면 Supabase Storage에서 다운로드 URL 가져오기
          if (profileData.avatar_url) {
            try {
              const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(profileData.avatar_url);

              if (data?.publicUrl) {
                setAvatarUrl(data.publicUrl);
              }
            } catch (avatarError) {
              console.error("Failed to load avatar:", avatarError);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId, supabase]);

  // date-fns 모듈이 없는 경우를 대비한 간단한 날짜 포맷팅
  const formattedDate = (() => {
    try {
      return formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
        locale: ko,
      });
    } catch (_e) {
      // 간단한 대체 포맷팅
      const date = new Date(createdAt);
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }
  })();

  const avatarSizeClass = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const nameSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const dateSizeClass = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={avatarSizeClass}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback>
          {displayName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className={`font-medium ${nameSizeClass}`}>
          {isLoading ? "로딩 중..." : displayName}
        </span>
        <span className={`text-muted-foreground ${dateSizeClass}`}>
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
