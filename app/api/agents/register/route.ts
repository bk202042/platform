import { NextRequest, NextResponse } from 'next/server';
import { validateAgentRegistration } from '@/lib/validation/agent';
import { registerAgent } from '@/lib/data/agent';
import 'server-only';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = validateAgentRegistration(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const agentData = validationResult.data;
    
    try {
      // Use the data access layer to register the agent
      await registerAgent(agentData);
    } catch (error: any) {
      console.error('Error submitting agent registration:', error);
      
      // Check for unique constraint violation (email already registered)
      if (error.message.includes('duplicate key') && error.message.includes('email')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'This email address is already registered. Please use a different email.' 
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to submit registration' 
        },
        { status: 500 }
      );
    }
    
    // Registration successful
    return NextResponse.json(
      { 
        success: true, 
        message: 'Agent registration submitted successfully' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Unexpected error during agent registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}