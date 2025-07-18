import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignInForm from "./_components/SignInForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

interface SignInPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const resolvedSearchParams = await searchParams;
  const returnUrl =
    typeof resolvedSearchParams.returnUrl === "string"
      ? resolvedSearchParams.returnUrl
      : "/";

  if (session) {
    redirect(returnUrl);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          계정에 로그인
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <GoogleSignInButton returnUrl={returnUrl}>
              Google로 로그인
            </GoogleSignInButton>
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                또는 다음으로 계속
              </span>
            </div>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
