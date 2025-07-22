"use client";
import { useState } from "react";
import { NewPostDialog as DialogUI } from "./NewPostDialog";
import type { z } from "zod";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";
import { createCommunityPost } from "../_lib/actions";
import { ActionState } from "@/lib/action-helpers";
import { Post } from "./CommunityPageClient";

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
  onPostCreated?: (
    newPost: Omit<Post, "id" | "created_at" | "likes_count" | "comments_count">,
  ) => void;
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

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Call the server action
      const result = await createCommunityPost({} as ActionState, formData);

      if (result.success && result.data) {
        toast.success("Post created successfully!");
        onPostCreated?.(result.data);
        onClose();
      } else {
        const errorMessage = result.error || "An unknown error occurred.";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Failed to submit post:", err);
      const errorMessage = "A critical error occurred. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
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
