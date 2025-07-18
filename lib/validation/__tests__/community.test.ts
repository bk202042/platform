import { describe, it, expect } from "@jest/globals";
import {
  createPostSchema,
  createCommentSchema,
  COMMUNITY_CATEGORIES,
  type CommunityCategory,
} from "../community";

describe("Community Validation", () => {
  describe("createPostSchema", () => {
    it("should validate a valid post", () => {
      const validPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: ["https://example.com/image1.jpg"],
      };

      const result = createPostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPost);
      }
    });

    it("should require apartment_id", () => {
      const invalidPost = {
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: [],
      };

      const result = createPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes("apartment_id")),
        ).toBe(true);
      }
    });

    it("should require valid category", () => {
      const invalidPost = {
        apartment_id: "apt-123",
        category: "INVALID_CATEGORY",
        title: "Test Post",
        body: "This is a test post body",
        images: [],
      };

      const result = createPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes("category")),
        ).toBe(true);
      }
    });

    it("should require body", () => {
      const invalidPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        images: [],
      };

      const result = createPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("body"))).toBe(
          true,
        );
      }
    });

    it("should validate body length constraints", () => {
      const shortBodyPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "x", // Too short
        images: [],
      };

      const shortResult = createPostSchema.safeParse(shortBodyPost);
      expect(shortResult.success).toBe(false);

      const longBodyPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "x".repeat(2001), // Too long
        images: [],
      };

      const longResult = createPostSchema.safeParse(longBodyPost);
      expect(longResult.success).toBe(false);
    });

    it("should validate title length constraints when provided", () => {
      const longTitlePost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "x".repeat(101), // Too long
        body: "This is a valid body",
        images: [],
      };

      const result = createPostSchema.safeParse(longTitlePost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("title"))).toBe(
          true,
        );
      }
    });

    it("should validate images array constraints", () => {
      const tooManyImagesPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: Array(6).fill("https://example.com/image.jpg"), // Too many images
      };

      const result = createPostSchema.safeParse(tooManyImagesPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("images"))).toBe(
          true,
        );
      }
    });

    it("should validate image URLs", () => {
      const invalidImagePost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: ["not-a-valid-url"],
      };

      const result = createPostSchema.safeParse(invalidImagePost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("images"))).toBe(
          true,
        );
      }
    });

    it("should allow empty title", () => {
      const noTitlePost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        body: "This is a test post body",
        images: [],
      };

      const result = createPostSchema.safeParse(noTitlePost);
      expect(result.success).toBe(true);
    });

    it("should allow empty images array", () => {
      const noImagesPost = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: [],
      };

      const result = createPostSchema.safeParse(noImagesPost);
      expect(result.success).toBe(true);
    });
  });

  describe("createCommentSchema", () => {
    it("should validate a valid comment", () => {
      const validComment = {
        post_id: "post-123",
        body: "This is a test comment",
      };

      const result = createCommentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validComment);
      }
    });

    it("should require post_id", () => {
      const invalidComment = {
        body: "This is a test comment",
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes("post_id")),
        ).toBe(true);
      }
    });

    it("should require body", () => {
      const invalidComment = {
        post_id: "post-123",
      };

      const result = createCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("body"))).toBe(
          true,
        );
      }
    });

    it("should validate body length constraints", () => {
      const shortBodyComment = {
        post_id: "post-123",
        body: "", // Too short
      };

      const shortResult = createCommentSchema.safeParse(shortBodyComment);
      expect(shortResult.success).toBe(false);

      const longBodyComment = {
        post_id: "post-123",
        body: "x".repeat(1001), // Too long
      };

      const longResult = createCommentSchema.safeParse(longBodyComment);
      expect(longResult.success).toBe(false);
    });
  });

  describe("COMMUNITY_CATEGORIES", () => {
    it("should contain expected categories", () => {
      expect(COMMUNITY_CATEGORIES).toContain("QNA");
      expect(COMMUNITY_CATEGORIES).toContain("RECOMMEND");
      expect(COMMUNITY_CATEGORIES).toContain("SECONDHAND");
      expect(COMMUNITY_CATEGORIES).toContain("FREE");
    });

    it("should be readonly array", () => {
      expect(Array.isArray(COMMUNITY_CATEGORIES)).toBe(true);
      expect(COMMUNITY_CATEGORIES.length).toBeGreaterThan(0);
    });

    it("should have unique values", () => {
      const uniqueCategories = [...new Set(COMMUNITY_CATEGORIES)];
      expect(uniqueCategories.length).toBe(COMMUNITY_CATEGORIES.length);
    });
  });

  describe("Type Guards and Validation Helpers", () => {
    it("should validate category type correctly", () => {
      const validCategory: CommunityCategory = "QNA";
      expect(COMMUNITY_CATEGORIES.includes(validCategory)).toBe(true);

      // Test with string that should be invalid
      const invalidCategory = "INVALID_CATEGORY";
      expect(
        COMMUNITY_CATEGORIES.includes(invalidCategory as CommunityCategory),
      ).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null and undefined values", () => {
      const nullPost = createPostSchema.safeParse(null);
      expect(nullPost.success).toBe(false);

      const undefinedPost = createPostSchema.safeParse(undefined);
      expect(undefinedPost.success).toBe(false);
    });

    it("should handle empty objects", () => {
      const emptyPost = createPostSchema.safeParse({});
      expect(emptyPost.success).toBe(false);
    });

    it("should handle objects with extra properties", () => {
      const postWithExtra = {
        apartment_id: "apt-123",
        category: "QNA" as CommunityCategory,
        title: "Test Post",
        body: "This is a test post body",
        images: [],
        extraProperty: "should be ignored",
      };

      const result = createPostSchema.safeParse(postWithExtra);
      expect(result.success).toBe(true);
      if (result.success) {
        expect("extraProperty" in result.data).toBe(false);
      }
    });

    it("should handle malformed data types", () => {
      const malformedPost = {
        apartment_id: 123, // Should be string
        category: "QNA",
        title: ["not", "a", "string"], // Should be string
        body: "This is a test post body",
        images: "not-an-array", // Should be array
      };

      const result = createPostSchema.safeParse(malformedPost);
      expect(result.success).toBe(false);
    });
  });
});
