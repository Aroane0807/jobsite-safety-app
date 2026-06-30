import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json({ error: "Server is missing environment variables." }, { status: 500 });
    }

    // Verify the worker's session from the invite link
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return Response.json({ error: "Invalid session. Please use your invite link again." }, { status: 401 });
    }

    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user?.email) {
      return Response.json({ error: "Could not verify your session. Please use your invite link again." }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Make sure no profile exists yet
    const { data: existing } = await adminSupabase
      .from("workers")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "A profile already exists for this email." }, { status: 400 });
    }

    const body = await request.json();
    const fullName = body.fullName?.trim();
    const phone = body.phone?.replace(/\D/g, "");
    const preferredLanguage = body.preferredLanguage || "english";
    const role = body.role || "worker";

    if (!fullName) return Response.json({ error: "Full name is required." }, { status: 400 });
    if (!phone || phone.length < 10) return Response.json({ error: "A valid phone number is required." }, { status: 400 });

    const { error: workerError } = await adminSupabase.from("workers").insert({
      full_name: fullName,
      email: user.email,
      phone,
      preferred_language: preferredLanguage,
      role,
    });

    if (workerError) {
      return Response.json({ error: workerError.message }, { status: 400 });
    }

    return Response.json({ message: "Account set up successfully." });
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
