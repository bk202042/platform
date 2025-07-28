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
import { EnhancedError, ActionResult } from "@/lib/types/community";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";

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
  initialLocation?: LocationSearchResult | null;
}

export function NewPostDialogClient({
  open,
  onClose,
  cities,
  apartments,
  onPostCreated,
  onPostRemoved,
  initialLocation,
}: NewPostDialogClientProps) {
  const { executeOptimistic, isLoading } = useOptimisticUpdate();
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const defaultValues = useMemo(() => {
    // Prioritize initialLocation over URL params for better UX
    if (initialLocation?.type === "apartment") {
      return { apartment_id: initialLocation.id };
    }
    
    // Fallback to URL params if no initialLocation
    const apartmentId = searchParams.get("apartmentId");
    return apartmentId ? { apartment_id: apartmentId } : {};
  }, [initialLocation, searchParams]);

  const handleSubmit = async (values: z.infer<typeof createPostSchema>) => {
    // Enhanced authentication validation with logging
    if (!user) {
      console.error(`ERROR|client|NewPostDialog|authentication_required|no_user_session`);
      toast.error("로그인이 필요합니다.");
      setError("로그인이 필요합니다. 페이지를 새로고침하고 다시 시도해주세요.");
      return;
    }

    // Validate user session completeness
    if (!user.id) {
      console.error(`ERROR|client|NewPostDialog|invalid_user_session|missing_user_id`);
      toast.error("사용자 정보가 올바르지 않습니다.");
      setError("사용자 세션이 유효하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    // Log post creation attempt
    console.log(`INFO|client|NewPostDialog|post_creation_attempt|user_id=${user.id}|apartment_id=${values.apartment_id}|category=${values.category}`);

    const tempId = Date.now().toString();
    const apartment = apartments.find(apt => apt.id === values.apartment_id);
    
    // Validate apartment selection
    if (!apartment) {
      console.error(`ERROR|client|NewPostDialog|invalid_apartment|apartment_id=${values.apartment_id}|user_id=${user.id}`);
      setError("선택한 아파트가 유효하지 않습니다. 다시 선택해주세요.");
      return;
    }

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
        try {
          console.log(`INFO|client|NewPostDialog|form_data_preparation|user_id=${user.id}`);
          
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
          
          console.log(`INFO|client|NewPostDialog|server_action_call|user_id=${user.id}`);
          const result = await createCommunityPost({} as ActionState, formData);
          
          if (result.error) {
            // Enhanced error logging with error details
            const actionResult = result as ActionResult;
            const errorCode = actionResult.errorCode || 'unknown';
            const timestamp = actionResult.timestamp || new Date().toISOString();
            
            console.error(`ERROR|client|NewPostDialog|server_action_failed|${errorCode}|${result.error}|user_id=${user.id}|timestamp=${timestamp}`);
            
            // Create enhanced error for better user experience
            const enhancedError: EnhancedError = new Error(result.error);
            enhancedError.code = errorCode;
            enhancedError.timestamp = timestamp;
            enhancedError.context = 'server_action';
            
            throw enhancedError;
          }
          
          console.log(`SUCCESS|client|NewPostDialog|post_created|user_id=${user.id}|post_id=${result.data?.id}`);
          return result.data;
        } catch (actionError) {
          // Comprehensive error logging for action failures
          const errorMessage = actionError instanceof Error ? actionError.message : String(actionError);
          const enhancedActionError = actionError as EnhancedError;
          const errorCode = enhancedActionError.code || 'unknown';
          
          console.error(`ERROR|client|NewPostDialog|action_execution_failed|${errorCode}|${errorMessage}|user_id=${user.id}`);
          console.error("Full action error object:", actionError);
          
          throw actionError;
        }
      },
      () => onPostRemoved(tempId),
      {
        onSuccess: (newPost) => {
          onPostRemoved(tempId);
          onPostCreated(newPost as Post);
          console.log(`SUCCESS|client|NewPostDialog|optimistic_update_completed|user_id=${user.id}|post_id=${newPost?.id}`);
          toast.success("게시글이 작성되었습니다.");
          setError(undefined); // Clear any previous errors
          onClose(); // Close dialog after successful post creation
        },
        onError: (err) => {
          // Enhanced error categorization for user-friendly messages
          const enhancedErr = err as EnhancedError;
          const errorMessage = enhancedErr.message || String(err);
          const errorCode = enhancedErr.code || 'unknown';
          const context = enhancedErr.context || 'unknown';
          
          console.error(`ERROR|client|NewPostDialog|optimistic_update_failed|${errorCode}|${errorMessage}|user_id=${user.id}|context=${context}`);
          
          // Categorize errors for better user experience
          let userFriendlyMessage = errorMessage;
          
          if (errorMessage.includes('Invalid apartment')) {
            userFriendlyMessage = "선택한 아파트가 유효하지 않습니다. 아파트를 다시 선택해주세요.";
          } else if (errorMessage.includes('Authentication') || errorMessage.includes('로그인')) {
            userFriendlyMessage = "로그인 상태를 확인할 수 없습니다. 페이지를 새로고침하고 다시 로그인해주세요.";
          } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
            userFriendlyMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
          } else if (errorMessage.includes('duplicate') || errorMessage.includes('중복')) {
            userFriendlyMessage = "이미 같은 내용의 게시글이 있습니다. 내용을 수정하고 다시 시도해주세요.";
          } else if (errorMessage.includes('permission') || errorMessage.includes('권한')) {
            userFriendlyMessage = "게시글 작성 권한이 없습니다. 계정 상태를 확인해주세요.";
          } else if (errorMessage.includes('validation') || errorMessage.includes('필드')) {
            userFriendlyMessage = "입력한 정보가 올바르지 않습니다. 모든 필드를 확인하고 다시 시도해주세요.";
          } else if (errorCode !== 'unknown') {
            userFriendlyMessage = `오류가 발생했습니다 (${errorCode}). 잠시 후 다시 시도해주세요.`;
          }
          
          setError(userFriendlyMessage);
          toast.error(userFriendlyMessage);
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
