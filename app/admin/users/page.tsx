import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users on the Vietnam Property Platform",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch users from Supabase Auth - this is a placeholder approach
  // In production, you might want to store additional user data in a users table
  const { data: authUsers, error } = await supabase.auth.admin
    .listUsers({
      page: 1,
      perPage: 10,
    })
    .catch((err) => {
      // Auth admin API might not be available in all environments
      console.error("Error accessing auth admin API:", err);
      return { data: null, error: err };
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button className="bg-[#007882] hover:bg-[#005F67]">Invite User</Button>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Admin API access is limited in some environments. Please check
              your Supabase configuration.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Error details: {error.message || "Unknown error"}
            </p>
          </CardContent>
        </Card>
      ) : authUsers?.users && authUsers.users.length > 0 ? (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Sign In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {authUsers.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.banned ? (
                        <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 px-2 py-1 text-red-800">
                          Banned
                        </span>
                      ) : user.confirmed_at ? (
                        <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 px-2 py-1 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        {user.banned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-500 mb-4">
              No users found or limited admin API access
            </p>
            <p className="text-sm text-gray-400 mb-6">
              You might need to set up a users table to store additional user
              data beyond authentication.
            </p>
            <Button className="bg-[#007882] hover:bg-[#005F67]">
              Invite First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
