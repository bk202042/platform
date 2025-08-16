"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const FormField = ({ 
    label, 
    name, 
    value, 
    type = "text",
    isPassword = false 
  }: {
    label: string;
    name: string;
    value: string;
    type?: string;
    isPassword?: boolean;
  }) => {
    const isEditing = editingField === name;
    const displayValue = isPassword ? "••••••" : value;

    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input
                type={type}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`${label}을 입력하세요`}
                title={`${label} 입력 필드`}
                autoFocus
              />
              <Button
                onClick={() => handleSave(name)}
                disabled={isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                저장
              </Button>
              <Button
                onClick={() => {
                  setEditingField(null);
                  setFormData(prev => ({ 
                    ...prev, 
                    [name]: name === "email" ? user.email || "" : 
                            name === "fullName" ? user.user_metadata?.full_name || "" :
                            name === "phone" ? user.user_metadata?.phone || "" : ""
                  }));
                }}
                variant="outline"
                size="sm"
              >
                취소
              </Button>
            </div>
          ) : (
            <div className="text-gray-900">{displayValue || "설정되지 않음"}</div>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={() => setEditingField(name)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            편집
          </Button>
        )}
      </div>
    );
  };

  const fullName = user.user_metadata?.full_name || user.email || "사용자";
  const userType = "Home Buyer";

  return (
    <div className="w-full max-w-2xl">
      {/* User Profile Header */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl sm:text-2xl font-medium text-gray-600 flex-shrink-0">
            {fullName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{fullName}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{userType}</p>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">계정 정보</h1>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">{message}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 space-y-0">
          <FormField
            label="이메일"
            name="email"
            value={formData.email}
            type="email"
          />
          
          <FormField
            label="비밀번호"
            name="password"
            value=""
            type="password"
            isPassword={true}
          />

          <FormField
            label="이름"
            name="fullName"
            value={formData.fullName}
          />

          <FormField
            label="전화번호"
            name="phone"
            value={formData.phone}
            type="tel"
          />

          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자 유형
              </label>
              <select
                name="userType"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="사용자 유형 선택"
                defaultValue="home-buyer"
              >
                <option value="home-buyer">Home Buyer</option>
                <option value="agent">Agent</option>
                <option value="investor">Investor</option>
              </select>
            </div>
          </div>

          <FormField
            label="위치"
            name="location"
            value={formData.location}
          />
        </div>
      </div>
    </div>
  );
}