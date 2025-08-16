"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileSectionProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      phone?: string;
      role?: string;
    };
  };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user.email || "",
    fullName: user.user_metadata?.full_name || "",
    phone: user.user_metadata?.phone || "",
    password: "",
    location: "Ho Chi Minh City, Vietnam", // Default location similar to Trulia
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (field: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (field === "email") {
        const { error } = await supabase.auth.updateUser({ email: formData.email });
        if (error) throw error;
        setMessage("이메일 확인 링크가 전송되었습니다.");
      } else if (field === "password") {
        const { error } = await supabase.auth.updateUser({ password: formData.password });
        if (error) throw error;
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        });
        if (error) throw error;
        setMessage("프로필이 성공적으로 업데이트되었습니다.");
        router.refresh();
      }
      setEditingField(null);
    } catch (error) {
      setMessage("업데이트 중 오류가 발생했습니다: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Trulia-inspired clean header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-gray-800">Edit Profile</h1>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">{message}</p>
        </div>
      )}

      {/* Trulia-style form layout */}
      <div className="space-y-8">
        {/* Email field - Trulia style with blue edit link */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
          <div className="flex items-center justify-between">
            <span className="text-gray-900 text-base">{formData.email}</span>
            <button 
              type="button"
              onClick={() => setEditingField('email')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>
          {editingField === 'email' && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                title="Email address"
                placeholder="Enter your email"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSave('email')}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Password field - Trulia style */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
          <div className="flex items-center justify-between">
            <span className="text-gray-900 text-base">******</span>
            <button 
              type="button"
              onClick={() => setEditingField('password')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>
          {editingField === 'password' && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                title="Password"
                placeholder="Enter new password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSave('password')}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Full Name field - Trulia style input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone field - Trulia style input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        {/* User Type field - Trulia style dropdown */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">User Type</label>
          <select
            name="userType"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            title="Select user type"
            defaultValue="home-buyer"
          >
            <option value="home-buyer">Home Buyer</option>
            <option value="agent">Agent</option>
            <option value="investor">Investor</option>
          </select>
        </div>

        {/* Location field - Trulia style input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your location"
          />
        </div>
      </div>
    </div>
  );
}