import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json({ error: "Server is missing environment variables." }, { status: 500 });
    }

    // Verify the requester is logged in
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return Response.json({ error: "You must be logged in." }, { status: 401 });
    }

    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user?.email) {
      return Response.json({ error: "Could not verify your login." }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Make sure requester is admin or superintendent
    const { data: requestingWorker } = await adminSupabase
      .from("workers")
      .select("role")
      .eq("email", user.email)
      .maybeSingle();

    if (!requestingWorker || !["admin", "superintendent"].includes(requestingWorker.role)) {
      return Response.json({ error: "Only admins and superintendents can delete workers." }, { status: 403 });
    }

    const body = await request.json();
    const workerId = body.workerId;

    if (!workerId) {
      return Response.json({ error: "Worker ID is required." }, { status: 400 });
    }

    // Get the worker's email so we can find and delete their auth account
    const { data: workerToDelete, error: findError } = await adminSupabase
      .from("workers")
      .select("id, email")
      .eq("id", workerId)
      .maybeSingle();

    if (findError || !workerToDelete) {
      return Response.json({ error: "Worker not found." }, { status: 404 });
    }

    // 1. Remove from all projects
    await adminSupabase
      .from("worker_projects")
      .delete()
      .eq("worker_id", workerId);

    // 2. Remove all acknowledgements
    await adminSupabase
      .from("acknowledgements")
      .delete()
      .eq("worker_id", workerId);

    // 3. Delete the worker profile
    await adminSupabase
      .from("workers")
      .delete()
      .eq("id", workerId);

    // 4. Delete their auth login account
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === workerToDelete.email);
    if (authUser) {
      await adminSupabase.auth.admin.deleteUser(authUser.id);
    }

    return Response.json({ message: "Worker deleted successfully." });
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
