import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { validateAgentRegistration } from "@/lib/validation/agent";
import { registerAgent } from "@/lib/data/agent";
import AgentRegistrationEmail from "@/app/emails/AgentRegistrationEmail";
import "server-only";

// Check if RESEND_API_KEY is properly set
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    // Log the incoming request body for debugging
    console.log('Agent registration request body:', {
      ...body,
      email: body.email ? `${body.email.substring(0, 3)}***@***` : undefined, // Mask email for privacy
    });

    const validationResult = validateAgentRegistration(body);

    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.format());
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
      // Validate required email fields
      const adminEmail = process.env.ADMIN_EMAIL || "admin@bkmind.com";
      const fromEmail = process.env.FROM_EMAIL || "admin@bkmind.com";
      
      console.log('Sending email notification to:', adminEmail);
      
      const emailResponse = await resend.emails.send({
        from: `VinaHome <${fromEmail}>`,
        to: [adminEmail],
        cc: [agentData.email],
        subject: "New Agent Registration",
        react: AgentRegistrationEmail(agentData),
      });
      
      if (emailResponse.error) {
        throw new Error(`Resend API error: ${emailResponse.error.message}`);
      }
      
      console.log('Email sent successfully:', emailResponse.id);
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Log detailed error information for debugging
      if (emailError instanceof Error) {
        console.error('Error details:', emailError.message);
        console.error('Error stack:', emailError.stack);
      }
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
