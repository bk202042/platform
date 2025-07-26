"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { NewPostDialog as DialogUI } from "./NewPostDialog";
import type { z } from "zod";
import { createPostSchema } from "@/lib/validation/community";
import { toast } from "sonner";
import { createCommunityPost } from "../_lib/actions";
import { ActionState } from "@/lib/action-helpers";
import { Post } from "./CommunityPageClient";
import { useOptimisticUpdate } from "@/lib/hooks/useOptimisticUpdate";
import { useAuth } from "@/components/providers/AuthProvider";

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
  onPostCreated: (post: Post) => void;
  onPostRemoved: (postId: string) => void;
}

export function NewPostDialogClient({
  open,
  onClose,
  cities,
  apartments,
  onPostCreated,
  onPostRemoved,
}: NewPostDialogClientProps) {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const defaultValues = useMemo(() => {
    const apartmentId = searchParams.get("apartmentId");
    return apartmentId ? { apartment_id: apartmentId } : {};
  }, [searchParams]);

  const handleSubmit = async (values: z.infer<typeof createPostSchema>) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const tempId = Date.now().toString();
    const apartment = apartments.find(apt => apt.id === values.apartment_id);
    const optimisticPost: Post = {
      ...values,
      id: tempId,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user: { name: user.user_metadata.name || "나" },
      apartments: apartment ? { name: apartment.name, cities: { name: cities.find(c => c.id === apartment.city_id)?.name || '' } } : undefined,
      isOptimistic: true,
      images: values.images?.map(url => ({
        id: crypto.randomUUID(),
        post_id: tempId,
        storage_path: url,
        display_order: 0,
        alt_text: '',
        metadata: {},
        created_at: new Date().toISOString(),
      })) || [],
    };

    executeOptimistic(
      () => onPostCreated(optimisticPost),
      async () => {
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
        const result = await createCommunityPost({} as ActionState, formData);
        if (result.error) throw new Error(result.error);
        return result.data;
      },
      () => onPostRemoved(tempId),
      {
        onSuccess: (newPost) => {
          onPostRemoved(tempId);
          onPostCreated(newPost as Post);
          toast.success("게시글이 작성되었습니다.");
          onClose();
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  };

  return (
    <DialogUI
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      cities={cities}
      apartments={apartments}
      loading={isLoading}
      error={error}
      defaultValues={defaultValues}
    />
  );
}
