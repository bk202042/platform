"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApartmentSelectorForDialog } from "@/components/community/ApartmentSelectorForDialog";
import { updatePostSchema, COMMUNITY_CATEGORIES } from "@/lib/validation/community";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useRouter } from "next/navigation";

interface City {
  id: string;
  name: string;
}

interface Apartment {
  id: string;
  name: string;
  city_id: string;
}

interface PostData {
  id: string;
  apartment_id: string;
  category: string;
  title?: string;
  body: string;
  images?: { public_url: string }[];
  user_id: string;
  created_at: string;
}

// Category descriptions for better UX
const CATEGORY_INFO = {
  QNA: {
    label: "질문/답변",
    description: "궁금한 것을 물어보고 답변을 받아보세요",
    icon: "❓",
  },
  RECOMMEND: {
    label: "추천", 
    description: "좋은 장소나 서비스를 추천해주세요",
    icon: "👍",
  },
  SECONDHAND: {
    label: "중고거래",
    description: "중고 물품을 사고팔아보세요",
    icon: "🛒",
  },
  FREE: {
    label: "자유게시판",
    description: "자유롭게 이야기를 나눠보세요",
    icon: "💬",
  },
} as const;

interface EditPostFormProps {
  post: PostData;
  cities: City[];
  apartments: Apartment[];
}

interface FieldError {
  field: string;
  message: string;
}

export function EditPostForm({ post, cities, apartments }: EditPostFormProps) {
  const router = useRouter();
  
  const [form, setForm] = useState<z.infer<typeof updatePostSchema>>({
    apartment_id: post.apartment_id,
    category: post.category as "QNA" | "RECOMMEND" | "SECONDHAND" | "FREE",
    title: post.title || "",
    body: post.body,
  });
  
  const [images, _setImages] = useState<string[]>(
    post.images?.map(img => img.public_url) || []
  );
  
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [touched, setTouched] = useState<Partial<Record<keyof z.infer<typeof updatePostSchema>, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = React.useCallback((
    field: keyof z.infer<typeof updatePostSchema>,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    
    // Clear field errors on change if touched
    if (touched[field]) {
      setFieldErrors(prev => prev.filter(e => e.field !== field));
    }
  }, [touched]);

  const handleBlur = (field: keyof z.infer<typeof updatePostSchema>) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };


  const validateField = (
    field: keyof z.infer<typeof updatePostSchema>,
    value: unknown,
  ) => {
    // Simple validation for individual fields
    let isValid = true;
    let message = "";

    switch (field) {
      case "title":
        if (typeof value === "string" && value.length > 100) {
          isValid = false;
          message = "제목은 100자 이내여야 합니다.";
        }
        break;
      case "body":
        if (typeof value === "string") {
          if (value.length === 0) {
            isValid = false;
            message = "본문을 입력해 주세요.";
          } else if (value.length > 2000) {
            isValid = false;
            message = "본문은 2000자 이내여야 합니다.";
          }
        }
        break;
      case "apartment_id":
        if (!value || (typeof value === "string" && value.length === 0)) {
          isValid = false;
          message = "아파트를 선택해주세요.";
        }
        break;
    }
    
    if (!isValid) {
      setFieldErrors((prev) => [
        ...prev.filter((e) => e.field !== field),
        { field, message },
      ]);
    } else {
      setFieldErrors((prev) => prev.filter((e) => e.field !== field));
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors.find((error) => error.field === field)?.message;
  };

  const hasFieldError = (field: string) => {
    return fieldErrors.some((error) => error.field === field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = updatePostSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldError[] = result.error.errors.map((error) => ({
        field: error.path[0] as string,
        message: error.message,
      }));
      setFieldErrors(errors);

      const errorFields = errors.map(error => error.field);
      setTouched(prev => {
        const newTouched = { ...prev };
        errorFields.forEach(field => {
          newTouched[field as keyof z.infer<typeof updatePostSchema>] = true;
        });
        return newTouched;
      });

      const firstError = errors[0];
      if (firstError) {
        const firstErrorElement = document.querySelector(`[name="${firstError.field}"], #${firstError.field}`);
        if (firstErrorElement && firstErrorElement instanceof HTMLElement) {
          firstErrorElement.focus();
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        ...result.data,
        // Note: Image updates would need separate handling
        // For now, we'll focus on text content updates
      };

      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      // Redirect to profile posts section
      router.push("/admin/profile?section=posts&success=post_updated");
    } catch (error) {
      console.error("Error updating post:", error);
      setError(error instanceof Error ? error.message : "게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/profile?section=posts");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="apartment_id" className="text-sm font-medium">
              아파트 <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>📍</span>
              <span>게시글이 표시될 지역을 선택하세요</span>
            </div>
          </div>
          <ApartmentSelectorForDialog
            cities={cities}
            apartments={apartments}
            value={form.apartment_id || ""}
            onApartmentSelect={(id) => handleInputChange("apartment_id", id)}
            className={cn(
              "transition-all duration-200",
              hasFieldError("apartment_id") && touched.apartment_id
                ? "border-red-500 bg-red-50/30"
                : form.apartment_id
                ? "border-green-500/40 bg-green-50/30"
                : "border-dashed border-muted-foreground/30 bg-muted/20"
            )}
          />
          {hasFieldError("apartment_id") && touched.apartment_id && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">
                {getFieldError("apartment_id")}
              </span>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>🏷️</span>
              <span>게시글 유형을 선택하세요</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMUNITY_CATEGORIES.map((category) => {
              const info = CATEGORY_INFO[category];
              const isSelected = form.category === category;
              return (
                <div
                  key={category}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-sm",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                      : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30",
                  )}
                  onClick={() => handleInputChange("category", category)}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "text-2xl transition-transform duration-200",
                      isSelected && "scale-110"
                    )}>
                      {info.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm transition-colors",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {info.label}
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs text-primary font-medium">선택됨</span>
                          </div>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1 transition-colors",
                        isSelected ? "text-primary/70" : "text-muted-foreground"
                      )}>
                        {info.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            제목
          </Label>
          <Input
            id="title"
            name="title"
            value={form.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            maxLength={100}
            placeholder="제목을 입력하세요"
            className={cn(
              hasFieldError("title") && touched.title && "border-red-500",
            )}
          />
          <div className="flex justify-between items-center">
            {hasFieldError("title") && touched.title && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("title")}
              </div>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {(form.title || "").length}/100
            </span>
          </div>
        </div>

        {/* Body Input */}
        <div className="space-y-2">
          <Label htmlFor="body" className="text-sm font-medium">
            본문 <span className="text-red-500">*</span>
          </Label>
          <div className={cn(
            "relative rounded-lg border-2 transition-all duration-200",
            hasFieldError("body") && touched.body
              ? "border-red-500 bg-red-50/30"
              : (form.body || "").length >= 1
              ? "border-green-500/40 bg-green-50/30"
              : "border-muted-foreground/20"
          )}>
            <Textarea
              id="body"
              name="body"
              value={form.body || ""}
              onChange={(e) => handleInputChange("body", e.target.value)}
              onBlur={() => handleBlur("body")}
              maxLength={2000}
              placeholder="게시글 내용을 수정하세요..."
              className="min-h-[120px] resize-none border-0 bg-transparent focus:ring-0"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {(form.body || "").length >= 1 && (form.body || "").length < 1800 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓
                </span>
              )}
              {(form.body || "").length >= 1800 && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  (form.body || "").length >= 1950
                    ? "text-red-600 bg-red-100"
                    : "text-[#007882] bg-[#F0FDFA]"
                )}>
                  {2000 - (form.body || "").length}자 남음
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            {hasFieldError("body") && touched.body && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">
                  {getFieldError("body")}
                </span>
              </div>
            )}
            <span className={cn(
              "text-xs ml-auto",
              (form.body || "").length >= 1950 
                ? "text-red-600 font-medium"
                : (form.body || "").length >= 1800
                ? "text-[#007882]"
                : "text-muted-foreground"
            )}>
              {(form.body || "").length}/2000
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">이미지 (최대 5개)</Label>
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">
              💡 이미지 수정은 현재 지원되지 않습니다. 이미지를 변경하려면 새 게시글을 작성해주세요.
            </p>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={imageUrl}
                      alt={`이미지 ${index + 1}`}
                      fill
                      className="object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            취소
          </Button>
          
          <Button 
            type="submit"
            disabled={isLoading || !(form.apartment_id && form.body)}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수정 중...
              </>
            ) : (
              "게시글 수정"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}