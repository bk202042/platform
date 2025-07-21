import { createClient } from "../supabase/server";

// 더미 export 추가
export const __esModule = true;

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

export interface CreateProfileData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
}

// 사용자 프로필 조회
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("getUserProfile error:", error);
    return null;
  }

  return data;
}

// 사용자 프로필 생성 (회원가입 시)
export async function createUserProfile(
  profileData: CreateProfileData
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: profileData.id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        role: "user",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("createUserProfile error:", error);
    return null;
  }

  return data;
}

// 사용자 프로필 업데이트
export async function updateUserProfile(
  userId: string,
  updateData: UpdateProfileData
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("updateUserProfile error:", error);
    return null;
  }

  return data;
}

// 사용자 표시 이름 가져오기
export function getUserDisplayName(profile: UserProfile | null): string {
  if (!profile) return "익명";

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return fullName || profile.email.split("@")[0] || "익명";
}

// 여러 사용자 프로필 조회 (댓글, 포스트 작성자 정보용)
export async function getUserProfiles(
  userIds: string[]
): Promise<Record<string, UserProfile>> {
  if (userIds.length === 0) return {};

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (error) {
    console.error("getUserProfiles error:", error);
    return {};
  }

  const profileMap: Record<string, UserProfile> = {};
  data?.forEach((profile) => {
    profileMap[profile.id] = profile;
  });

  return profileMap;
}
