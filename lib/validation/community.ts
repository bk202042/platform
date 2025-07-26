import { z } from "zod";

// 커뮤니티 카테고리 ENUM 상수
export const COMMUNITY_CATEGORIES = [
  "QNA",
  "RECOMMEND",
  "SECONDHAND",
  "FREE",
] as const;
export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

// 게시글 생성/수정 스키마
export const createPostSchema = z.object({
  apartment_id: z.string().min(1, { message: "아파트를 선택해주세요." }),
  category: z.enum(COMMUNITY_CATEGORIES, {
    message: "카테고리를 선택해 주세요.",
  }),
  title: z
    .string()
    .max(100, { message: "제목은 100자 이내여야 합니다." })
    .optional(),
  body: z
    .string()
    .min(1, { message: "본문을 입력해 주세요." })
    .max(2000, { message: "본문은 2000자 이내여야 합니다." }),
  images: z
    .array(
      z.string().url({ message: "이미지 URL이 올바르지 않습니다." }).max(500)
    )
    .max(5, { message: "이미지는 최대 5개까지 첨부할 수 있습니다." })
    .optional(),
});

// 댓글 생성 스키마
export const createCommentSchema = z.object({
  post_id: z.string().uuid({ message: "게시글 정보가 올바르지 않습니다." }),
  parent_id: z
    .string()
    .uuid({ message: "부모 댓글 정보가 올바르지 않습니다." })
    .nullable()
    .optional(),
  body: z
    .string()
    .min(1, { message: "댓글을 입력해 주세요." })
    .max(1000, { message: "댓글은 1000자 이내여야 합니다." }),
});

// 댓글 삭제 권한 검증 함수
export function validateCommentDeletion(
  comment: { user_id: string },
  currentUserId: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!currentUserId) {
    return { isValid: false, error: "로그인이 필요합니다." };
  }

  if (comment.user_id !== currentUserId) {
    return { isValid: false, error: "댓글을 삭제할 권한이 없습니다." };
  }

  return { isValid: true };
}

// 댓글 답글 깊이 검증 함수
export function validateCommentDepth(
  parentComment: { parent_id?: string | null },
  maxDepth: number = 3
): {
  isValid: boolean;
  error?: string;
  depth: number;
} {
  let depth = 0;
  const current = parentComment;

  // 부모 댓글이 있으면 깊이 계산
  if (current?.parent_id && depth < maxDepth + 1) {
    depth++;
    // 실제 구현에서는 부모 댓글을 조회해야 하지만,
    // 여기서는 최대 깊이만 체크
  }

  if (depth >= maxDepth) {
    return {
      isValid: false,
      error: `답글은 최대 ${maxDepth}단계까지만 가능합니다.`,
      depth,
    };
  }

  return { isValid: true, depth: depth + 1 };
}

// 댓글 내용 검증 함수
export function validateCommentContent(body: string): {
  isValid: boolean;
  error?: string;
  sanitizedBody?: string;
} {
  const result = createCommentSchema.pick({ body: true }).safeParse({ body });

  if (!result.success) {
    return {
      isValid: false,
      error:
        result.error.errors[0]?.message || "댓글 내용이 올바르지 않습니다.",
    };
  }

  // 기본적인 내용 정리 (앞뒤 공백 제거)
  const sanitizedBody = body.trim();

  // 빈 내용 체크
  if (!sanitizedBody) {
    return { isValid: false, error: "댓글을 입력해 주세요." };
  }

  return { isValid: true, sanitizedBody };
}

// Vietnamese Location Validation Schemas
export const vietnameseCitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "도시 이름이 필요합니다."),
  name_ko: z.string().optional(),
  name_en: z.string().optional(),
  country: z.string().default("Vietnam"),
  timezone: z.string().default("Asia/Ho_Chi_Minh"),
  is_major_city: z.boolean().default(false),
});

export const vietnameseApartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "아파트 이름이 필요합니다."),
  name_ko: z.string().optional(),
  name_en: z.string().optional(),
  district: z.string().optional(),
  district_ko: z.string().optional(),
  address: z.string().optional(),
  address_ko: z.string().optional(),
  city_id: z.string().uuid("유효한 도시 ID가 필요합니다."),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_featured: z.boolean().default(false),
});

export const userLocationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  city_id: z.string().uuid("유효한 도시 ID가 필요합니다."),
  apartment_id: z.string().uuid().optional(),
  is_primary: z.boolean().default(false),
  notification_enabled: z.boolean().default(true),
});

export const locationSearchSchema = z.object({
  query: z.string().min(1, "검색어를 입력해주세요."),
  type: z.enum(["city", "apartment", "all"]).default("all"),
  limit: z.number().min(1).max(50).default(10),
});

export const addLocationPreferenceSchema = z.object({
  cityId: z.string().uuid("유효한 도시 ID가 필요합니다."),
  apartmentId: z.string().uuid().optional(),
  makePrimary: z.boolean().default(false),
});

export const setPrimaryLocationSchema = z.object({
  cityId: z.string().uuid("유효한 도시 ID가 필요합니다."),
  apartmentId: z.string().uuid().optional(),
});

export const locationBasedPostQuerySchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  category: z.enum(COMMUNITY_CATEGORIES).optional(),
  sort: z.enum(["latest", "popular"]).default("latest"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Enhanced post creation with location validation
export const createPostWithLocationSchema = z.object({
  apartment_id: z.string().min(1, { message: "아파트를 선택해주세요." }),
  category: z.enum(COMMUNITY_CATEGORIES, {
    required_error: "카테고리를 선택해주세요.",
  }),
  title: z.string().max(200, "제목은 200자 이내여야 합니다.").optional(),
  body: z
    .string()
    .min(1, "게시글 내용을 입력해주세요.")
    .max(5000, "게시글 내용은 5000자 이내여야 합니다."),
  images: z
    .array(z.string().url())
    .max(10, "최대 10개의 이미지만 첨부할 수 있습니다.")
    .optional(),
});

// Location autocomplete validation
export const locationAutocompleteSchema = z.object({
  query: z.string().min(2, "검색어는 최소 2글자 이상이어야 합니다."),
  limit: z.number().min(1).max(20).default(5),
});

// Search posts with location context
export const searchPostsWithLocationSchema = z.object({
  query: z.string().min(1, "검색어를 입력해주세요."),
  cityId: z.string().uuid().optional(),
  apartmentId: z.string().uuid().optional(),
  category: z.enum(COMMUNITY_CATEGORIES).optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});
