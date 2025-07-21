"use client";

import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  requireAuth = true
}: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return fallback || <AuthPrompt />;
  }

  return <>{children}</>;
}

function AuthPrompt() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          로그인이 필요합니다
        </CardTitle>
        <CardDescription>
          커뮤니티에 참여하려면 로그인해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/auth/sign-in">
            <LogIn className="mr-2 h-4 w-4" />
            로그인
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/sign-up">
            <UserPlus className="mr-2 h-4 w-4" />
            회원가입
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
