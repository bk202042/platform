"use client";
import { useState } from "react";
import { NewPostDialog as DialogUI } from "./NewPostDialog";
import type { z } from "zod";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";
import { createCommunityPost } from "../_lib/actions";
import { ActionState } from "@/lib/action-helpers";

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
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(values: z.infer<typeof createPostSchema>) {
    setLoading(true);
    setError(undefined);

    const formData = new FormData();
    for (const key in values) {
      const value = values[key as keyof typeof values];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    const result = await createCommunityPost({} as ActionState, formData);

    setLoading(false);
    if (result.success) {
      toast.success(result.success);
      onClose();
      onPostCreated?.();
    }
    if (result.error) {
      toast.error(result.error);
      setError(result.error);
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
