"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestInfoSchema, RequestInfo } from "@/lib/validation/request-info";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { PropertyType, PropertyListing } from "@/types/property";
import PropertyDetail from "./_components/PropertyDetail";
import PropertyGallery from "./_components/PropertyGallery";
import PropertyFeatures from "./_components/PropertyFeatures";
import PropertyCosts from "./_components/PropertyCosts";

function RequestInfoForm({ property }: { property: PropertyListing }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestInfo>({
    resolver: zodResolver(RequestInfoSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: `I am interested in ${property.title} at ${property.address}`,
    },
  });

  const onSubmit = async (data: RequestInfo) => {
    try {
      const res = await fetch("/api/request-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send request");
      }
      toast.success("Your request has been sent! We'll get back to you soon.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="request-name" className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input id="request-name" type="text" {...register("name")} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]" disabled={isSubmitting} />
          {errors.name && <p className="ml-1 mt-1 text-xs text-rose-500">{errors.name.message}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="request-phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
          <input id="request-phone" type="tel" {...register("phone")} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]" disabled={isSubmitting} />
          {errors.phone && <p className="ml-1 mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="request-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input id="request-email" type="email" {...register("email")} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]" disabled={isSubmitting} />
        {errors.email && <p className="ml-1 mt-1 text-xs text-rose-500">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="request-message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
        <textarea id="request-message" rows={4} {...register("message")} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]" disabled={isSubmitting} />
        {errors.message && <p className="ml-1 mt-1 text-xs text-rose-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" className="bg-[#E94F1D] hover:bg-[#c43e13] text-white font-semibold py-3 px-8 rounded-lg text-lg w-full transition-colors" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Request Info"}
      </Button>
    </form>
  );
}

export default function PropertyPage() {
  // TODO: Replace mock data with real data fetching logic for production

  // Minimal mock property object for demo (replace with real data fetching logic)
  const property = {
    id: "demo-id",
    title: "Cheyenne II Plan in Provence by Ashton Woods",
    address: "Austin, TX 78738",
    description: "A beautiful home in Provence.",
    price: 570990,
    property_type: "매매" as PropertyType,
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 2095,
    property_images: [],
    location: {}, // minimal mock for location
    features: {}, // minimal mock for features
  };
  const similarProperties: typeof property[] = [];

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="container mx-auto py-10">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full border-gray-300 bg-white shadow-sm hover:bg-gray-50">
              ← Back to Home
            </Button>
          </Link>
        </div>
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
              <PropertyGallery property={property} />
            </div>
            {/* Property details */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <PropertyDetail property={property} />
            </div>
            {/* Features */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Property Features</h2>
              <PropertyFeatures property={property} />
            </div>
          </div>
          {/* Right column - Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Request Info card */}
              <Card className="p-6 border border-gray-200 rounded-2xl shadow-lg bg-white">
                <RequestInfoForm property={property} />
              </Card>
              {/* Costs breakdown */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <PropertyCosts property={property} />
              </div>
              {/* Similar properties */}
              {similarProperties.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Similar Properties</h3>
                  <div className="space-y-4">
                    {similarProperties.map((similarProperty) => (
                      <Link key={similarProperty.id} href={`/properties/${similarProperty.id}`} className="block">
                        <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                          <h4 className="font-medium line-clamp-1">{similarProperty.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{similarProperty.address}</p>
                          <p className="font-medium mt-2">${similarProperty.price.toLocaleString()}{similarProperty.property_type === "월세" ? "/month" : ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
