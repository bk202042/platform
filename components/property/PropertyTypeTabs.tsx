"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PropertyTypeTabsProps {
  defaultTab?: "rent" | "buy";
}

export function PropertyTypeTabs({
  defaultTab = "rent",
}: PropertyTypeTabsProps) {
  const [activeTab, setActiveTab] = useState<"rent" | "buy">(defaultTab);

  return (
    <div className="mb-8">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("rent")}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === "rent"
              ? "border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          For Rent (월세)
        </button>
        <button
          onClick={() => setActiveTab("buy")}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === "buy"
              ? "border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          For Sale (매매)
        </button>
      </div>

      {/* Content for Rent Tab */}
      <div id="rent" className={cn("mt-6", activeTab !== "rent" && "hidden")}>
        <div id="rent-content"></div>
      </div>

      {/* Content for Buy Tab */}
      <div id="buy" className={cn("mt-6", activeTab !== "buy" && "hidden")}>
        <div id="buy-content"></div>
      </div>
    </div>
  );
}
