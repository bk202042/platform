import { z } from "zod";

// Agent registration validation schema
export const agentRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  salesVolume: z.string().min(1, "Please select your sales volume"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
});

// Type inference from schema
export type AgentRegistrationValidatedData = z.infer<
  typeof agentRegistrationSchema
>;

// Utility function to validate agent registration data
export function validateAgentRegistration(data: unknown) {
  return agentRegistrationSchema.safeParse(data);
}
