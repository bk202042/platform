"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin");
  const data = Object.fromEntries(formData.entries());

  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    // TODO: Handle validation errors more gracefully
    return {
      error: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Supabase sign-up error:", error);
    // TODO: Provide more user-friendly error messages
    return {
      error: { _form: "Server error. Please try again later." },
    };
  }

  redirect("/auth/sign-up-success");
}
