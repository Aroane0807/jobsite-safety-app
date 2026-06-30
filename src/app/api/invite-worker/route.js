import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json({ error: "Server is missing environment variables." }, { status: 500 });
    }

    // Verify the requesting user is logged in
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return Response.json({ error: "You must be logged in to invite workers." }, { status: 401 });
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

    // Make sure the requester is an admin or superintendent
    const { data: requestingWorker } = await adminSupabase
      .from("workers")
      .select("role")
      .eq("email", user.email)
      .maybeSingle();

    if (!requestingWorker || !["admin", "superintendent"].includes(requestingWorker.role)) {
      return Response.json({ error: "Only admins and superintendents can invite workers." }, { status: 403 });
    }

    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const role = body.role || "worker";

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    // Check if a worker profile already exists with this email
    const { data: existing } = await adminSupabase
      .from("workers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "A worker with this email already exists." }, { status: 400 });
    }

    // Store the intended role so the join page can use it
    const redirectTo = `${appUrl || "https://jobsite-safety-app.vercel.app"}/join?role=${role}`;

    const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (inviteError) {
      return Response.json({ error: inviteError.message }, { status: 400 });
    }

    return Response.json({ message: "Invite sent successfully." });
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
