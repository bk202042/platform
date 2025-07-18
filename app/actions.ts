"use server";
import { validatedAction, validatedActionWithUser } from '@/lib/action-helpers';
import { UpdateProfileSchema, PostSchema } from '@/lib/schemas';
import type { ActionState } from '@/lib/action-helpers';

export const submitContactForm = validatedAction(
  PostSchema,
  async (_data): Promise<ActionState> => {
    // ...business logic...
    return { success: "Message sent!" };
  }
);

export const updateProfile = validatedActionWithUser(
  UpdateProfileSchema,
  async (_data, _formData, _user): Promise<ActionState> => {
    // ...business logic using user...
    return { success: "Profile updated!" };
  }
);
