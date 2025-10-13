import { createClient } from "@/lib/supabase/client";

export const revalidate = 0; // Always fetch fresh data on each request

export default async function UsersPage() {
  const supabase = createClient();
  // ✅ Fetch users server-side
  const { data: users, error } = await supabase
    .from("users")
    .select("id, display_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  console.log("✅ Supabase users:", users);
  console.log("⚠️ Supabase error:", error);

  if (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-600">
        <p className="text-xl font-semibold">Failed to load users</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">👥 User List</h1>

      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
            <tr>
              <th className="border-b px-4 py-3 text-left">Email</th>
              <th className="border-b px-4 py-3 text-left">Full Name</th>
              <th className="border-b px-4 py-3 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`transition hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="border-b px-4 py-3">{user.email}</td>
                  <td className="border-b px-4 py-3">{user.display_name}</td>
                  <td className="border-b px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border-b py-6 text-center text-gray-500 italic">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
