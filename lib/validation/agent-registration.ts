import { z } from "zod";

// Validation schema for agent registration form
export const AgentRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  salesVolume: z.enum(["$0-$5M", "$5M-$10M", "$10M-$20M", "$20M+"]),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(15, "Phone number must not exceed 15 characters")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  zipCode: z
    .string()
    .min(4, "ZIP/Postal code must be at least 4 characters")
    .max(10, "ZIP/Postal code must not exceed 10 characters"),
});

export type AgentRegistrationFormData = z.infer<typeof AgentRegistrationSchema>;
