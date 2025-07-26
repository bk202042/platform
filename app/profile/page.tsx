"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function ClientProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    role: "관리자",
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      const { data: claims } = await supabase.auth.getClaims();

      if (!claims || !claims.claims || !claims.claims.sub) {
        router.push("/auth/sign-in");
        return;
      }

      // Convert claims to User format for compatibility
      const user: User = {
        id: claims.claims.sub,
        email: claims.claims.email || '',
        user_metadata: claims.claims.user_metadata || {},
        app_metadata: claims.claims.app_metadata || {},
        aud: Array.isArray(claims.claims.aud) ? claims.claims.aud[0] : (claims.claims.aud || ''),
        created_at: claims.claims.iat ? new Date(claims.claims.iat * 1000).toISOString() : new Date().toISOString(),
        role: claims.claims.role || '',
        updated_at: new Date().toISOString()
      };

      setUser(user);
      setFormData({
        fullName: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "관리자",
      });
      setIsLoading(false);
    }

    loadUser();
  }, [router, supabase.auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role,
        },
      });

      alert("프로필이 업데이트되었습니다.");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 rounded-full border-4 border-t-[#007882] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">내 프로필</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  value={user?.email || ""}
                  disabled
                  placeholder="이메일"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자 ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  value={user?.id || ""}
                  disabled
                  placeholder="사용자 ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>프로필 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="전화번호를 입력하세요"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <Button type="submit" className="bg-[#007882] hover:bg-[#005F67]">
                변경사항 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
