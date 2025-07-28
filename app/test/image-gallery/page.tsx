import { ImageGallery } from "@/components/community/ImageGallery";

const sampleImages = [
  { id: "1", src: "/api/placeholder/400/300", alt: "Sample image 1" },
  { id: "2", src: "/api/placeholder/400/400", alt: "Sample image 2" },
  { id: "3", src: "/api/placeholder/300/400", alt: "Sample image 3" },
];

export default function ImageGalleryTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ImageGallery 컴포넌트 테스트
        </h1>
        <ImageGallery images={sampleImages} layout="grid" />
      </div>
    </div>
  );
}
