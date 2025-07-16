import { describe, it, expect } from 'vitest';
import {
  createCommentSchema,
  validateCommentDeletion,
  validateCommentDepth,
  validateCommentContent
} from '../community';

describe('Community Validation', () => {
  describe('createCommentSchema', () => {
    it('should validate valid comment data', () => {
      const validComment = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        body: '테스트 댓글입니다.',
        parent_id: null
      };

      const result = createCommentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it('should validate comment with parent_id', () => {
      const validReply = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        body: '답글입니다.',
        parent_id: '123e4567-e89b-12d3-a456-426614174001'
      };

      const result = createCommentSchema.safeParse(validReply);
      expect(result.success).toBe(true);
    });

    it('should reject invalid post_id', () => {
      const invalidComment = {
        post_id: 'invalid-uuid',
        body: '테스트 댓글입니다.'
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('게시글 정보가 올바르지 않습니다.');
    });

    it('should reject empty body', () => {
      const invalidComment = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        body: ''
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('댓글을 입력해 주세요.');
    });

    it('should reject body exceeding max length', () => {
      const longBody = 'a'.repeat(1001);
      const invalidComment = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        body: longBody
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('댓글은 1000자 이내여야 합니다.');
    });

    it('should reject invalid parent_id UUID', () => {
      const invalidComment = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        body: '답글입니다.',
        parent_id: 'invalid-uuid'
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('부모 댓글 정보가 올바르지 않습니다.');
    });
  });

  describe('validateCommentDeletion', () => {
    it('should allow owner to delete comment', () => {
      const comment = { user_id: 'user123' };
      const currentUserId = 'user123';

      const result = validateCommentDeletion(comment, currentUserId);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject deletion by non-owner', () => {
      const comment = { user_id: 'user123' };
      const currentUserId = 'user456';

      const result = validateCommentDeletion(comment, currentUserId);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('댓글을 삭제할 권한이 없습니다.');
    });

    it('should reject deletion by unauthenticated user', () => {
      const comment = { user_id: 'user123' };
      const currentUserId = '';

      const result = validateCommentDeletion(comment, currentUserId);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다.');
    });
  });

  describe('validateCommentDepth', () => {
    it('should allow root comment (depth 0)', () => {
      const rootComment = { parent_id: null };

      const result = validateCommentDepth(rootComment);
      expect(result.isValid).toBe(true);
      expect(result.depth).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should allow first level reply (depth 1)', () => {
      const firstLevelReply = { parent_id: 'parent123' };

      const result = validateCommentDepth(firstLevelReply);
      expect(result.isValid).toBe(true);
      expect(result.depth).toBe(2);
      expect(result.error).toBeUndefined();
    });

    it('should reject comments exceeding max depth', () => {
      const deepComment = { parent_id: 'parent123' };
      const maxDepth = 1;

      const result = validateCommentDepth(deepComment, maxDepth);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('답글은 최대 1단계까지만 가능합니다.');
      expect(result.depth).toBe(2);
    });

    it('should use default max depth of 3', () => {
      const deepComment = { parent_id: 'parent123' };

      const result = validateCommentDepth(deepComment);
      expect(result.isValid).toBe(true);
      expect(result.depth).toBe(2);
    });
  });

  describe('validateCommentContent', () => {
    it('should validate and sanitize valid content', () => {
      const body = '  좋은 댓글입니다.  ';

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedBody).toBe('좋은 댓글입니다.');
      expect(result.error).toBeUndefined();
    });

    it('should reject empty content', () => {
      const body = '';

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('댓글을 입력해 주세요.');
      expect(result.sanitizedBody).toBeUndefined();
    });

    it('should reject whitespace-only content', () => {
      const body = '   ';

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('댓글을 입력해 주세요.');
      expect(result.sanitizedBody).toBeUndefined();
    });

    it('should reject content exceeding max length', () => {
      const body = 'a'.repeat(1001);

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('댓글은 1000자 이내여야 합니다.');
      expect(result.sanitizedBody).toBeUndefined();
    });

    it('should handle content at max length boundary', () => {
      const body = 'a'.repeat(1000);

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedBody).toBe(body);
      expect(result.error).toBeUndefined();
    });

    it('should handle Korean text properly', () => {
      const body = '안녕하세요! 좋은 하루 되세요. 😊';

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedBody).toBe(body);
      expect(result.error).toBeUndefined();
    });

    it('should handle multiline content', () => {
      const body = '첫 번째 줄입니다.\n두 번째 줄입니다.\n세 번째 줄입니다.';

      const result = validateCommentContent(body);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedBody).toBe(body);
      expect(result.error).toBeUndefined();
    });
  });
});
