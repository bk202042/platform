import { ImageGalleryDemo } from "@/components/community/ImageGalleryDemo";

export default function ImageGalleryTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ImageGallery 컴포넌트 테스트
        </h1>
        <ImageGalleryDemo />
      </div>
    </div>
  );
}
