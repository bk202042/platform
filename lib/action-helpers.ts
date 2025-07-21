import { z } from 'zod';
import { getSessionUser } from './auth';
import type { User } from '@supabase/supabase-js';

export type ActionState = {
  error?: string;
  success?: string;
  data?: any;
};

export function validatedAction<S extends z.ZodType<unknown, z.ZodTypeDef>, R extends ActionState>(
  schema: S,
  action: (data: z.infer<S>, formData: FormData) => Promise<R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { error: parsed.error.errors[0].message } as R;
    return action(parsed.data, formData);
  };
}

export function validatedActionWithUser<S extends z.ZodType<unknown, z.ZodTypeDef>, R extends ActionState>(
  schema: S,
  action: (data: z.infer<S>, formData: FormData, user: User) => Promise<R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    const user = await getSessionUser();
    if (!user) return { error: 'User not authenticated.' } as R;
    const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { error: parsed.error.errors[0].message } as R;
    return action(parsed.data, formData, user);
  };
}
