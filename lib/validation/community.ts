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

// ============================================================================
// USER POST MANAGEMENT VALIDATION SCHEMAS
// ============================================================================

// User post query parameters validation
export const userPostQuerySchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
  category: z.enum(COMMUNITY_CATEGORIES).optional(),
  sort: z.enum(["latest", "popular", "engagement"]).default("latest"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Post update validation schema
export const updatePostSchema = z.object({
  title: z
    .string()
    .max(100, "제목은 100자 이내여야 합니다.")
    .optional(),
  body: z
    .string()
    .min(1, "본문을 입력해 주세요.")
    .max(2000, "본문은 2000자 이내여야 합니다.")
    .optional(),
  category: z.enum(COMMUNITY_CATEGORIES, {
    message: "유효한 카테고리를 선택해 주세요.",
  }).optional(),
  status: z.enum(["draft", "published", "archived"], {
    message: "유효한 상태를 선택해 주세요.",
  }).optional(),
  apartment_id: z.string().min(1, "아파트를 선택해주세요.").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "수정할 항목을 최소 하나 이상 선택해주세요.",
  }
);

// Post status change validation
export const changePostStatusSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  newStatus: z.enum(["draft", "published", "archived"], {
    message: "유효한 상태를 선택해 주세요.",
  }),
});

// Post deletion validation
export const deletePostSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  confirmDeletion: z.boolean().refine(val => val === true, {
    message: "삭제를 확인해주세요.",
  }),
});

// Batch post operation validation
export const batchPostOperationSchema = z.object({
  postIds: z
    .array(z.string().uuid("유효한 게시글 ID가 필요합니다."))
    .min(1, "최소 하나의 게시글을 선택해주세요.")
    .max(50, "한 번에 최대 50개의 게시글만 처리할 수 있습니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  action: z.enum(["publish", "archive", "draft", "delete"], {
    message: "유효한 작업을 선택해 주세요.",
  }),
});

// Post analytics query validation
export const postAnalyticsQuerySchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  dateRange: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  includeArchived: z.boolean().default(false),
});

// Post engagement metrics validation
export const postEngagementMetricsSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  includeDetails: z.boolean().default(true),
});

// Draft management validation
export const draftManagementSchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  limit: z.number().min(1).max(50).default(10),
  includeExpired: z.boolean().default(false),
});

// Post ownership validation
export const postOwnershipSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
});

// Post permissions validation
export const postPermissionsSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  action: z.enum(["edit", "delete", "publish", "archive", "draft", "view_analytics"], {
    message: "유효한 권한 유형을 선택해 주세요.",
  }),
});

// Enhanced post creation with management features
export const createManagedPostSchema = z.object({
  apartment_id: z.string().min(1, "아파트를 선택해주세요."),
  category: z.enum(COMMUNITY_CATEGORIES, {
    message: "카테고리를 선택해 주세요.",
  }),
  title: z
    .string()
    .max(100, "제목은 100자 이내여야 합니다.")
    .optional(),
  body: z
    .string()
    .min(1, "본문을 입력해 주세요.")
    .max(2000, "본문은 2000자 이내여야 합니다."),
  images: z
    .array(z.string().url("이미지 URL이 올바르지 않습니다."))
    .max(5, "이미지는 최대 5개까지 첨부할 수 있습니다.")
    .optional(),
  status: z.enum(["draft", "published"]).default("published"),
  scheduledAt: z.string().datetime().optional(),
});

// Post scheduling validation
export const schedulePostSchema = z.object({
  postId: z.string().uuid("유효한 게시글 ID가 필요합니다."),
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  scheduledAt: z.string().datetime("유효한 날짜와 시간을 입력해주세요."),
}).refine(
  (data) => new Date(data.scheduledAt) > new Date(),
  {
    message: "예약 시간은 현재 시간보다 미래여야 합니다.",
    path: ["scheduledAt"],
  }
);

// User post management settings
export const userPostSettingsSchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  defaultStatus: z.enum(["draft", "published"]).default("published"),
  autoSaveDrafts: z.boolean().default(true),
  notifyOnEngagement: z.boolean().default(true),
  emailDigest: z.enum(["none", "daily", "weekly"]).default("weekly"),
});

// Post export validation
export const exportPostsSchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  format: z.enum(["json", "csv", "markdown"]).default("json"),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeImages: z.boolean().default(false),
  includeComments: z.boolean().default(false),
});

// Post archival policy validation
export const postArchivalPolicySchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 필요합니다."),
  autoArchiveAfterDays: z.number().min(30).max(365).optional(),
  deleteAfterDays: z.number().min(90).max(1095).optional(),
  notifyBeforeArchival: z.boolean().default(true),
});

// Post status transition validation functions
export function validatePostStatusTransition(
  from: "draft" | "published" | "archived",
  to: "draft" | "published" | "archived"
): { isValid: boolean; error?: string; requiresConfirmation?: boolean } {
  // Define allowed transitions
  const allowedTransitions: Record<string, string[]> = {
    draft: ["published"],
    published: ["archived", "draft"],
    archived: ["published"],
  };

  if (!allowedTransitions[from]?.includes(to)) {
    return {
      isValid: false,
      error: `${from}에서 ${to}로 상태 변경이 불가능합니다.`,
    };
  }

  // Special cases that require confirmation
  const requiresConfirmation = 
    (from === "published" && to === "draft") ||
    (from === "archived" && to === "published");

  return {
    isValid: true,
    requiresConfirmation,
  };
}

// Post content validation
export function validatePostContent(
  title?: string,
  body?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (title && title.length > 100) {
    errors.push("제목은 100자 이내여야 합니다.");
  }

  if (!body || body.trim().length === 0) {
    errors.push("본문을 입력해 주세요.");
  } else if (body.length > 2000) {
    errors.push("본문은 2000자 이내여야 합니다.");
  }

  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /연락처.*[\d\-\(\)\s]{8,}/,  // Phone numbers
    /이메일.*@.*\./,              // Email addresses
    /카톡.*[^\s]{5,}/,           // KakaoTalk IDs
  ];

  inappropriatePatterns.forEach(pattern => {
    if (pattern.test(body || "")) {
      errors.push("개인정보가 포함된 내용은 게시할 수 없습니다.");
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Post engagement validation
export function validatePostEngagement(
  likesCount: number,
  commentsCount: number,
  viewCount: number
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Unusual engagement patterns
  if (likesCount > commentsCount * 10 && commentsCount > 0) {
    warnings.push("좋아요 대비 댓글 수가 적습니다.");
  }

  if (viewCount > 0 && (likesCount + commentsCount) / viewCount < 0.01) {
    warnings.push("조회수 대비 참여도가 낮습니다.");
  }

  return {
    isValid: true,
    warnings,
  };
}
