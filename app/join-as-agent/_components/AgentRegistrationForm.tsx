"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const formSchema = z.object({
  firstName: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  lastName: z.string().min(2, "성은 최소 2자 이상이어야 합니다."),
  salesVolume: z.string(),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  phone: z.string().min(10, "유효한 전화번호를 입력해주세요."),
  zipCode: z.string().min(5, "유효한 우편번호를 입력해주세요."),
});

export default function AgentRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      salesVolume: "",
      zipCode: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const res = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "등록 제출에 실패했습니다.");
      }

      toast.success("중개인 등록이 제출되었습니다! 곧 연락드리겠습니다.");
      reset();
      router.push("/join-as-agent/success");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "제출 중 문제가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-first-name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            이름
          </label>
          <input
            id="agent-first-name"
            type="text"
            {...register("firstName")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="agent-last-name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            성
          </label>
          <input
            id="agent-last-name"
            type="text"
            {...register("lastName")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-email"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            이메일
          </label>
          <input
            id="agent-email"
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
        <div className="flex-1">
          <label
            htmlFor="agent-phone"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            전화번호
          </label>
          <input
            id="agent-phone"
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

      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-sales-volume"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            연간 판매량
          </label>
          <select
            id="agent-sales-volume"
            {...register("salesVolume")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          >
            <option value="">판매량 선택</option>
            <option value="Less than 1 billion VND">10억 VND 미만</option>
            <option value="1-5 billion VND">10억-50억 VND</option>
            <option value="5-10 billion VND">50억-100억 VND</option>
            <option value="10-50 billion VND">100억-500억 VND</option>
            <option value="Over 50 billion VND">500억 VND 초과</option>
          </select>
          {errors.salesVolume && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.salesVolume.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="agent-zip-code"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            우편번호
          </label>
          <input
            id="agent-zip-code"
            type="text"
            {...register("zipCode")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.zipCode && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.zipCode.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#007882] hover:bg-[#006670] text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "제출 중..." : "등록 제출"}
      </button>
    </form>
  );
}
