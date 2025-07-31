import { z } from 'zod';
import { getSessionUser } from './auth/server';
import type { User } from '@supabase/supabase-js';

export type ActionState = {
  error?: string;
  success?: string;
  data?: unknown;
};

export function validatedAction<S extends z.ZodType<unknown, z.ZodTypeDef>, R extends ActionState>(
  schema: S,
  action: (data: z.infer<S>, formData: FormData) => Promise<R>
) {
  return async (prevState: ActionState, formData: FormData): Promise<R> => {
    // Convert FormData to object, handling arrays properly
    const formDataObject: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (formDataObject[key]) {
        // If key already exists, convert to array or append to existing array
        if (Array.isArray(formDataObject[key])) {
          (formDataObject[key] as unknown[]).push(value);
        } else {
          formDataObject[key] = [formDataObject[key], value];
        }
      } else {
        formDataObject[key] = value;
      }
    }
    
    const parsed = schema.safeParse(formDataObject);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.errors);
      return { error: parsed.error.errors[0].message } as R;
    }
    return action(parsed.data, formData);
  };
}

export function validatedActionWithUser<S extends z.ZodType<unknown, z.ZodTypeDef>, R extends ActionState>(
  schema: S,
  action: (data: z.infer<S>, formData: FormData, user: User) => Promise<R>
) {
  return async (prevState: ActionState, formData: FormData): Promise<R> => {
    const user = await getSessionUser();
    if (!user) return { error: 'User not authenticated.' } as R;
    
    // Convert FormData to object, handling arrays properly
    const formDataObject: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (formDataObject[key]) {
        // If key already exists, convert to array or append to existing array
        if (Array.isArray(formDataObject[key])) {
          (formDataObject[key] as unknown[]).push(value);
        } else {
          formDataObject[key] = [formDataObject[key], value];
        }
      } else {
        formDataObject[key] = value;
      }
    }
    
    const parsed = schema.safeParse(formDataObject);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.errors);
      return { error: parsed.error.errors[0].message } as R;
    }
    return action(parsed.data, formData, user);
  };
}
