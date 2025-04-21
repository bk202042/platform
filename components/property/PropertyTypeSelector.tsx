"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function PropertyTypeSelector() {
  const [activeType, setActiveType] = useState<"buy" | "rent" | "all">("buy");
  const router = useRouter();

  const handleTypeChange = (type: "buy" | "rent" | "all") => {
    setActiveType(type);

    // Navigate to the appropriate search page
    switch (type) {
      case "buy":
        router.push("/search?propertyType=매매");
        break;
      case "rent":
        router.push("/search?propertyType=월세");
        break;
      case "all":
        router.push("/properties");
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg p-1 flex mb-8 shadow-md">
      <Button
        variant={activeType === "buy" ? "default" : "ghost"}
        className="rounded-md px-8 py-2 text-base"
        onClick={() => handleTypeChange("buy")}
      >
        Buy
      </Button>
      <Button
        variant={activeType === "rent" ? "default" : "ghost"}
        className="rounded-md px-8 py-2 text-base"
        onClick={() => handleTypeChange("rent")}
      >
        Rent
      </Button>
      <Button
        variant={activeType === "all" ? "default" : "ghost"}
        className="rounded-md px-8 py-2 text-base"
        onClick={() => handleTypeChange("all")}
      >
        All
      </Button>
    </div>
  );
}
