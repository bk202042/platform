"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

// UserProfile 타입을 직접 정의
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // 프로필 정보 가져오기
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user profile")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { profile, isLoading, error };
};

export const useUserAvatar = (userId: string) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const supabase = createClient();

        // 프로필 정보에서 avatar_url 가져오기
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profile?.avatar_url) {
          // Storage에서 공개 URL 가져오기
          // getPublicUrl는 비동기 함수가 아니므로 await 제거
          const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(profile.avatar_url);

          setAvatarUrl(data?.publicUrl || null);
        }
      } catch (err) {
        console.error("Failed to fetch user avatar:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAvatar();
  }, [userId]);

  return { avatarUrl, isLoading };
};

export const getUserDisplayName = (profile: UserProfile | null): string => {
  if (!profile) return "익명";

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return fullName || profile.email.split("@")[0] || "익명";
};
