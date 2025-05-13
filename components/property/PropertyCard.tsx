"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PropertyListing } from "@/types/property";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: PropertyListing;
  showDistance?: boolean;
  distanceMeters?: number;
}

// Format price based on property type
const formatPrice = (price: number, type: string) => {
  // Use a fixed locale to avoid hydration mismatches
  if (type === "월세") {
    return `$${price.toLocaleString("en-US")}/월`;
  } else {
    return `$${price.toLocaleString("en-US")}`;
  }
};

// Format distance in a human-readable way
const formatDistance = (meters: number) => {
  // Use fixed precision to avoid hydration mismatches
  if (meters < 1000) {
    return `${Math.floor(meters)}m 거리`;
  } else {
    const km = meters / 1000;
    return `${(Math.floor(km * 10) / 10).toFixed(1)}km 거리`;
  }
};

function PropertyCardComponent({
  property,
  showDistance = false,
  distanceMeters,
}: PropertyCardProps) {
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-lg border border-gray-200 rounded-xl shadow-md">
      <CardHeader className="pb-2">
        {property.primary_image ||
        (property.property_images &&
          property.property_images.length > 0 &&
          property.property_images[0].publicUrl) ? (
          <Image
            src={
              property.primary_image ||
              (property.property_images &&
                property.property_images.length > 0 &&
                property.property_images[0].publicUrl) ||
              "/next.svg"
            }
            alt={property.title}
            className="w-full h-48 object-cover rounded-lg mb-3"
            width={384}
            height={192}
            priority={false}
          />
        ) : (
          // fallback image
          <Image
            src="/next.svg"
            alt="이미지 없음"
            className="w-full h-48 object-cover rounded-lg mb-3"
            width={384}
            height={192}
            priority={false}
          />
        )}
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {property.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {property.address}
          {showDistance && distanceMeters && (
            <span className="ml-2 text-xs font-medium text-primary">
              {formatDistance(distanceMeters)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-3">
          <p className="font-semibold text-lg">
            {formatPrice(property.price, property.property_type)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {property.property_type === "월세" ? "월세" : "매매"}
            </span>
          </p>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium">{property.bedrooms}</span>{" "}
              <span className="text-muted-foreground ml-1">침실</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">{property.bathrooms}</span>{" "}
              <span className="text-muted-foreground ml-1">욕실</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">{property.square_footage}</span>{" "}
              <span className="text-muted-foreground ml-1">제곱피트</span>
            </div>
          </div>
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {property.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/properties/${property.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full rounded-lg border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            자세히 보기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const PropertyCard = memo(PropertyCardComponent);
