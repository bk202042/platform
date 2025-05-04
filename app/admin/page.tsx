import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch basic stats for the dashboard
  const { count: propertyCount, error: propertyError } = await supabase
    .from("property_listings")
    .select("*", { count: "exact", head: true });

  // You would need to have a users table to count users
  // This is a placeholder that can be updated once that table exists
  const userCount = 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {propertyError ? "—" : propertyCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-500">
              Quick access to common tasks
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href="/admin/properties"
                className="text-sm text-blue-600 hover:underline"
              >
                Manage Properties
              </a>
              <a
                href="/admin/users"
                className="text-sm text-blue-600 hover:underline"
              >
                Manage Users
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
