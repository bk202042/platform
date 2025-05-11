'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AgentRegistrationData, AgentFormState } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';

// Validation schema
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  salesVolume: z.string(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
});

export default function AgentRegistrationForm() {
  const [formState, setFormState] = useState<AgentFormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const form = useForm<AgentRegistrationData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      salesVolume: '',
      email: '',
      phone: '',
      zipCode: '',
    },
  });

  async function onSubmit(data: AgentRegistrationData) {
    setFormState({ ...formState, isSubmitting: true, error: null });

    try {
      const response = await fetch('/api/agents/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      setFormState({
        isSubmitting: false,
        isSuccess: true,
        error: null,
      });
      
      // Reset form on success
      form.reset();
    } catch (error) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  if (formState.isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-xl font-semibold mb-2">Registration Successful!</div>
        <p className="text-gray-700 mb-4">
          Thank you for your interest in joining VinaHome as an agent. Our team will review your application and contact you shortly.
        </p>
        <Button 
          onClick={() => setFormState({ isSubmitting: false, isSuccess: false, error: null })}
          variant="outline"
        >
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Agent Registration</h3>
      
      {formState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="salesVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Sales Volume</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your annual sales volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 1 billion VND">Less than 1 billion VND</SelectItem>
                      <SelectItem value="1-5 billion VND">1-5 billion VND</SelectItem>
                      <SelectItem value="5-10 billion VND">5-10 billion VND</SelectItem>
                      <SelectItem value="10-50 billion VND">10-50 billion VND</SelectItem>
                      <SelectItem value="Over 50 billion VND">Over 50 billion VND</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your ZIP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Register as an Agent'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}