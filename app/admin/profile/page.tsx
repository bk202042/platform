import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileDetails from "./_components/ProfileDetails";

export const metadata = {
  title: "관리자 프로필 | Vietnam Property Platform",
  description: "관리자 계정 정보 관리 및 설정",
};

export default async function AdminProfilePage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;
  const fullName = user.user_metadata?.full_name || user.email;
  const role = user.user_metadata?.role || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-2 sm:px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-4 sm:p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6 sm:mb-8 w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-600 mb-2">
            {fullName ? fullName[0] : "?"}
          </div>
          <div className="font-semibold text-base sm:text-lg text-center break-all">
            {fullName}
          </div>
          <div className="text-gray-500 text-sm text-center">{role}</div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center w-full">
          Edit Profile
        </h1>
        <div className="w-full">
          <ProfileDetails user={user} />
        </div>
      </div>
    </div>
  );
}
