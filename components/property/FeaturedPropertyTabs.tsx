"use client";

import { useState } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyListing } from "@/types/property";

interface FeaturedPropertyTabsProps {
  rentProperties: PropertyListing[];
  buyProperties: PropertyListing[];
}

export function FeaturedPropertyTabs({
  rentProperties,
  buyProperties,
}: FeaturedPropertyTabsProps) {
  const [activeTab, setActiveTab] = useState<"rent" | "buy">("rent");

  const handleTabChange = (tab: "rent" | "buy") => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => handleTabChange("rent")}
            className={`px-4 py-2 font-medium ${
              activeTab === "rent"
                ? "border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }`}
          >
            For Rent (월세)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("buy")}
            className={`px-4 py-2 font-medium ${
              activeTab === "buy"
                ? "border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }`}
          >
            For Sale (매매)
          </button>
        </div>
      </div>

      {/* Rental Properties */}
      {activeTab === "rent" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {rentProperties.length > 0 ? (
            rentProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">
                No rental properties found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Purchase Properties */}
      {activeTab === "buy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {buyProperties.length > 0 ? (
            buyProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">
                No properties for sale found.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
