import * as React from "react";
import { PostCardSkeleton, PostCardSkeletonPresets } from "./PostCardSkeleton";

/**
 * Demo component to showcase PostCardSkeleton variations
 * This can be used for testing and development purposes
 */
export function PostCardSkeletonDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          PostCardSkeleton Demo
        </h2>
        <p className="text-gray-600">
          Various configurations of the PostCardSkeleton component for loading
          states.
        </p>
      </div>

      {/* Standard preset */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Standard Preset (3 cards)
        </h3>
        <div className="grid gap-4">{PostCardSkeletonPresets.standard(3)}</div>
      </section>

      {/* Minimal preset */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Minimal Preset (2 cards)
        </h3>
        <div className="grid gap-4">{PostCardSkeletonPresets.minimal(2)}</div>
      </section>

      {/* Rich preset */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Rich Preset (1 card)
        </h3>
        <div className="grid gap-4">{PostCardSkeletonPresets.rich(1)}</div>
      </section>

      {/* Custom configuration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Custom Configuration
        </h3>
        <div className="grid gap-4">
          <PostCardSkeleton
            count={2}
            showCategory={true}
            showApartment={false}
            showTitle={true}
            showImages={true}
          />
        </div>
      </section>
    </div>
  );
}
