"use client";
import { useState } from "react";
import { NewPostDialog as DialogUI } from "./NewPostDialog";
import type { z } from "zod";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";

interface City {
  id: string;
  name: string;
}
interface Apartment {
  id: string;
  name: string;
  city_id: string;
}

interface NewPostDialogClientProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  apartments: Apartment[];
  onPostCreated?: () => void;
}

export function NewPostDialogClient({
  open,
  onClose,
  cities,
  apartments,
  onPostCreated,
}: NewPostDialogClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: z.infer<typeof createPostSchema>) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.message || "글 작성에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage); // 사용자에게 토스트 알림으로 오류 표시
        setLoading(false);
        return;
      }
      toast.success("글이 성공적으로 등록되었습니다."); // 성공 토스트 알림
      onClose();
      onPostCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage); // 네트워크 오류도 토스트로 표시
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogUI
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      cities={cities}
      apartments={apartments}
      loading={loading}
      error={error}
    />
  );
}
