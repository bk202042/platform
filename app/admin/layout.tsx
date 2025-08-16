import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | Vietnam Property Platform",
  description: "Admin dashboard for managing properties and users",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-6 overflow-auto bg-white md:pt-6 pt-20">{children}</main>
    </div>
  );
}
