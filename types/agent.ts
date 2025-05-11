// Agent-related types for the platform
export interface AgentRegistrationData {
  firstName: string;
  lastName: string;
  salesVolume: string;
  email: string;
  phone: string;
  zipCode: string;
}

export interface AgentFormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}
