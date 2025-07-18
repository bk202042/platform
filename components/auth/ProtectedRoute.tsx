"use client";

import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback,
  redirectTo = "/auth/sign-in",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">인증 상태를 확인하는 중...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return (
      fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-6">
                이 페이지에 접근하려면 로그인이 필요합니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link
                  href={`${redirectTo}?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                >
                  로그인하기
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">홈으로 이동</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check admin requirement
  if (requireAdmin && user && user.user_metadata?.role !== "admin") {
    return (
      fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                접근 권한이 없습니다
              </h2>
              <p className="text-gray-600 mb-6">
                이 페이지에 접근할 권한이 없습니다.
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/">홈으로 이동</Link>
            </Button>
          </div>
        </div>
      )
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, "children"> = {},
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking authentication status
export function useRequireAuth(redirectTo: string = "/auth/sign-in") {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
}

// Hook for checking admin status
export function useRequireAdmin(redirectTo: string = "/") {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || user.user_metadata?.role !== "admin")) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return {
    user,
    loading,
    isAdmin: user?.user_metadata?.role === "admin",
    isAuthenticated: !!user,
  };
}
