import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApartmentSelectorForDialog } from "@/components/community/ApartmentSelectorForDialog";
import {
  createPostSchema,
  COMMUNITY_CATEGORIES,
} from "@/lib/validation/community";
import { ImageUpload } from "@/components/community/ImageUpload";
import { useToast } from "@/components/community/ToastProvider";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface City {
  id: string;
  name: string;
}
interface Apartment {
  id: string;
  name: string;
  city_id: string;
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

interface NewPostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof createPostSchema>) => void;
  defaultValues?: Partial<z.infer<typeof createPostSchema>>;
  loading?: boolean;
  error?: string;
  cities: City[];
  apartments: Apartment[];
}

interface FieldError {
  field: string;
  message: string;
}

export function NewPostDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
  loading = false,
  error,
  cities,
  apartments,
}: NewPostDialogProps) {
  const [form, setForm] = React.useState<z.infer<typeof createPostSchema>>({
    apartment_id: defaultValues?.apartment_id || "",
    category: defaultValues?.category || COMMUNITY_CATEGORIES[0],
    title: defaultValues?.title || "",
    body: defaultValues?.body || "",
    images: defaultValues?.images || [],
  });
  const [fieldErrors, setFieldErrors] = React.useState<FieldError[]>([]);
  const [touched, setTouched] = React.useState<Partial<Record<keyof z.infer<typeof createPostSchema>, boolean>>>({});
  const { showValidationError } = useToast();

  // useAutoSave(form, `new-post-draft-${defaultValues?.apartment_id || ""}`);

  // Note: Removed automatic field error clearing to prevent infinite render loops
  // Field errors are now cleared individually during validation

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setForm({
        apartment_id: defaultValues?.apartment_id || "",
        category: defaultValues?.category || COMMUNITY_CATEGORIES[0],
        title: defaultValues?.title || "",
        body: defaultValues?.body || "",
        images: defaultValues?.images || [],
      });
      setFieldErrors([]);
      setTouched({});
    }
  }, [open, defaultValues?.apartment_id, defaultValues?.category, defaultValues?.title, defaultValues?.body, defaultValues?.images]);

  const handleInputChange = React.useCallback((
    field: keyof z.infer<typeof createPostSchema>,
    value: string | string[],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Use current touched state to avoid dependency issues
    setTouched((currentTouched) => {
      if (currentTouched[field]) {
        validateField(field, value);
      }
      return currentTouched;
    });
  }, []); // Remove touched dependency to prevent callback recreation

  const handleBlur = (field: keyof z.infer<typeof createPostSchema>) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const handleImagesChange = React.useCallback((urls: string[]) => {
    handleInputChange("images", urls);
  }, [handleInputChange]);

  const validateField = (
    field: keyof z.infer<typeof createPostSchema>,
    value: unknown,
  ) => {
    const fieldSchema = createPostSchema.pick({ [field]: true } as { [K in typeof field]: true });
    const result = fieldSchema.safeParse({ [field]: value });
    if (!result.success) {
      setFieldErrors((prev) => [
        ...prev.filter((e) => e.field !== field),
        { field, message: result.error.errors[0].message },
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = createPostSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldError[] = result.error.errors.map((error) => ({
        field: error.path[0] as string,
        message: error.message,
      }));
      setFieldErrors(errors);

      // CRITICAL FIX: Update touched state for all fields with errors
      // This ensures error messages are displayed when validation fails
      const errorFields = errors.map(error => error.field);
      setTouched(prev => {
        const newTouched = { ...prev };
        errorFields.forEach(field => {
          newTouched[field as keyof z.infer<typeof createPostSchema>] = true;
        });
        return newTouched;
      });

      // Show validation error toast
      const firstError = errors[0];
      if (firstError) {
        showValidationError(firstError.message);
        
        // Focus management: Focus the first problematic field
        const firstErrorElement = document.querySelector(`[name="${firstError.field}"], #${firstError.field}`);
        if (firstErrorElement && firstErrorElement instanceof HTMLElement) {
          firstErrorElement.focus();
        }
      }
      return;
    }

    setFieldErrors([]);
    onSubmit(result.data);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            새 글 작성
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            커뮤니티에 새로운 글을 작성해보세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6" role="form" aria-label="새 게시글 작성 양식">
          {/* Location Selection - Enhanced UX */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="apartment_id" className="text-sm font-medium">
                아파트 <span className="text-red-500">*</span>
                {!form.apartment_id && (
                  <span className="ml-2 text-xs text-[#007882] bg-[#F0FDFA] px-2 py-1 rounded-full font-medium">
                    필수
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📍</span>
                <span>게시글이 표시될 지역을 선택하세요</span>
              </div>
            </div>
            <ApartmentSelectorForDialog
              cities={cities}
              apartments={apartments}
              value={form.apartment_id}
              onApartmentSelect={(id) => {
                handleInputChange("apartment_id", id);
                // Clear apartment_id error immediately on successful selection
                setFieldErrors(prev => prev.filter(e => e.field !== "apartment_id"));
              }}
              className={cn(
                "transition-all duration-200",
                hasFieldError("apartment_id") && touched.apartment_id
                  ? "border-red-500 bg-red-50/30"
                  : form.apartment_id
                  ? "border-green-500/40 bg-green-50/30"
                  : "border-dashed border-muted-foreground/30 bg-muted/20"
              )}
              aria-label="아파트 선택"
              aria-required={true}
              aria-invalid={hasFieldError("apartment_id") && touched.apartment_id}
              aria-describedby={hasFieldError("apartment_id") && touched.apartment_id ? "apartment-error" : undefined}
            />
            {hasFieldError("apartment_id") && touched.apartment_id && (
              <div id="apartment-error" className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">
                  {getFieldError("apartment_id")}
                </span>
              </div>
            )}
            {form.apartment_id && !hasFieldError("apartment_id") && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
                <span>✅</span>
                <span>아파트가 선택되었습니다</span>
              </div>
            )}
          </div>

          {/* Category Selection - Enhanced UX */}
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
                    {/* Selection indicator */}
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
              value={form.title}
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

          {/* Body Input - Enhanced with Progressive Validation */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">
              본문 <span className="text-red-500">*</span>
            </Label>
            <div className={cn(
              "relative rounded-lg border-2 transition-all duration-200",
              hasFieldError("body") && touched.body
                ? "border-red-500 bg-red-50/30"
                : form.body.length >= 10
                ? "border-green-500/40 bg-green-50/30"
                : "border-muted-foreground/20"
            )}>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => handleInputChange("body", e.target.value)}
                onBlur={() => handleBlur("body")}
                maxLength={2000}
                placeholder="커뮤니티에 공유하고 싶은 내용을 자유롭게 작성해보세요..."
                className={cn(
                  "min-h-[120px] resize-none border-0 bg-transparent focus:ring-0",
                )}
                aria-required="true"
                aria-invalid={hasFieldError("body") && touched.body}
                aria-describedby={hasFieldError("body") && touched.body ? "body-error" : "body-help"}
              />
              {/* Progressive length indicator */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                {form.body.length > 0 && form.body.length < 10 && (
                  <span className="text-xs text-[#007882] bg-[#F0FDFA] px-2 py-1 rounded-full">
                    최소 1자 이상
                  </span>
                )}
                {form.body.length >= 10 && form.body.length < 1800 && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    ✓
                  </span>
                )}
                {form.body.length >= 1800 && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    form.body.length >= 1950
                      ? "text-red-600 bg-red-100"
                      : "text-[#007882] bg-[#F0FDFA]"
                  )}>
                    {2000 - form.body.length}자 남음
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              {hasFieldError("body") && touched.body && (
                <div id="body-error" className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700 font-medium">
                    {getFieldError("body")}
                  </span>
                </div>
              )}
              {!hasFieldError("body") && (
                <div id="body-help" className="text-xs text-muted-foreground" aria-live="polite">
                  {form.body.length === 0 
                    ? "게시글 내용을 입력하세요" 
                    : form.body.length < 10 
                    ? "최소 1자 이상 입력해주세요"
                    : "좋습니다!"
                  }
                </div>
              )}
              <span className={cn(
                "text-xs ml-auto",
                form.body.length >= 1950 
                  ? "text-red-600 font-medium"
                  : form.body.length >= 1800
                  ? "text-[#007882]"
                  : "text-muted-foreground"
              )} aria-label={`${form.body.length}자 입력됨, 최대 2000자`}>
                {form.body.length}/2000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">이미지 (최대 5개)</Label>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxFiles={5}
              initialImages={form.images || []}
              className="border rounded-lg p-4"
            />
            {hasFieldError("images") && touched.images && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("images")}
              </div>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Submit Button - Enhanced with Form State Feedback */}
          <div className="flex flex-col gap-3 pt-4">
            {/* Form completion indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    form.apartment_id ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className={cn(
                    "transition-colors",
                    form.apartment_id ? "text-green-700" : "text-red-600"
                  )}>
                    아파트
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    form.body.length >= 1 ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className={cn(
                    "transition-colors",
                    form.body.length >= 1 ? "text-green-700" : "text-red-600"
                  )}>
                    본문
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-700">카테고리</span>
                </div>
              </div>
              <div className="text-muted-foreground">
                {form.apartment_id && form.body.length >= 1 
                  ? "✅ 작성 완료" 
                  : "📝 작성 중..."
                }
              </div>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className={cn(
                  "px-8 transition-all duration-200",
                  form.apartment_id && form.body.length >= 1
                    ? "bg-primary hover:bg-primary/90 shadow-md"
                    : "bg-muted-foreground hover:bg-muted-foreground/90"
                )}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : form.apartment_id && form.body.length >= 1 ? (
                  <>
                    <span className="mr-2">🚀</span>
                    게시글 등록하기
                  </>
                ) : (
                  <>
                    <span className="mr-2">📝</span>
                    필수 항목을 작성하세요
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
