"use client";

import { PropertyListing } from "@/types/property";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bath, BedDouble, Home, Maximize, Wifi } from "lucide-react";

interface PropertyFeaturesProps {
  property: PropertyListing;
}

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const featureSections = {
    interior: [
      { icon: BedDouble, label: `${property.bedrooms} 침실` },
      { icon: Bath, label: `${property.bathrooms} 욕실` },
      { icon: Maximize, label: `${property.square_footage} 평방피트` },
      { icon: Home, label: "현대식 주방" },
      { icon: Wifi, label: "초고속 인터넷" },
    ],
    building: [
      "엘리베이터 이용 가능",
      "헬스장",
      "택배 수령 서비스",
      "보안 시스템",
      "주차 가능",
    ],
    exterior: [
      "개인 발코니",
      "정원 이용 가능",
      "BBQ 공간",
      "수영장",
      "어린이 놀이터",
    ],
    additional: [
      "24시간 보안",
      "반려동물 동반 가능",
      "대중교통 인접",
      "국제학교 인근",
      "쇼핑센터 인근",
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Interior Features */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">내부 특징</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureSections.interior.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
      {/* Building Amenities */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">건물 편의시설</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.building.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      {/* Exterior Features */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">외부 특징</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.exterior.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      {/* Additional Information */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">추가 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.additional.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
    </div>
  );
}
