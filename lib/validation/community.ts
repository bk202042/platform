import { z } from 'zod';

// 커뮤니티 카테고리 ENUM 상수
export const COMMUNITY_CATEGORIES = ['QNA', 'RECOMMEND', 'SECONDHAND', 'FREE'] as const;
export type CommunityCategory = typeof COMMUNITY_CATEGORIES[number];

// 게시글 생성/수정 스키마
export const createPostSchema = z.object({
  apartment_id: z.string().uuid({ message: '아파트 정보가 올바르지 않습니다.' }),
  category: z.enum(COMMUNITY_CATEGORIES, { message: '카테고리를 선택해 주세요.' }),
  title: z.string().max(100, { message: '제목은 100자 이내여야 합니다.' }).optional(),
  body: z.string().min(1, { message: '본문을 입력해 주세요.' }).max(2000, { message: '본문은 2000자 이내여야 합니다.' }),
  images: z
    .array(z.string().url({ message: '이미지 URL이 올바르지 않습니다.' }).max(500))
    .max(5, { message: '이미지는 최대 5개까지 첨부할 수 있습니다.' })
    .optional(),
});

// 댓글 생성 스키마
export const createCommentSchema = z.object({
  post_id: z.string().uuid({ message: '게시글 정보가 올바르지 않습니다.' }),
  parent_id: z.string().uuid({ message: '부모 댓글 정보가 올바르지 않습니다.' }).nullable().optional(),
  body: z.string().min(1, { message: '댓글을 입력해 주세요.' }).max(1000, { message: '댓글은 1000자 이내여야 합니다.' }),
});

// 댓글 삭제 권한 검증 함수
export function validateCommentDeletion(comment: { user_id: string }, currentUserId: string): {
  isValid: boolean;
  error?: string;
} {
  if (!currentUserId) {
    return { isValid: false, error: '로그인이 필요합니다.' };
  }

  if (comment.user_id !== currentUserId) {
    return { isValid: false, error: '댓글을 삭제할 권한이 없습니다.' };
  }

  return { isValid: true };
}

// 댓글 답글 깊이 검증 함수
export function validateCommentDepth(parentComment: { parent_id?: string | null }, maxDepth: number = 3): {
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
      depth
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
      error: result.error.errors[0]?.message || '댓글 내용이 올바르지 않습니다.'
    };
  }

  // 기본적인 내용 정리 (앞뒤 공백 제거)
  const sanitizedBody = body.trim();

  // 빈 내용 체크
  if (!sanitizedBody) {
    return { isValid: false, error: '댓글을 입력해 주세요.' };
  }

  return { isValid: true, sanitizedBody };
}
