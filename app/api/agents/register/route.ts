import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { validateAgentRegistration } from "@/lib/validation/agent";
import { registerAgent } from "@/lib/data/agent";
import AgentRegistrationEmail from "@/app/emails/AgentRegistrationEmail";
import "server-only";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = validateAgentRegistration(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const agentData = validationResult.data;

    try {
      // Use the data access layer to register the agent
      await registerAgent(agentData);
    } catch (error) {
      console.error("Error submitting agent registration:", error);

      // Check for unique constraint violation (email already registered)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("duplicate key") &&
        errorMessage.includes("email")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email address is already registered. Please use a different email.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit registration",
        },
        { status: 500 },
      );
    }

    // Send email notification
    try {
      await resend.emails.send({
        from: "VinaHome <admin@bkmind.com>",
        to: ["admin@bkmind.com"],
        cc: [agentData.email],
        subject: "New Agent Registration",
        react: AgentRegistrationEmail(agentData),
      });
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Continue with success response even if email fails
    }

    // Registration successful
    return NextResponse.json(
      {
        success: true,
        message: "Agent registration submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error during agent registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
