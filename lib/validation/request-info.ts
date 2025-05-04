import { z } from "zod";

export const RequestInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message is required"),
});

export type RequestInfo = z.infer<typeof RequestInfoSchema>;
