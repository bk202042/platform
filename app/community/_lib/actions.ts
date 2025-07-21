"use server";

import { z } from "zod";
import { validatedActionWithUser } from "@/lib/action-helpers";
import { createPostSchema } from "@/lib/validation/community";
import { createPost } from "@/lib/data/community";
import { revalidatePath } from "next/cache";

export const createCommunityPost = validatedActionWithUser(
  createPostSchema,
  async (data, _, user) => {
    try {
      const post = await createPost({ ...data, user_id: user.id });
      revalidatePath("/community");
      return { success: "Post created successfully.", data: post };
    } catch (error) {
      return { error: "Failed to create post." };
    }
  },
);
