import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePostImageData, ImageReorderData } from "@/lib/types/community";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: "https://example.com/image.jpg" },
        })),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ data: [], error: null })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: vi.fn(() => ({ data: [], error: null })) })),
      })),
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })),
  })),
}));

describe("Image Management System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateImageFile", () => {
    it("should validate a valid image file", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB

      // Mock Image constructor for metadata extraction
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 800;
        naturalHeight = 600;

        set src(_value: string) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      global.URL.createObjectURL = vi.fn(() => "blob:test");
      global.URL.revokeObjectURL = vi.fn();

      const result = await validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.width).toBe(800);
      expect(result.metadata?.height).toBe(600);
    });

    it("should reject files that are too large", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 }); // 10MB

      const result = await validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("파일 크기가 5MB를 초과합니다.");
    });

    it("should reject unsupported file types", async () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" });
      Object.defineProperty(file, "size", { value: 1024 });

      const result = await validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "지원되지 않는 파일 형식입니다. JPG, PNG, WEBP, GIF만 허용됩니다."
      );
    });

    it("should reject images that are too small", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 });

      // Mock Image with small dimensions
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 30;
        naturalHeight = 30;

        set src(value: string) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as File;

      const result = await validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "이미지 크기가 너무 작습니다. 최소 50x50 픽셀 이상이어야 합니다."
      );
    });
  });

  describe("uploadPostImages", () => {
    it("should upload multiple images successfully", async () => {
      const files = [
        new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["test2"], "test2.png", { type: "image/png" }),
      ];

      // Mock successful validation
      vi.mocked(validateImageFile).mockResolvedValue({
        isValid: true,
        errors: [],
        metadata: { width: 800, height: 600, size: 1024, format: "image/jpeg" },
      });

      const result = await uploadPostImages(files, "test-post-id");

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("storage_path");
      expect(result[0]).toHaveProperty("public_url");
      expect(result[0]).toHaveProperty("metadata");
    });

    it("should handle upload failures gracefully", async () => {
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];

      // Mock validation failure
      vi.mocked(validateImageFile).mockResolvedValue({
        isValid: false,
        errors: ["Test error"],
      });

      await expect(uploadPostImages(files, "test-post-id")).rejects.toThrow(
        "File test.jpg: Test error"
      );
    });
  });

  describe("savePostImages", () => {
    it("should save image metadata to database", async () => {
      const imageData: CreatePostImageData[] = [
        {
          storage_path: "community-images/test.jpg",
          display_order: 0,
          alt_text: "Test image",
          metadata: { original_name: "test.jpg" },
        },
      ];

      const result = await savePostImages("test-post-id", imageData);

      expect(result).toBeDefined();
    });
  });

  describe("reorderPostImages", () => {
    it("should update display order of images", async () => {
      const reorderData: ImageReorderData[] = [
        { id: "image-1", display_order: 1 },
        { id: "image-2", display_order: 0 },
      ];

      await expect(reorderPostImages(reorderData)).resolves.not.toThrow();
    });
  });

  describe("deletePostImage", () => {
    it("should delete image from storage and database", async () => {
      await expect(deletePostImage("test-image-id")).resolves.not.toThrow();
    });
  });
});
