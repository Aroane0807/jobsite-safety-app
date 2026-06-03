import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.replace(/\D/g, "");
    const preferredLanguage = body.preferredLanguage || "english";
    const role = body.role || "worker";

    if (!fullName) {
      return Response.json(
        { error: "Worker name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return Response.json(
        { error: "Worker email is required." },
        { status: 400 }
      );
    }

    if (!phone) {
      return Response.json(
        {
          error:
            "Worker phone number is required because it will be used as their password.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Server is missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: existingWorker } = await adminSupabase
      .from("workers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingWorker) {
      return Response.json(
        { error: "A worker profile already exists with this email." },
        { status: 400 }
      );
    }

    const { data: createdUserData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password: phone,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    const { data: workerData, error: workerError } = await adminSupabase
      .from("workers")
      .insert({
        full_name: fullName,
        email,
        phone,
        preferred_language: preferredLanguage,
        role,
      })
      .select()
      .single();

    if (workerError) {
      if (createdUserData?.user?.id) {
        await adminSupabase.auth.admin.deleteUser(createdUserData.user.id);
      }

      return Response.json({ error: workerError.message }, { status: 400 });
    }

    return Response.json({
      worker: workerData,
      message: "Worker login and profile created successfully.",
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong creating the worker." },
      { status: 500 }
    );
  }
}