import { supabase } from "./supabase";

export async function fetchWorkerByEmail(email) {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) console.log(error);
  return data || null;
}

export async function fetchAllWorkers() {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) console.log(error);
  return data || [];
}

export async function fetchWorkersByIds(workerIds) {
  if (workerIds.length === 0) return [];

  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .in("id", workerIds)
    .order("full_name", { ascending: true });

  if (error) console.log(error);
  return data || [];
}

export async function saveWorkerUpdate(workerItem) {
  const { error } = await supabase
    .from("workers")
    .update({
      full_name: workerItem.full_name.trim(),
      phone: workerItem.phone?.trim() || null,
      preferred_language: workerItem.preferred_language || "english",
      role: workerItem.role || "worker",
    })
    .eq("id", workerItem.id);

  return error;
}

export async function fetchWorkerProjectIds(projectId) {
  const { data, error } = await supabase
    .from("worker_projects")
    .select("worker_id")
    .eq("project_id", projectId);

  if (error) console.log(error);
  return (data || []).map((row) => row.worker_id);
}

export async function fetchWorkerProjectLinks(projectId) {
  const { data, error } = await supabase
    .from("worker_projects")
    .select("id, worker_id, project_id")
    .eq("project_id", projectId);

  if (error) console.log(error);
  return data || [];
}

export async function checkWorkerProjectLink(workerId, projectId) {
  const { data } = await supabase
    .from("worker_projects")
    .select("*")
    .eq("worker_id", workerId)
    .eq("project_id", projectId)
    .maybeSingle();

  return Boolean(data);
}

export async function addWorkerToProject(workerId, projectId) {
  const { error } = await supabase.from("worker_projects").insert({
    worker_id: workerId,
    project_id: projectId,
  });
  return error;
}

export async function removeWorkerProjectLink(linkId) {
  const { error } = await supabase
    .from("worker_projects")
    .delete()
    .eq("id", linkId);
  return error;
}
