"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function KoreanExpatriatesSection() {
  return (
    <section className="bg-muted py-12 px-4 rounded-lg mb-16">
      <div className="container mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          For Korean Expatriates in Vietnam
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
          Our platform specializes in properties near Korean communities,
          international schools, and Korean amenities
        </p>
        <div className="flex justify-center">
          <Link href="/search">
            <Button size="lg">Start Your Search</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
