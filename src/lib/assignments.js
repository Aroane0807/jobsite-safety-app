import { supabase } from "./supabase";

export async function fetchTodaysAssignment(projectId) {
  if (!projectId) return null;

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_assignments")
    .select("id, assigned_date, project_id, safety_topics(*)")
    .eq("project_id", projectId)
    .lte("assigned_date", today)
    .order("assigned_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.log(error);
  return data || null;
}

export async function fetchAssignmentById(assignmentId) {
  const { data, error } = await supabase
    .from("daily_assignments")
    .select("id, assigned_date, project_id, safety_topics(*)")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) console.log(error);
  return data || null;
}

export async function fetchAllAssignments() {
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id, project_name")
    .order("project_name", { ascending: true });

  if (projectError) {
    console.log(projectError);
    return [];
  }

  const { data: topicData } = await supabase
    .from("safety_topics")
    .select("id, title");

  let combined = [];

  for (const project of projectData || []) {
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("daily_assignments")
      .select("id, assigned_date, project_id, topic_id")
      .eq("project_id", project.id)
      .order("assigned_date", { ascending: false });

    if (assignmentError) {
      console.log(assignmentError);
      continue;
    }

    const enriched = (assignmentData || []).map((item) => {
      const matchingTopic = (topicData || []).find((t) => t.id === item.topic_id);
      return {
        ...item,
        project_name: project.project_name,
        topic_title: matchingTopic?.title || "No topic",
      };
    });

    combined = [...combined, ...enriched];
  }

  combined.sort((a, b) =>
    String(b.assigned_date).localeCompare(String(a.assigned_date))
  );

  return combined;
}

export async function fetchAcknowledgements(assignmentId) {
  const { data, error } = await supabase
    .from("acknowledgements")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("acknowledged_at", { ascending: false });

  if (error) console.log(error);
  return data || [];
}

export async function fetchWorkerAcknowledgement(assignmentId, workerId) {
  const { data } = await supabase
    .from("acknowledgements")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("worker_id", workerId)
    .maybeSingle();

  return data || null;
}

export async function submitAcknowledgement(assignmentId, workerId) {
  const { error } = await supabase.from("acknowledgements").insert({
    assignment_id: assignmentId,
    worker_id: workerId,
  });
  return error;
}

export async function checkDuplicateAssignment(projectId, topicId, date) {
  const { data } = await supabase
    .from("daily_assignments")
    .select("id")
    .eq("project_id", projectId)
    .eq("topic_id", topicId)
    .eq("assigned_date", date)
    .maybeSingle();

  return Boolean(data);
}

export async function createAssignment(projectId, topicId, date) {
  const { error } = await supabase.from("daily_assignments").insert({
    project_id: projectId,
    topic_id: topicId,
    assigned_date: date,
  });
  return error;
}

export async function deleteAssignment(assignmentId) {
  // Delete acknowledgements first, then the assignment
  const { error: ackError } = await supabase
    .from("acknowledgements")
    .delete()
    .eq("assignment_id", assignmentId);

  if (ackError) return ackError;

  const { error } = await supabase
    .from("daily_assignments")
    .delete()
    .eq("id", assignmentId);

  return error;
}

export async function fetchWeeklyReportData(projectId, startDate, endDate) {
  const { data: assignmentData, error: assignmentError } = await supabase
    .from("daily_assignments")
    .select("id, assigned_date, project_id, topic_id")
    .eq("project_id", projectId)
    .gte("assigned_date", startDate)
    .lte("assigned_date", endDate)
    .order("assigned_date", { ascending: true });

  if (assignmentError) return { error: assignmentError };
  if (!assignmentData || assignmentData.length === 0) return { data: null };

  const topicIds = [...new Set(assignmentData.map((item) => item.topic_id))];
  const { data: topicData, error: topicError } = await supabase
    .from("safety_topics")
    .select("id, title, document_name, document_url")
    .in("id", topicIds);

  if (topicError) return { error: topicError };

  const assignmentIds = assignmentData.map((item) => item.id);
  const { data: ackData, error: ackError } = await supabase
    .from("acknowledgements")
    .select("*")
    .in("assignment_id", assignmentIds);

  if (ackError) return { error: ackError };

  return { data: { assignments: assignmentData, topics: topicData || [], acknowledgements: ackData || [] } };
}
