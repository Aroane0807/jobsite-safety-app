import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  // Only allow Vercel's cron runner (or manual calls with the secret)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!supabaseUrl || !serviceRoleKey || !twilioSid || !twilioToken || !twilioFrom) {
    return Response.json({ error: "Missing environment variables." }, { status: 500 });
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const today = new Date().toISOString().split("T")[0];

  // Get all of today's assignments (one per project)
  const { data: assignments, error: assignmentError } = await db
    .from("daily_assignments")
    .select("id, project_id, topic_id, assigned_date, safety_topics(title)")
    .eq("assigned_date", today);

  if (assignmentError) {
    return Response.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignments || assignments.length === 0) {
    return Response.json({ message: "No assignments found for today. No reminders sent." });
  }

  let sent = 0;
  let skipped = 0;
  const errors = [];

  for (const assignment of assignments) {
    // Get workers on this project
    const { data: projectWorkers, error: pwError } = await db
      .from("worker_projects")
      .select("worker_id")
      .eq("project_id", assignment.project_id);

    if (pwError || !projectWorkers?.length) continue;

    const workerIds = projectWorkers.map((row) => row.worker_id);

    // Get workers who have NOT acknowledged yet
    const { data: acks } = await db
      .from("acknowledgements")
      .select("worker_id")
      .eq("assignment_id", assignment.id)
      .in("worker_id", workerIds);

    const acknowledgedIds = new Set((acks || []).map((a) => a.worker_id));
    const pendingIds = workerIds.filter((id) => !acknowledgedIds.has(id));

    if (pendingIds.length === 0) continue;

    // Get worker details for pending workers (only those with a phone number)
    const { data: pendingWorkers, error: workerError } = await db
      .from("workers")
      .select("id, full_name, phone, preferred_language")
      .in("id", pendingIds)
      .not("phone", "is", null);

    if (workerError || !pendingWorkers?.length) continue;

    const topicTitle = assignment.safety_topics?.title || "today's safety topic";

    for (const worker of pendingWorkers) {
      const phone = worker.phone?.replace(/\D/g, "");
      if (!phone || phone.length < 10) { skipped++; continue; }

      const isSpanish = worker.preferred_language === "spanish";

      const message = isSpanish
        ? `Hola ${worker.full_name}, recuerde reconocer el tema de seguridad de hoy: "${topicTitle}". Inicie sesión en ${appUrl || "la aplicación"} para completarlo.`
        : `Hi ${worker.full_name}, please acknowledge today's safety topic: "${topicTitle}". Log in at ${appUrl || "the app"} to complete it.`;

      const formattedPhone = phone.length === 10 ? `+1${phone}` : `+${phone}`;

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: twilioFrom,
            Body: message,
          }),
        }
      );

      if (twilioResponse.ok) {
        sent++;
      } else {
        const twilioError = await twilioResponse.json();
        errors.push({ worker: worker.full_name, error: twilioError.message });
        skipped++;
      }
    }
  }

  return Response.json({
    date: today,
    sent,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}
