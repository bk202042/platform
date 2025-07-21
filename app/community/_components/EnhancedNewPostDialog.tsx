"use client";

import React, { useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NewPostDialog } from "./NewPostDialog";
import { createCommunityPost } from "../_lib/client-actions";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";
import { z } from "zod";

interface EnhancedNewPostDialogProps {
  open: boolean;
  onClose: () => void;
  cities: { id: string; name: string }[];
  apartments: { id: string; name: string; city_id: string }[];
  onPostCreated: () => void;
  defaultValues?: Partial<z.infer<typeof createPostSchema>>;
}

export function EnhancedNewPostDialog({
  open,
  onClose,
  cities,
  apartments,
  onPostCreated,
  defaultValues,
}: EnhancedNewPostDialogProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const handleSubmit = async (values: z.infer<typeof createPostSchema>) => {
    if (!user) {
      toast.error("로그인이 필요합니다");
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const result = await createCommunityPost(values);

        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
          onPostCreated();
        }
      } catch (_err) {
        const errorMessage = "게시글 작성 중 오류가 발생했습니다";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AuthGuard
      fallback={
        <NewPostDialog
          open={open}
          onClose={onClose}
          onSubmit={() => {}}
          cities={cities}
          apartments={apartments}
          loading={false}
          error="로그인이 필요합니다"
        />
      }
    >
      <NewPostDialog
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit}
        cities={cities}
        apartments={apartments}
        defaultValues={defaultValues}
        loading={isPending}
        error={error}
      />
    </AuthGuard>
  );
}
