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
