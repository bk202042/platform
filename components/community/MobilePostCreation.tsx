"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Camera, MapPin, Hash, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMobileGestures } from "@/lib/hooks/useMobileGestures";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { CommunityCategory, COMMUNITY_CATEGORIES } from "@/lib/validation/community";

interface City {
  id: string;
  name: string;
}

interface Apartment {
  id: string;
  name: string;
  city_id: string;
}

interface MobilePostCreationProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: {
    title?: string;
    body: string;
    images?: string[];
    category?: CommunityCategory;
    apartments?: { name: string };
  }) => void;
  cities?: City[];
  apartments: Apartment[];
}

const CATEGORY_INFO = {
  QNA: { label: "질문/답변", icon: "💬", color: "bg-blue-50 text-blue-600" },
  RECOMMEND: { label: "추천", icon: "👍", color: "bg-green-50 text-green-600" },
  SECONDHAND: { label: "중고거래", icon: "🛍️", color: "bg-orange-50 text-orange-600" },
  FREE: { label: "나눔", icon: "🎁", color: "bg-purple-50 text-purple-600" },
} as const;

export function MobilePostCreation({
  open,
  onClose,
  onSubmit,
  cities: _cities,
  apartments,
}: MobilePostCreationProps) {
  const [step, setStep] = useState<'write' | 'category' | 'location'>('write');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<CommunityCategory | undefined>();
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useAutoSave(
    { title, body, category, selectedApartment: selectedApartment?.id },
    `mobile-post-draft`,
    1000
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [body]);

  // Gesture support for swiping between steps
  const { gestureHandlers } = useMobileGestures({
    onSwipeRight: () => {
      if (step === 'category') setStep('write');
      else if (step === 'location') setStep('category');
    },
    onSwipeLeft: () => {
      if (step === 'write' && body.trim()) setStep('category');
      else if (step === 'category') setStep('location');
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || undefined,
        body: body.trim(),
        images: images.length > 0 ? images : undefined,
        category,
        apartments: selectedApartment ? { name: selectedApartment.name } : undefined,
      });
      
      // Reset form
      setTitle('');
      setBody('');
      setCategory(undefined);
      setSelectedApartment(null);
      setImages([]);
      setStep('write');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, body, images, category, selectedApartment, onSubmit]);

  const canSubmit = body.trim().length > 0;
  const charCount = body.length;
  const maxChars = 2000;

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 'write' ? onClose : () => setStep('write')}
              className="p-2 -ml-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold">
              {step === 'write' && '글쓰기'}
              {step === 'category' && '카테고리 선택'}
              {step === 'location' && '지역 선택'}
            </h1>
          </div>
          
          {step === 'write' && (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} className="mr-1" />
                  게시
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex px-4 pb-2">
          <div className="flex space-x-1 w-full">
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              step === 'write' ? "bg-orange-500" : "bg-zinc-200"
            )} />
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              step === 'category' ? "bg-orange-500" : "bg-zinc-200"
            )} />
            <div className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              step === 'location' ? "bg-orange-500" : "bg-zinc-200"
            )} />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-auto" {...gestureHandlers}>
        {step === 'write' && (
          <div className="p-4 space-y-4">
            {/* Title Input */}
            <div>
              <Input
                placeholder="제목 (선택사항)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none text-lg font-medium placeholder:text-zinc-400 focus-visible:ring-0 px-0"
                maxLength={100}
              />
            </div>

            {/* Body Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="무슨 일이 일어나고 있나요?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border-none resize-none min-h-[200px] text-base placeholder:text-zinc-400 focus-visible:ring-0 px-0"
                maxLength={maxChars}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-2 text-xs text-zinc-400">
                {charCount}/{maxChars}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-zinc-600"
                  onClick={() => setStep('category')}
                >
                  <Hash size={16} />
                  {category ? CATEGORY_INFO[category].label : '카테고리'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-zinc-600"
                  onClick={() => setStep('location')}
                >
                  <MapPin size={16} />
                  {selectedApartment ? selectedApartment.name : '지역'}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-zinc-600"
                disabled
              >
                <Camera size={16} />
                사진
              </Button>
            </div>

            {/* Selected Category & Location Display */}
            <div className="flex flex-wrap gap-2">
              {category && (
                <Badge
                  variant="secondary"
                  className={cn("flex items-center gap-1", CATEGORY_INFO[category].color)}
                >
                  <span>{CATEGORY_INFO[category].icon}</span>
                  {CATEGORY_INFO[category].label}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategory(undefined)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
              
              {selectedApartment && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedApartment.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApartment(null)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {step === 'category' && (
          <div className="p-4">
            <div className="grid gap-3">
              {COMMUNITY_CATEGORIES.map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = category === cat;
                
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setStep('write');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="font-medium text-zinc-900">{info.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedApartment(null);
                  setStep('write');
                }}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 text-left"
              >
                <MapPin size={16} className="text-zinc-400" />
                <span className="text-zinc-600">지역 선택 안함</span>
              </button>
              
              {apartments.map((apartment) => {
                const isSelected = selectedApartment?.id === apartment.id;
                
                return (
                  <button
                    key={apartment.id}
                    onClick={() => {
                      setSelectedApartment(apartment);
                      setStep('write');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <MapPin size={16} className="text-zinc-400" />
                    <span className="text-zinc-900">{apartment.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}