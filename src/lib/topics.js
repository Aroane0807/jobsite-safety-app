import { supabase } from "./supabase";

export async function fetchAllTopics() {
  const { data, error } = await supabase
    .from("safety_topics")
    .select("*")
    .order("title", { ascending: true });

  if (error) console.log(error);
  return data || [];
}

export async function createTopic({ title, english, spanish, documentName, documentUrl, file }) {
  let finalDocumentName = documentName?.trim() || null;
  let finalDocumentUrl = documentUrl?.trim() || null;

  if (file) {
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();
    const filePath = `${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("safety-documents")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) return { error: uploadError };

    const { data: publicUrlData } = supabase.storage
      .from("safety-documents")
      .getPublicUrl(filePath);

    finalDocumentUrl = publicUrlData.publicUrl;
    if (!finalDocumentName) finalDocumentName = file.name;
  }

  const { error } = await supabase.from("safety_topics").insert({
    title: title.trim(),
    english_content: english.trim(),
    spanish_content: spanish.trim(),
    document_name: finalDocumentName,
    document_url: finalDocumentUrl,
  });

  return { error };
}

export async function saveTopicUpdate(topicItem) {
  const { error } = await supabase
    .from("safety_topics")
    .update({
      title: topicItem.title.trim(),
      english_content: topicItem.english_content || "",
      spanish_content: topicItem.spanish_content || "",
      document_name: topicItem.document_name?.trim() || null,
      document_url: topicItem.document_url?.trim() || null,
    })
    .eq("id", topicItem.id);

  return error;
}
