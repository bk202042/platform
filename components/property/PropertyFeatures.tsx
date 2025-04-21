"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PropertyFeaturesProps {
  features: Record<string, any>;
}

// Helper function to format feature names
function formatFeatureName(key: string): string {
  // Convert camelCase to Title Case with spaces
  const formatted = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

  // Special cases for Korean-specific features
  if (key.startsWith("korean")) {
    return formatted.replace("Korean", "Korean ");
  }

  return formatted;
}

// Group features by category
function groupFeatures(features: Record<string, any>) {
  const groups: Record<string, Record<string, any>> = {
    "Property Features": {},
    Amenities: {},
    "Korean Features": {},
    Other: {},
  };

  Object.entries(features).forEach(([key, value]) => {
    if (key.startsWith("korean")) {
      groups["Korean Features"][key] = value;
    } else if (
      [
        "parking",
        "elevator",
        "balcony",
        "garden",
        "pool",
        "gym",
        "security",
      ].includes(key)
    ) {
      groups["Amenities"][key] = value;
    } else if (
      [
        "furnished",
        "airConditioning",
        "heating",
        "washer",
        "dryer",
        "dishwasher",
        "refrigerator",
      ].includes(key)
    ) {
      groups["Property Features"][key] = value;
    } else {
      groups["Other"][key] = value;
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((groupName) => {
    if (Object.keys(groups[groupName]).length === 0) {
      delete groups[groupName];
    }
  });

  return groups;
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  if (!features || Object.keys(features).length === 0) {
    return (
      <div className="text-muted-foreground">
        No features specified for this property.
      </div>
    );
  }

  const groupedFeatures = groupFeatures(features);

  return (
    <div className="space-y-6">
      {Object.entries(groupedFeatures).map(([groupName, groupFeatures]) => (
        <div key={groupName}>
          <h3 className="text-lg font-medium mb-3">{groupName}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(groupFeatures).map(([key, value]) => {
              if (value === true) {
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{formatFeatureName(key)}</span>
                  </div>
                );
              } else if (value === false) {
                return null;
              } else if (
                typeof value === "string" ||
                typeof value === "number"
              ) {
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      {formatFeatureName(key)}
                    </Badge>
                    <span className="text-sm">{value}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  );
}
