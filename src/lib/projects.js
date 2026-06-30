import { supabase } from "./supabase";

export async function fetchActiveProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("active", true)
    .order("project_name", { ascending: true });

  if (error) console.log(error);
  return data || [];
}

export async function fetchAllProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("project_name", { ascending: true });

  if (error) console.log(error);
  return data || [];
}

export async function fetchProjectById(projectId) {
  if (!projectId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) console.log(error);
  return data || null;
}

export async function createProject(projectName) {
  const { error } = await supabase.from("projects").insert({
    project_name: projectName.trim(),
    active: true,
  });
  return error;
}

export async function saveProjectUpdate(projectItem) {
  const { error } = await supabase
    .from("projects")
    .update({
      project_name: projectItem.project_name.trim(),
      active: Boolean(projectItem.active),
    })
    .eq("id", projectItem.id);
  return error;
}
