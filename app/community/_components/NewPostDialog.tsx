import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPostSchema, COMMUNITY_CATEGORIES } from '@/lib/validation/community';
import { ImageUpload } from '@/components/community/ImageUpload';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Category descriptions for better UX
const CATEGORY_INFO = {
  QNA: {
    label: '질문/답변',
    description: '궁금한 것을 물어보고 답변을 받아보세요',
    icon: '❓'
  },
  RECOMMEND: {
    label: '추천',
    description: '좋은 장소나 서비스를 추천해주세요',
    icon: '👍'
  },
  SECONDHAND: {
    label: '중고거래',
    description: '중고 물품을 사고팔아보세요',
    icon: '🛒'
  },
  FREE: {
    label: '자유게시판',
    description: '자유롭게 이야기를 나눠보세요',
    icon: '💬'
  }
} as const;

interface NewPostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof createPostSchema>) => void;
  cities: { id: string; name: string }[];
  apartments: { id: string; name: string; city_id: string }[];
  defaultValues?: Partial<z.infer<typeof createPostSchema>>;
  loading?: boolean;
  error?: string;
}

interface FieldError {
  field: string;
  message: string;
}

export function NewPostDialog({
  open,
  onClose,
  onSubmit,
  cities,
  apartments,
  defaultValues,
  loading = false,
  error
}: NewPostDialogProps) {
  const [form, setForm] = React.useState<z.infer<typeof createPostSchema>>({
    apartment_id: defaultValues?.apartment_id || '',
    category: defaultValues?.category || COMMUNITY_CATEGORIES[0],
    title: defaultValues?.title || '',
    body: defaultValues?.body || '',
    images: defaultValues?.images || [],
  });
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [fieldErrors, setFieldErrors] = React.useState<FieldError[]>([]);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const filteredApartments = selectedCity
    ? apartments.filter((apt) => apt.city_id === selectedCity)
    : [];

  // Clear field errors when form values change
  React.useEffect(() => {
    setFieldErrors([]);
  }, [form]);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setForm({
        apartment_id: defaultValues?.apartment_id || '',
        category: defaultValues?.category || COMMUNITY_CATEGORIES[0],
        title: defaultValues?.title || '',
        body: defaultValues?.body || '',
        images: defaultValues?.images || [],
      });
      setFieldErrors([]);
      setTouched({});
    }
  }, [open, defaultValues]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setForm(prev => ({ ...prev, apartment_id: '' }));
    setTouched(prev => ({ ...prev, apartment_id: false }));
  };

  const getFieldError = (field: string) => {
    return fieldErrors.find(error => error.field === field)?.message;
  };

  const hasFieldError = (field: string) => {
    return fieldErrors.some(error => error.field === field);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      apartment_id: true,
      category: true,
      title: true,
      body: true,
      images: true
    });

    const result = createPostSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldError[] = result.error.errors.map(error => ({
        field: error.path[0] as string,
        message: error.message
      }));
      setFieldErrors(errors);
      return;
    }

    setFieldErrors([]);
    onSubmit(result.data);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">새 글 작성</DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <p className="text-sm text-muted-foreground">
            커뮤니티에 새로운 글을 작성해보세요
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                도시 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    hasFieldError('apartment_id') && touched.apartment_id && "border-red-500"
                  )}
                >
                  <SelectValue placeholder="도시를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment_id" className="text-sm font-medium">
                아파트 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.apartment_id}
                onValueChange={(value) => handleInputChange('apartment_id', value)}
                disabled={!selectedCity}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    hasFieldError('apartment_id') && touched.apartment_id && "border-red-500"
                  )}
                >
                  <SelectValue placeholder="아파트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {filteredApartments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFieldError('apartment_id') && touched.apartment_id && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {getFieldError('apartment_id')}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMMUNITY_CATEGORIES.map((category) => {
                const info = CATEGORY_INFO[category];
                const isSelected = form.category === category;
                return (
                  <div
                    key={category}
                    className={cn(
                      "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-muted/50",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20"
                    )}
                    onClick={() => handleInputChange('category', category)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{info.label}</span>
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              제목 (선택사항)
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
              maxLength={100}
              placeholder="제목을 입력하세요"
              className={cn(
                hasFieldError('title') && touched.title && "border-red-500"
              )}
            />
            <div className="flex justify-between items-center">
              {hasFieldError('title') && touched.title && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {getFieldError('title')}
                </div>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {(form.title || '').length}/100
              </span>
            </div>
          </div>

          {/* Body Input */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">
              본문 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, body: true }))}
              maxLength={2000}
              placeholder="내용을 입력하세요"
              className={cn(
                "min-h-[120px] resize-none",
                hasFieldError('body') && touched.body && "border-red-500"
              )}
            />
            <div className="flex justify-between items-center">
              {hasFieldError('body') && touched.body && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {getFieldError('body')}
                </div>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {form.body.length}/2000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              이미지 (최대 5개)
            </Label>
            <ImageUpload
              onImagesChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
              maxFiles={5}
              initialImages={form.images || []}
              className="border rounded-lg p-4"
            />
            {hasFieldError('images') && touched.images && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('images')}
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

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록하기'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
