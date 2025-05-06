"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestInfoSchema, RequestInfo } from "@/lib/validation/request-info";
import { toast } from "sonner";
import type { PropertyListing } from "@/types/property";

export default function RequestInfoForm({
  property,
}: {
  property: PropertyListing;
}) {
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
          <label
            htmlFor="request-name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="request-name"
            type="text"
            {...register("name")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="request-phone"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            id="request-phone"
            type="tel"
            {...register("phone")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="request-email"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="request-email"
          type="email"
          {...register("email")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="ml-1 mt-1 text-xs text-rose-500">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="request-message"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Message
        </label>
        <textarea
          id="request-message"
          rows={4}
          {...register("message")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="ml-1 mt-1 text-xs text-rose-500">
            {errors.message.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-[#007882] hover:bg-[#006670] text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Request Info"}
      </button>
    </form>
  );
}
