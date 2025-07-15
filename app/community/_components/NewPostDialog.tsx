import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { createPostSchema, COMMUNITY_CATEGORIES } from '@/lib/validation/community';
import { z } from 'zod';

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

export function NewPostDialog({ open, onClose, onSubmit, cities, apartments, defaultValues, loading = false, error }: NewPostDialogProps) {
  const [form, setForm] = React.useState<z.infer<typeof createPostSchema>>({
    apartment_id: defaultValues?.apartment_id || '',
    category: defaultValues?.category || COMMUNITY_CATEGORIES[0],
    title: defaultValues?.title || '',
    body: defaultValues?.body || '',
    images: defaultValues?.images || [],
  });
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const filteredApartments = selectedCity
    ? apartments.filter((apt) => apt.city_id === selectedCity)
    : [];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createPostSchema.safeParse(form);
    if (!result.success) {
      setLocalError(result.error.errors[0]?.message || '입력값이 올바르지 않습니다.');
      return;
    }
    setLocalError(null);
    onSubmit(result.data);
  }

  const images = form.images ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>글 작성</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="닫기">×</button>
          </DialogClose>
        </DialogHeader>
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="city">도시</label>
            <select
              id="city"
              name="city"
              className="w-full border rounded-lg px-3 py-2"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setForm((prev) => ({ ...prev, apartment_id: '' }));
              }}
              required
            >
              <option value="">도시를 선택하세요</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="apartment_id">아파트</label>
            <select
              id="apartment_id"
              name="apartment_id"
              className="w-full border rounded-lg px-3 py-2"
              value={form.apartment_id}
              onChange={handleChange}
              required
              disabled={!selectedCity}
            >
              <option value="">아파트를 선택하세요</option>
              {filteredApartments.map((apt) => (
                <option key={apt.id} value={apt.id}>{apt.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">카테고리</label>
            <select
              id="category"
              name="category"
              className="w-full border rounded-lg px-3 py-2"
              value={form.category}
              onChange={handleChange}
              required
            >
              {COMMUNITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">제목 (선택)</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              placeholder="제목을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="body">본문</label>
            <textarea
              id="body"
              name="body"
              className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
              value={form.body}
              onChange={handleChange}
              required
              maxLength={2000}
              placeholder="내용을 입력하세요"
            />
          </div>
          {/* 이미지 업로드(간단 버전) */}
          <div>
            <label className="block text-sm font-medium mb-1">이미지 (최대 5개, URL 입력)</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-1"
              placeholder="이미지 URL 입력 후 Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  e.preventDefault();
                  if (images.length < 5) {
                    setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), e.currentTarget.value] }));
                    e.currentTarget.value = '';
                  }
                }
              }}
              disabled={images.length >= 5}
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {/* 이미지 미리보기 삭제: 이미지를 렌더링하지 않음 */}
              {/* {images.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border">
                  <img src={url} alt="업로드 이미지" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-bl px-1 text-xs text-red-500"
                    aria-label="이미지 삭제"
                    onClick={() => setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((_, i) => i !== idx) }))}
                  >×</button>
                </div>
              ))} */}
              {/* 이미지 삭제 버튼만 남기고 싶으면 아래처럼 구현 가능 */}
              {images.map((url, idx) => (
                <div key={idx} className="relative flex items-center gap-2">
                  <span className="text-xs text-gray-500 truncate max-w-[80px]">{url}</span>
                  <button
                    type="button"
                    className="text-red-500 text-xs px-1"
                    aria-label="이미지 삭제"
                    onClick={() => setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((_, i) => i !== idx) }))}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
          {(localError || error) && <div className="text-red-500 text-sm mt-1">{localError || error}</div>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition-colors mt-2"
            disabled={loading}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
