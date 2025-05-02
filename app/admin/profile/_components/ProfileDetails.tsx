'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileDetailsProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      phone?: string;
      role?: string;
    };
    last_sign_in_at?: string;
  };
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || '',
    role: user.user_metadata?.role || '관리자',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role,
        },
      });

      if (error) throw error;

      setStatusMessage({
        type: 'success',
        text: '프로필이 성공적으로 업데이트되었습니다.',
      });
      
      router.refresh();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: '프로필 업데이트 중 오류가 발생했습니다: ' + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
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
                  value={user.email || ''}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일은 변경할 수 없습니다
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자 ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  value={user.id}
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마지막 로그인
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '없음'}
                disabled
              />
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                권한
              </label>
              <input
                type="text"
                name="role"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="권한을 입력하세요"
              />
            </div>
            
            {statusMessage && (
              <div className={`rounded-md p-4 ${
                statusMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {statusMessage.text}
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#007882] hover:bg-[#005F67]"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>보안</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => router.push('/auth/change-password')}
              >
                비밀번호 변경
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}