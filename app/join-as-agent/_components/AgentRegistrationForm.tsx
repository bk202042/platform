'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      salesVolume: '',
      zipCode: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to submit registration');
      }
      
      toast.success('Your agent registration has been submitted! We will contact you soon.');
      reset();
      router.push('/join-as-agent/success');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong with your submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-first-name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            id="agent-first-name"
            type="text"
            {...register('firstName')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="agent-last-name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Last Name
          </label>
          <input
            id="agent-last-name"
            type="text"
            {...register('lastName')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-email"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="agent-email"
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="agent-phone"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            id="agent-phone"
            type="tel"
            {...register('phone')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label
            htmlFor="agent-sales-volume"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Annual Sales Volume
          </label>
          <select
            id="agent-sales-volume"
            {...register('salesVolume')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          >
            <option value="">Select sales volume</option>
            <option value="Less than 1 billion VND">Less than 1 billion VND</option>
            <option value="1-5 billion VND">1-5 billion VND</option>
            <option value="5-10 billion VND">5-10 billion VND</option>
            <option value="10-50 billion VND">10-50 billion VND</option>
            <option value="Over 50 billion VND">Over 50 billion VND</option>
          </select>
          {errors.salesVolume && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.salesVolume.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="agent-zip-code"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            ZIP Code
          </label>
          <input
            id="agent-zip-code"
            type="text"
            {...register('zipCode')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
            disabled={isSubmitting}
          />
          {errors.zipCode && (
            <p className="ml-1 mt-1 text-xs text-rose-500">
              {errors.zipCode.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#007882] hover:bg-[#006670] text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  );
}