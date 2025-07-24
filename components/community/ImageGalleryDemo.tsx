"use client";

import React, { useState } from "react";
import { ImageGallery, type ImageGalleryImage } from "./ImageGallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample images for demo
const sampleImages: ImageGalleryImage[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    alt: "Modern apartment living room",
    width: 800,
    height: 600,
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop",
    alt: "Kitchen interior",
    width: 800,
    height: 800,
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
    alt: "Bedroom with city view",
    width: 800,
    height: 500,
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=700&fit=crop",
    alt: "Bathroom design",
    width: 800,
    height: 700,
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    alt: "Balcony with plants",
    width: 800,
    height: 600,
  },
];

export function ImageGalleryDemo() {
  const [layout, setLayout] = useState<"grid" | "carousel" | "masonry">("grid");
  const [imageCount, setImageCount] = useState(3);
  const [showLightbox, setShowLightbox] = useState(true);
  const [lazy, setLazy] = useState(true);

  const displayImages = sampleImages.slice(0, imageCount);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>ImageGallery 컴포넌트 데모</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <span className="text-sm font-medium">레이아웃:</span>
              <Button
                variant={layout === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setLayout("grid")}
              >
                그리드
              </Button>
              <Button
                variant={layout === "carousel" ? "default" : "outline"}
                size="sm"
                onClick={() => setLayout("carousel")}
              >
                캐러셀
              </Button>
              <Button
                variant={layout === "masonry" ? "default" : "outline"}
                size="sm"
                onClick={() => setLayout("masonry")}
              >
                메이슨리
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">이미지 수:</span>
              {[1, 2, 3, 4, 5].map((count) => (
                <Button
                  key={count}
                  variant={imageCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLightbox}
                  onChange={(e) => setShowLightbox(e.target.checked)}
                  className="rounded"
                />
                라이트박스 표시
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lazy}
                  onChange={(e) => setLazy(e.target.checked)}
                  className="rounded"
                />
                지연 로딩
              </label>
            </div>
          </div>

          {/* Gallery Display */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <ImageGallery
              images={displayImages}
              layout={layout}
              showLightbox={showLightbox}
              lazy={lazy}
              onImageClick={(index) => {
                console.log(`이미지 클릭됨: ${index}`);
              }}
            />
          </div>

          {/* Feature Description */}
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium">주요 기능:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>🖼️ 3가지 레이아웃 지원 (그리드, 캐러셀, 메이슨리)</li>
              <li>🔍 라이트박스 모달 (키보드 및 터치 제스처 지원)</li>
              <li>⚡ 점진적 이미지 로딩 (blur-up 효과)</li>
              <li>👆 터치 친화적 스와이프 네비게이션</li>
              <li>🚀 지연 로딩 (Intersection Observer)</li>
              <li>📱 반응형 디자인</li>
            </ul>
          </div>

          {/* Usage Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium">사용법:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>이미지 클릭 → 라이트박스 열기</li>
              <li>라이트박스에서 화살표 키 또는 버튼으로 네비게이션</li>
              <li>모바일에서 스와이프 제스처 지원</li>
              <li>ESC 키로 라이트박스 닫기</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
