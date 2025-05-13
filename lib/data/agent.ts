import "server-only";
import { unstable_cache } from "next/cache";
import { createApiClient } from "../../lib/supabase/server-api";
import { AgentRegistrationData } from "../../types/agent";

/**
 * Register a new agent
 */
export async function registerAgent(agentData: AgentRegistrationData) {
  try {
    const supabase = createApiClient();

    // Log to help debug
    console.log("Registering agent with data:", {
      ...agentData,
      email: agentData.email.substring(0, 3) + "***", // Mask email for privacy in logs
    });

    const { data, error } = await supabase
      .from("agent_registrations")
      .insert([
        {
          first_name: agentData.firstName,
          last_name: agentData.lastName,
          sales_volume: agentData.salesVolume,
          email: agentData.email,
          phone: agentData.phone,
          zip_code: agentData.zipCode,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(
        `Failed to register agent: ${error.message || JSON.stringify(error)}`,
      );
    }

    console.log("Agent registered successfully with ID:", data?.[0]?.id);
    return { success: true, id: data?.[0]?.id };
  } catch (err) {
    console.error("Unexpected error in registerAgent:", err);
    throw err;
  }
}

/**
 * Get agent registrations with optional filters
 */
export const getPendingAgentRegistrations = unstable_cache(
  async () => {
    const supabase = createApiClient();

    const { data, error } = await supabase
      .from("agent_registrations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch pending agent registrations: ${error.message}`,
      );
    }

    return data || [];
  },
  ["pending-agent-registrations"],
  { tags: ["agent-registrations"], revalidate: 60 }, // Cache for 1 minute
);

/**
 * Update an agent registration status
 */
export async function updateAgentRegistrationStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  notes?: string,
) {
  const supabase = createApiClient();

  const updateData: Record<string, string | Date> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status !== "pending") {
    updateData.processed_at = new Date().toISOString();
  }

  if (notes) {
    updateData.notes = notes;
  }

  const { error } = await supabase
    .from("agent_registrations")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(
      `Failed to update agent registration status: ${error.message}`,
    );
  }

  return { success: true };
}
