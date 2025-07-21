"use client";
import { useActionState, useEffect } from "react";
import { NewPostDialog as DialogUI } from "./NewPostDialog";
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
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCommunityPost,
    { error: undefined, success: undefined },
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onClose();
      onPostCreated?.();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onClose, onPostCreated]);

  return (
    <DialogUI
      open={open}
      onClose={onClose}
      onSubmit={formAction}
      cities={cities}
      apartments={apartments}
      loading={pending}
      error={state.error}
    />
  );
}
