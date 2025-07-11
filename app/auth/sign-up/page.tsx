import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignUpForm from "./_components/SignUpForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          계정 만들기
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <GoogleSignInButton>Google로 가입</GoogleSignInButton>
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
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
