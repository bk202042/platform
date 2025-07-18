import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().max(200, 'Bio too long.').optional(),
});

export const PostSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(10, 'Content is too short.'),
});
