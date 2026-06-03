"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(null);

  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [topic, setTopic] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyAcknowledged, setAlreadyAcknowledged] = useState(false);
  const [view, setView] = useState("worker");
  const [language, setLanguage] = useState("english");

  const [adminTab, setAdminTab] = useState("projects");

  const [newProjectName, setNewProjectName] = useState("");

  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");
  const [newWorkerLanguage, setNewWorkerLanguage] = useState("english");
  const [newWorkerRole, setNewWorkerRole] = useState("worker");

  const [linkWorkerId, setLinkWorkerId] = useState("");
  const [linkProjectId, setLinkProjectId] = useState("");
  const [manageProjectWorkersId, setManageProjectWorkersId] = useState("");
  const [managedProjectWorkers, setManagedProjectWorkers] = useState([]);
  const [topicSearch, setTopicSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicEnglish, setNewTopicEnglish] = useState("");
  const [newTopicSpanish, setNewTopicSpanish] = useState("");
  const [newTopicDocumentName, setNewTopicDocumentName] = useState("");
  const [newTopicDocumentUrl, setNewTopicDocumentUrl] = useState("");
  const [newTopicFile, setNewTopicFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [assignmentProjectId, setAssignmentProjectId] = useState("");
  const [assignmentTopicId, setAssignmentTopicId] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");

  const isAdmin =
    worker?.role === "admin" || worker?.role === "superintendent";

  const selectedTopicForEdit = allTopics.find(
    (topicItem) => topicItem.id === selectedTopicId
  );

  const filteredTopics = allTopics.filter((topicItem) => {
    const search = topicSearch.toLowerCase();

    return (
      topicItem.title?.toLowerCase().includes(search) ||
      topicItem.english_content?.toLowerCase().includes(search) ||
      topicItem.spanish_content?.toLowerCase().includes(search)
    );
  });
  const filteredWorkers = allWorkers.filter((workerItem) => {
    const search = workerSearch.toLowerCase();

    return (
      workerItem.full_name?.toLowerCase().includes(search) ||
      workerItem.email?.toLowerCase().includes(search) ||
      workerItem.phone?.toLowerCase().includes(search) ||
      workerItem.role?.toLowerCase().includes(search)
    );
  });
  const signedCount = workers.filter((workerItem) =>
    acknowledgements.some((ack) => ack.worker_id === workerItem.id)
  ).length;

  const totalWorkerCount = workers.length;
  const pendingCount = totalWorkerCount - signedCount;

  const topicText =
    language === "spanish"
      ? topic?.spanish_content || "No hay contenido en español disponible."
      : topic?.english_content || "No English content available.";

  const acknowledgmentText =
    language === "spanish"
      ? "Al marcar esta casilla, confirmo que se me ha proporcionado esta información de seguridad, que he tenido la oportunidad de revisar el documento adjunto, que entiendo los requisitos de seguridad y que acepto seguir estos procedimientos mientras trabajo en este sitio de trabajo. Entiendo que no seguir estos procedimientos de seguridad puede resultar en que sea retirado de la tarea o del sitio de trabajo."
      : "By checking this box, I confirm that I have been provided this safety information, have had the opportunity to review the attached document, understand the safety requirements, and agree to follow these procedures while working on this jobsite. I understand that failure to follow these safety procedures may result in removal from the task or jobsite.";

  const acknowledgeButtonText =
    language === "spanish"
      ? alreadyAcknowledged
        ? "Ya Reconocido"
        : "Reconocer Tema de Seguridad"
      : alreadyAcknowledged
        ? "Already Acknowledged"
        : "Acknowledge Safety Topic";

  const alreadyAcknowledgedMessage =
    language === "spanish"
      ? "Ya ha reconocido este tema de seguridad."
      : "You have already acknowledged this safety topic.";

  const successMessage =
    language === "spanish"
      ? "Tema de seguridad reconocido correctamente."
      : "Safety topic acknowledged successfully.";

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f6f8",
      padding: "12px",
      fontFamily: "Arial, sans-serif",
      color: "#1f2937",
    },
    container: {
      maxWidth: 1100,
      margin: "0 auto",
    },
    header: {
      background: "#111827",
      color: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    title: {
      margin: 0,
      fontSize: 28,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 0,
      color: "#d1d5db",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #d1d5db",
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    },
    button: {
      padding: "12px 18px",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      background: "#ffffff",
      cursor: "pointer",
      fontSize: 16,
    },
    primaryButton: {
      padding: "14px 20px",
      borderRadius: 8,
      border: "none",
      background: "#2563eb",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 16,
      width: "100%",
    },
    saveButton: {
      padding: "10px 14px",
      borderRadius: 8,
      border: "none",
      background: "#059669",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: "bold",
    },
    reportButton: {
      padding: "14px 20px",
      borderRadius: 8,
      border: "none",
      background: "#111827",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
      width: "100%",
      maxWidth: 360,
    },
    disabledButton: {
      padding: "14px 20px",
      borderRadius: 8,
      border: "none",
      background: "#9ca3af",
      color: "#ffffff",
      cursor: "not-allowed",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      width: "100%",
      maxWidth: 360,
    },
    tabButton: {
      padding: "12px 18px",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      cursor: "pointer",
      fontSize: 16,
    },
    adminTabButton: {
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      cursor: "pointer",
      fontSize: 15,
    },
    documentButton: {
      display: "block",
      padding: "14px 20px",
      borderRadius: 8,
      border: "none",
      background: "#059669",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 16,
      textDecoration: "none",
      textAlign: "center",
      width: "100%",
      boxSizing: "border-box",
    },
    input: {
      display: "block",
      marginBottom: 12,
      padding: 12,
      width: "100%",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      fontSize: 16,
      boxSizing: "border-box",
    },
    smallInput: {
      padding: 8,
      width: "100%",
      borderRadius: 6,
      border: "1px solid #9ca3af",
      fontSize: 14,
      boxSizing: "border-box",
    },
    textarea: {
      display: "block",
      marginBottom: 12,
      padding: 12,
      width: "100%",
      minHeight: 120,
      borderRadius: 8,
      border: "1px solid #9ca3af",
      fontSize: 16,
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
    },
    select: {
      padding: 12,
      width: "100%",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      fontSize: 16,
      marginTop: 8,
      marginBottom: 12,
      boxSizing: "border-box",
      background: "#ffffff",
    },
    smallSelect: {
      padding: 8,
      width: "100%",
      borderRadius: 6,
      border: "1px solid #9ca3af",
      fontSize: 14,
      boxSizing: "border-box",
      background: "#ffffff",
    },
    topicText: {
      whiteSpace: "pre-line",
      lineHeight: 1.6,
      fontSize: 17,
    },
    notice: {
      background: "#ecfdf5",
      border: "1px solid #10b981",
      color: "#065f46",
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    warning: {
      background: "#fff7ed",
      border: "1px solid #f97316",
      color: "#9a3412",
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 12,
      marginTop: 16,
    },
    statBox: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 14,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "bold",
      margin: 0,
    },
    statLabel: {
      margin: 0,
      color: "#4b5563",
    },
    tableWrap: {
      overflowX: "auto",
      marginTop: 16,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#ffffff",
    },
    th: {
      textAlign: "left",
      borderBottom: "2px solid #d1d5db",
      padding: 10,
      whiteSpace: "nowrap",
    },
    td: {
      borderBottom: "1px solid #e5e7eb",
      padding: 10,
      whiteSpace: "nowrap",
      verticalAlign: "top",
    },
    signedBadge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#dcfce7",
      color: "#166534",
      fontWeight: "bold",
    },
    pendingBadge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#fee2e2",
      color: "#991b1b",
      fontWeight: "bold",
    },
    roleBadge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#dbeafe",
      color: "#1e40af",
      fontWeight: "bold",
      marginLeft: 8,
    },
    languageRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 16,
      marginBottom: 16,
    },
    languageButton: {
      padding: "10px 16px",
      borderRadius: 8,
      border: "1px solid #9ca3af",
      cursor: "pointer",
      fontSize: 15,
    },
    inlineGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 12,
      alignItems: "end",
    },
    compactList: {
      display: "grid",
      gap: 10,
      marginTop: 16,
    },
    compactListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 12,
      background: "#f9fafb",
      flexWrap: "wrap",
    },
  };

  function escapeHtml(value) {
    if (!value) return "";

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDateTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  }

  function getAcknowledgementForWorker(workerId) {
    return acknowledgements.find((ack) => ack.worker_id === workerId);
  }

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setWorker(null);
    setProjects([]);
    setAllProjects([]);
    setAllWorkers([]);
    setAllTopics([]);
    setAllAssignments([]);
    setSelectedProjectId("");
    setProject(null);
    setAssignment(null);
    setTopic(null);
    setWorkers([]);
    setAcknowledgements([]);
    setChecked(false);
    setMessage("");
    setAlreadyAcknowledged(false);
    setView("worker");
    setLanguage("english");
    setAdminTab("projects");
  }

  async function loadWorker(currentUser) {
    if (!currentUser?.email) return null;

    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("email", currentUser.email)
      .maybeSingle();

    if (error) {
      console.log(error);
      return null;
    }

    if (!data) {
      setMessage(
        "No worker profile found for this email. Add this email to the workers table in Supabase."
      );
      return null;
    }

    setWorker(data);

    if (data.role !== "admin" && data.role !== "superintendent") {
      setView("worker");
    }

    setLanguage(data.preferred_language === "spanish" ? "spanish" : "english");

    return data;
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("active", true)
      .order("project_name", { ascending: true });

    if (error) {
      console.log(error);
      setProjects([]);
      return [];
    }

    setProjects(data || []);
    return data || [];
  }

  async function loadAllProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("project_name", { ascending: true });

    if (error) {
      console.log(error);
      setAllProjects([]);
      return [];
    }

    setAllProjects(data || []);
    return data || [];
  }

  async function loadAllWorkers() {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.log(error);
      setAllWorkers([]);
      return [];
    }

    setAllWorkers(data || []);
    return data || [];
  }

  async function loadAllTopics() {
    const { data, error } = await supabase
      .from("safety_topics")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      console.log(error);
      setAllTopics([]);
      return [];
    }

    setAllTopics(data || []);
    return data || [];
  }

  async function loadAllAssignments() {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, project_name")
      .order("project_name", { ascending: true });

    if (projectError) {
      console.log(projectError);
      setAllAssignments([]);
      return [];
    }

    const { data: topicData, error: topicError } = await supabase
      .from("safety_topics")
      .select("id, title");

    if (topicError) {
      console.log(topicError);
    }

    let combinedAssignments = [];

    for (const projectItem of projectData || []) {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("daily_assignments")
        .select("id, assigned_date, project_id, topic_id")
        .eq("project_id", projectItem.id)
        .order("assigned_date", { ascending: false });

      if (assignmentError) {
        console.log(assignmentError);
        continue;
      }

      const assignmentsForProject = (assignmentData || []).map(
        (assignmentItem) => {
          const matchingTopic = (topicData || []).find(
            (topicItem) => topicItem.id === assignmentItem.topic_id
          );

          return {
            ...assignmentItem,
            project_name: projectItem.project_name,
            topic_title: matchingTopic?.title || "No topic",
          };
        }
      );

      combinedAssignments = [
        ...combinedAssignments,
        ...assignmentsForProject,
      ];
    }

    combinedAssignments.sort((a, b) =>
      String(b.assigned_date).localeCompare(String(a.assigned_date))
    );

    setAllAssignments(combinedAssignments);
    return combinedAssignments;
  }

  async function refreshAdminLists() {
    const projectList = await loadProjects();
    await loadAllProjects();
    await loadAllWorkers();
    await loadAllTopics();
    await loadAllAssignments();

    if (!selectedProjectId && projectList.length > 0) {
      setSelectedProjectId(projectList[0].id);
    }
  }

  async function loadProject(projectId) {
    if (!projectId) {
      setProject(null);
      return null;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (error) {
      console.log(error);
      setProject(null);
      return null;
    }

    setProject(data);
    return data;
  }

  async function loadProjectWorkers(projectId) {
    if (!projectId) {
      setWorkers([]);
      return [];
    }

    const { data: projectWorkerData, error: projectWorkerError } =
      await supabase
        .from("worker_projects")
        .select("worker_id")
        .eq("project_id", projectId);

    if (projectWorkerError) {
      console.log(projectWorkerError);
      setWorkers([]);
      return [];
    }

    const workerIds = (projectWorkerData || []).map((row) => row.worker_id);

    if (workerIds.length === 0) {
      setWorkers([]);
      return [];
    }

    const { data: workerData, error: workerError } = await supabase
      .from("workers")
      .select("*")
      .in("id", workerIds)
      .order("full_name", { ascending: true });

    if (workerError) {
      console.log(workerError);
      setWorkers([]);
      return [];
    }

    setWorkers(workerData || []);
    return workerData || [];
  }

  async function loadLatestAssignmentForProject(projectId, currentWorker) {
    if (!projectId) {
      setAssignment(null);
      setTopic(null);
      setAcknowledgements([]);
      setWorkers([]);
      setAlreadyAcknowledged(false);
      setChecked(false);
      setMessage("");
      return;
    }

    setChecked(false);
    setAlreadyAcknowledged(false);
    setMessage("");

    await loadProject(projectId);
    await loadProjectWorkers(projectId);

    const { data, error } = await supabase
      .from("daily_assignments")
      .select("id, assigned_date, project_id, safety_topics(*)")
      .eq("project_id", projectId)
      .order("assigned_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log(error);
      setAssignment(null);
      setTopic(null);
      setAcknowledgements([]);
      return;
    }

    if (!data) {
      setAssignment(null);
      setTopic(null);
      setAcknowledgements([]);
      setMessage("No safety topic has been assigned to this project yet.");
      return;
    }

    setAssignment(data);
    setTopic(data.safety_topics);

    const { data: ackData, error: ackError } = await supabase
      .from("acknowledgements")
      .select("*")
      .eq("assignment_id", data.id)
      .order("acknowledged_at", { ascending: false });

    if (ackError) {
      console.log(ackError);
      setAcknowledgements([]);
    } else {
      setAcknowledgements(ackData || []);
    }

    if (currentWorker) {
      const { data: existingAck } = await supabase
        .from("acknowledgements")
        .select("*")
        .eq("assignment_id", data.id)
        .eq("worker_id", currentWorker.id)
        .maybeSingle();

      if (existingAck) {
        setAlreadyAcknowledged(true);
        setMessage(alreadyAcknowledgedMessage);
      } else {
        setAlreadyAcknowledged(false);
        setMessage("");
      }
    }
  }

  async function loadSpecificAssignment(assignmentId, projectId, currentWorker) {
    if (!assignmentId || !projectId) {
      alert("Assignment not found.");
      return;
    }

    setChecked(false);
    setAlreadyAcknowledged(false);
    setMessage("");
    setSelectedProjectId(projectId);

    await loadProject(projectId);
    await loadProjectWorkers(projectId);

    const { data, error } = await supabase
      .from("daily_assignments")
      .select("id, assigned_date, project_id, safety_topics(*)")
      .eq("id", assignmentId)
      .maybeSingle();

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    if (!data) {
      alert("Assignment not found.");
      return;
    }

    setAssignment(data);
    setTopic(data.safety_topics);

    const { data: ackData, error: ackError } = await supabase
      .from("acknowledgements")
      .select("*")
      .eq("assignment_id", data.id)
      .order("acknowledged_at", { ascending: false });

    if (ackError) {
      console.log(ackError);
      setAcknowledgements([]);
    } else {
      setAcknowledgements(ackData || []);
    }

    if (currentWorker) {
      const { data: existingAck } = await supabase
        .from("acknowledgements")
        .select("*")
        .eq("assignment_id", data.id)
        .eq("worker_id", currentWorker.id)
        .maybeSingle();

      if (existingAck) {
        setAlreadyAcknowledged(true);
        setMessage(alreadyAcknowledgedMessage);
      } else {
        setAlreadyAcknowledged(false);
        setMessage("");
      }
    }

    setView("dashboard");
  }

  async function viewAssignmentDashboard(assignmentItem) {
    await loadSpecificAssignment(
      assignmentItem.id,
      assignmentItem.project_id,
      worker
    );
  }

  async function workerIsAssignedToProject(currentWorker, projectId) {
    if (!currentWorker || !projectId) return false;

    const { data, error } = await supabase
      .from("worker_projects")
      .select("*")
      .eq("worker_id", currentWorker.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      console.log(error);
      return false;
    }

    return Boolean(data);
  }

  async function acknowledge() {
    if (!checked) {
      alert(
        language === "spanish"
          ? "Marque la casilla de reconocimiento antes de enviar."
          : "Please check the acknowledgment box before submitting."
      );
      return;
    }

    if (!assignment) {
      alert(
        language === "spanish"
          ? "No se encontró una asignación diaria."
          : "No daily assignment found."
      );
      return;
    }

    if (!worker) {
      alert(
        language === "spanish"
          ? "No se encontró un perfil de trabajador para este inicio de sesión."
          : "No worker profile found for this login. Make sure this email exists in the workers table."
      );
      return;
    }

    const isAssigned = await workerIsAssignedToProject(
      worker,
      selectedProjectId
    );

    if (!isAssigned) {
      alert(
        language === "spanish"
          ? "Este trabajador no está asignado a este proyecto."
          : "This worker is not assigned to this project."
      );
      return;
    }

    const { data: existingAck } = await supabase
      .from("acknowledgements")
      .select("*")
      .eq("assignment_id", assignment.id)
      .eq("worker_id", worker.id)
      .maybeSingle();

    if (existingAck) {
      setAlreadyAcknowledged(true);
      setMessage(alreadyAcknowledgedMessage);
      return;
    }

    const { error } = await supabase.from("acknowledgements").insert({
      assignment_id: assignment.id,
      worker_id: worker.id,
    });

    if (error) {
      alert(error.message);
    } else {
      setAlreadyAcknowledged(true);
      setMessage(successMessage);

      const { data: updatedAckData } = await supabase
        .from("acknowledgements")
        .select("*")
        .eq("assignment_id", assignment.id)
        .order("acknowledged_at", { ascending: false });

      setAcknowledgements(updatedAckData || []);
    }
  }

  async function createProject() {
    if (!isAdmin) {
      alert("You do not have access to create projects.");
      return;
    }

    if (!newProjectName.trim()) {
      alert("Enter a project name.");
      return;
    }

    const { error } = await supabase.from("projects").insert({
      project_name: newProjectName.trim(),
      active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewProjectName("");
    await refreshAdminLists();
    alert("Project created.");
  }

  function updateProjectField(projectId, fieldName, value) {
    setAllProjects((currentProjects) =>
      currentProjects.map((projectItem) =>
        projectItem.id === projectId
          ? { ...projectItem, [fieldName]: value }
          : projectItem
      )
    );
  }

  async function updateProject(projectItem) {
    if (!isAdmin) {
      alert("You do not have access to update projects.");
      return;
    }

    if (!projectItem.project_name?.trim()) {
      alert("Project name cannot be blank.");
      return;
    }

    const { error } = await supabase
      .from("projects")
      .update({
        project_name: projectItem.project_name.trim(),
        active: Boolean(projectItem.active),
      })
      .eq("id", projectItem.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadProjects();
    await loadAllProjects();

    if (selectedProjectId === projectItem.id) {
      await loadProject(projectItem.id);
    }

    alert("Project updated.");
  }

  async function createWorker() {
    if (!isAdmin) {
      alert("You do not have access to create workers.");
      return;
    }

    if (!newWorkerName.trim()) {
      alert("Enter worker name.");
      return;
    }

    if (!newWorkerEmail.trim()) {
      alert("Enter worker email.");
      return;
    }

    if (!newWorkerPhone.trim()) {
      alert("Enter worker phone number. This will be used as their password.");
      return;
    }

    const cleanedPhone = newWorkerPhone.replace(/\D/g, "");

    if (!cleanedPhone) {
      alert("Enter a valid phone number using digits.");
      return;
    }

    const response = await fetch("/api/create-worker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: newWorkerName,
        email: newWorkerEmail,
        phone: cleanedPhone,
        preferredLanguage: newWorkerLanguage,
        role: newWorkerRole,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Could not create worker.");
      return;
    }

    setNewWorkerName("");
    setNewWorkerEmail("");
    setNewWorkerPhone("");
    setNewWorkerLanguage("english");
    setNewWorkerRole("worker");

    await refreshAdminLists();

    alert(
      "Worker created. They can log in with their email and phone number as the password."
    );
  }

  function updateWorkerField(workerId, fieldName, value) {
    setAllWorkers((currentWorkers) =>
      currentWorkers.map((workerItem) =>
        workerItem.id === workerId
          ? { ...workerItem, [fieldName]: value }
          : workerItem
      )
    );
  }

  async function updateWorker(workerItem) {
    if (!isAdmin) {
      alert("You do not have access to update workers.");
      return;
    }

    if (!workerItem.full_name?.trim()) {
      alert("Worker name cannot be blank.");
      return;
    }

    const { error } = await supabase
      .from("workers")
      .update({
        full_name: workerItem.full_name.trim(),
        phone: workerItem.phone?.trim() || null,
        preferred_language: workerItem.preferred_language || "english",
        role: workerItem.role || "worker",
      })
      .eq("id", workerItem.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (worker?.id === workerItem.id) {
      setWorker({
        ...worker,
        full_name: workerItem.full_name.trim(),
        phone: workerItem.phone?.trim() || null,
        preferred_language: workerItem.preferred_language || "english",
        role: workerItem.role || "worker",
      });
    }

    await loadAllWorkers();

    if (selectedProjectId) {
      await loadProjectWorkers(selectedProjectId);
    }

    alert("Worker updated.");
  }
  async function loadManagedProjectWorkers(projectId) {
    if (!projectId) {
      setManagedProjectWorkers([]);
      return [];
    }

    const { data: projectWorkerData, error: projectWorkerError } =
      await supabase
        .from("worker_projects")
        .select("id, worker_id, project_id")
        .eq("project_id", projectId);

    if (projectWorkerError) {
      console.log(projectWorkerError);
      setManagedProjectWorkers([]);
      return [];
    }

    const workerIds = (projectWorkerData || []).map((row) => row.worker_id);

    if (workerIds.length === 0) {
      setManagedProjectWorkers([]);
      return [];
    }

    const { data: workerData, error: workerError } = await supabase
      .from("workers")
      .select("*")
      .in("id", workerIds)
      .order("full_name", { ascending: true });

    if (workerError) {
      console.log(workerError);
      setManagedProjectWorkers([]);
      return [];
    }

    const workersWithLinks = (workerData || []).map((workerItem) => {
      const linkRow = (projectWorkerData || []).find(
        (row) => row.worker_id === workerItem.id
      );

      return {
        ...workerItem,
        worker_project_link_id: linkRow?.id,
      };
    });

    setManagedProjectWorkers(workersWithLinks);
    return workersWithLinks;
  }

  async function removeWorkerFromProject(workerProjectLinkId) {
    if (!isAdmin) {
      alert("You do not have access to remove workers from projects.");
      return;
    }

    if (!workerProjectLinkId) {
      alert("Project worker link not found.");
      return;
    }

    const confirmed = window.confirm(
      "Remove this worker from the selected project?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("worker_projects")
      .delete()
      .eq("id", workerProjectLinkId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadManagedProjectWorkers(manageProjectWorkersId);

    if (manageProjectWorkersId === selectedProjectId) {
      await loadProjectWorkers(selectedProjectId);
    }

    alert("Worker removed from project.");
  }

  function handleManageProjectWorkersChange(projectId) {
    setManageProjectWorkersId(projectId);
    loadManagedProjectWorkers(projectId);
  }
  async function linkWorkerToProject() {
    if (!isAdmin) {
      alert("You do not have access to link workers to projects.");
      return;
    }

    if (!linkWorkerId) {
      alert("Choose a worker.");
      return;
    }

    if (!linkProjectId) {
      alert("Choose a project.");
      return;
    }

    const { data: existingLink } = await supabase
      .from("worker_projects")
      .select("*")
      .eq("worker_id", linkWorkerId)
      .eq("project_id", linkProjectId)
      .maybeSingle();

    if (existingLink) {
      alert("This worker is already assigned to that project.");
      return;
    }

    const { error } = await supabase.from("worker_projects").insert({
      worker_id: linkWorkerId,
      project_id: linkProjectId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setLinkWorkerId("");
    setLinkProjectId("");

    if (linkProjectId === selectedProjectId) {
      await loadLatestAssignmentForProject(selectedProjectId, worker);
    }

    if (linkProjectId === manageProjectWorkersId) {
      await loadManagedProjectWorkers(manageProjectWorkersId);
    }

    alert("Worker linked to project.");
  }

  async function createSafetyTopic() {
    if (!isAdmin) {
      alert("You do not have access to create safety topics.");
      return;
    }

    if (!newTopicTitle.trim()) {
      alert("Enter a safety topic title.");
      return;
    }

    setUploadingDocument(true);

    let finalDocumentName = newTopicDocumentName.trim() || null;
    let finalDocumentUrl = newTopicDocumentUrl.trim() || null;

    if (newTopicFile) {
      const safeFileName = newTopicFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase();

      const filePath = `${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("safety-documents")
        .upload(filePath, newTopicFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setUploadingDocument(false);
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("safety-documents")
        .getPublicUrl(filePath);

      finalDocumentUrl = publicUrlData.publicUrl;

      if (!finalDocumentName) {
        finalDocumentName = newTopicFile.name;
      }
    }

    const { error } = await supabase.from("safety_topics").insert({
      title: newTopicTitle.trim(),
      english_content: newTopicEnglish.trim(),
      spanish_content: newTopicSpanish.trim(),
      document_name: finalDocumentName,
      document_url: finalDocumentUrl,
    });

    setUploadingDocument(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNewTopicTitle("");
    setNewTopicEnglish("");
    setNewTopicSpanish("");
    setNewTopicDocumentName("");
    setNewTopicDocumentUrl("");
    setNewTopicFile(null);
    setFileInputKey(Date.now());
    setShowAddTopicForm(false);

    await refreshAdminLists();
    alert("Safety topic created.");
  }

  function updateTopicField(topicId, fieldName, value) {
    setAllTopics((currentTopics) =>
      currentTopics.map((topicItem) =>
        topicItem.id === topicId
          ? { ...topicItem, [fieldName]: value }
          : topicItem
      )
    );
  }

  async function updateSafetyTopic(topicItem) {
    if (!isAdmin) {
      alert("You do not have access to update safety topics.");
      return;
    }

    if (!topicItem.title?.trim()) {
      alert("Safety topic title cannot be blank.");
      return;
    }

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

    if (error) {
      alert(error.message);
      return;
    }

    await loadAllTopics();

    if (topic?.id === topicItem.id) {
      await loadLatestAssignmentForProject(selectedProjectId, worker);
    }

    alert("Safety topic updated.");
  }

  async function createAssignment() {
    if (!isAdmin) {
      alert("You do not have access to create assignments.");
      return;
    }

    if (!assignmentProjectId) {
      alert("Choose a project.");
      return;
    }

    if (!assignmentTopicId) {
      alert("Choose a safety topic.");
      return;
    }

    if (!assignmentDate) {
      alert("Choose an assignment date.");
      return;
    }

    const { data: existingAssignment, error: duplicateCheckError } =
      await supabase
        .from("daily_assignments")
        .select("id")
        .eq("project_id", assignmentProjectId)
        .eq("topic_id", assignmentTopicId)
        .eq("assigned_date", assignmentDate)
        .maybeSingle();

    if (duplicateCheckError) {
      alert(duplicateCheckError.message);
      return;
    }

    if (existingAssignment) {
      alert(
        "This safety topic is already assigned to this project for that date."
      );
      return;
    }

    const { error } = await supabase.from("daily_assignments").insert({
      project_id: assignmentProjectId,
      topic_id: assignmentTopicId,
      assigned_date: assignmentDate,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setAssignmentProjectId("");
    setAssignmentTopicId("");
    setAssignmentDate("");

    if (assignmentProjectId === selectedProjectId) {
      await loadLatestAssignmentForProject(selectedProjectId, worker);
    }

    await loadAllAssignments();

    alert("Safety topic assigned to project.");
  }

  function handleProjectChange(event) {
    const newProjectId = event.target.value;
    setSelectedProjectId(newProjectId);
    loadLatestAssignmentForProject(newProjectId, worker);
  }

  function handleViewChange(nextView) {
    if ((nextView === "dashboard" || nextView === "admin") && !isAdmin) {
      setView("worker");
      alert("You do not have access to that section.");
      return;
    }

    setView(nextView);
  }

  function generatePdfReport() {
    if (!assignment || !topic || !project) {
      alert("No report data found.");
      return;
    }

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      alert("Popup blocked. Please allow popups for this site and try again.");
      return;
    }

    const reportRows = workers
      .map((workerItem) => {
        const workerAck = getAcknowledgementForWorker(workerItem.id);
        const isSigned = Boolean(workerAck);

        return `
          <tr>
            <td>${escapeHtml(workerItem.full_name)}</td>
            <td>${escapeHtml(workerItem.email || "No email")}</td>
            <td class="${isSigned ? "signed" : "pending"}">
              ${isSigned ? "Signed" : "Pending"}
            </td>
            <td>${escapeHtml(
          formatDateTime(
            workerAck?.acknowledged_at || workerAck?.Acknowledged_at
          )
        )}</td>
          </tr>
        `;
      })
      .join("");

    const documentSection = topic.document_url
      ? `
        <p>
          <strong>Document:</strong>
          <a href="${escapeHtml(topic.document_url)}" target="_blank">
            ${escapeHtml(topic.document_name || topic.document_url)}
          </a>
        </p>
      `
      : "";

    const generatedAt = new Date().toLocaleString();

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jobsite Safety Sign-Off Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              margin: 40px;
            }

            h1 {
              margin-bottom: 5px;
            }

            h2 {
              margin-top: 30px;
              border-bottom: 2px solid #111827;
              padding-bottom: 6px;
            }

            .muted {
              color: #6b7280;
              font-size: 14px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 20px;
              margin-bottom: 20px;
            }

            .summary-box {
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 14px;
              background: #f9fafb;
            }

            .summary-number {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
            }

            .summary-label {
              margin: 4px 0 0 0;
              color: #4b5563;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th {
              text-align: left;
              border-bottom: 2px solid #111827;
              padding: 10px;
              background: #f3f4f6;
            }

            td {
              border-bottom: 1px solid #d1d5db;
              padding: 10px;
            }

            .signed {
              color: #166534;
              font-weight: bold;
            }

            .pending {
              color: #991b1b;
              font-weight: bold;
            }

            .footer {
              margin-top: 35px;
              font-size: 12px;
              color: #6b7280;
            }

            @media print {
              button {
                display: none;
              }

              body {
                margin: 24px;
              }
            }
          </style>
        </head>

        <body>
          <button onclick="window.print()" style="padding: 10px 16px; margin-bottom: 20px;">
            Print / Save as PDF
          </button>

          <h1>Jobsite Safety Sign-Off Report</h1>
          <p class="muted">Generated: ${escapeHtml(generatedAt)}</p>

          <h2>Assignment Details</h2>
          <p><strong>Project:</strong> ${escapeHtml(project.project_name)}</p>
          <p><strong>Safety Topic:</strong> ${escapeHtml(topic.title)}</p>
          <p><strong>Assigned Date:</strong> ${escapeHtml(
      assignment.assigned_date
    )}</p>
          ${documentSection}

          <h2>Summary</h2>

          <div class="summary">
            <div class="summary-box">
              <p class="summary-number">${totalWorkerCount}</p>
              <p class="summary-label">Project Workers</p>
            </div>

            <div class="summary-box">
              <p class="summary-number">${signedCount}</p>
              <p class="summary-label">Signed</p>
            </div>

            <div class="summary-box">
              <p class="summary-number">${pendingCount}</p>
              <p class="summary-label">Pending</p>
            </div>
          </div>

          <h2>Worker Sign-Off Status</h2>

          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Email</th>
                <th>Status</th>
                <th>Time Acknowledged</th>
              </tr>
            </thead>

            <tbody>
              ${reportRows}
            </tbody>
          </table>

          <p class="footer">
            This report was generated from the Jobsite Safety app.
          </p>

          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);

    reportWindow.document.close();
  }

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    checkUser();
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      const currentWorker = await loadWorker(user);
      const projectList = await loadProjects();
      await loadAllProjects();
      await loadAllWorkers();
      await loadAllTopics();
      await loadAllAssignments();

      if (projectList.length > 0) {
        const firstProjectId = projectList[0].id;
        setSelectedProjectId(firstProjectId);
        await loadLatestAssignmentForProject(firstProjectId, currentWorker);
      }
    }

    if (user) {
      loadInitialData();
    }
  }, [user]);

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.container, maxWidth: 420 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Jobsite Safety</h1>
            <p style={styles.subtitle}>Daily safety acknowledgment portal</p>
          </div>

          <div style={styles.card}>
            <h2>Login</h2>

            <input
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button onClick={login} style={styles.primaryButton}>
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Jobsite Safety</h1>
          <p style={styles.subtitle}>
            Logged in as {user.email}
            {worker ? ` • ${worker.full_name}` : ""}
            {worker?.role ? (
              <span style={styles.roleBadge}>{worker.role}</span>
            ) : null}
          </p>
        </div>

        <div style={styles.card}>
          <button onClick={logout} style={styles.button}>
            Logout
          </button>

          <div style={{ marginTop: 20 }}>
            <label>
              <strong>Select Project</strong>
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                style={styles.select}
              >
                {projects.length > 0 ? (
                  projects.map((projectItem) => (
                    <option key={projectItem.id} value={projectItem.id}>
                      {projectItem.project_name}
                    </option>
                  ))
                ) : (
                  <option value="">No active projects found</option>
                )}
              </select>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => handleViewChange("worker")}
              style={{
                ...styles.tabButton,
                background: view === "worker" ? "#2563eb" : "#ffffff",
                color: view === "worker" ? "#ffffff" : "#1f2937",
                fontWeight: view === "worker" ? "bold" : "normal",
              }}
            >
              Worker View
            </button>

            {isAdmin && (
              <button
                onClick={() => handleViewChange("dashboard")}
                style={{
                  ...styles.tabButton,
                  background: view === "dashboard" ? "#2563eb" : "#ffffff",
                  color: view === "dashboard" ? "#ffffff" : "#1f2937",
                  fontWeight: view === "dashboard" ? "bold" : "normal",
                }}
              >
                Superintendent Dashboard
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleViewChange("admin")}
                style={{
                  ...styles.tabButton,
                  background: view === "admin" ? "#2563eb" : "#ffffff",
                  color: view === "admin" ? "#ffffff" : "#1f2937",
                  fontWeight: view === "admin" ? "bold" : "normal",
                }}
              >
                Admin Tools
              </button>
            )}
          </div>
        </div>

        {view === "worker" && (
          <div style={styles.card}>
            <h2>Today's Safety Topic</h2>

            {project && (
              <p>
                <strong>Project:</strong> {project.project_name}
              </p>
            )}

            <div style={styles.languageRow}>
              <button
                onClick={() => setLanguage("english")}
                style={{
                  ...styles.languageButton,
                  background: language === "english" ? "#2563eb" : "#ffffff",
                  color: language === "english" ? "#ffffff" : "#1f2937",
                  fontWeight: language === "english" ? "bold" : "normal",
                }}
              >
                English
              </button>

              <button
                onClick={() => setLanguage("spanish")}
                style={{
                  ...styles.languageButton,
                  background: language === "spanish" ? "#2563eb" : "#ffffff",
                  color: language === "spanish" ? "#ffffff" : "#1f2937",
                  fontWeight: language === "spanish" ? "bold" : "normal",
                }}
              >
                Español
              </button>
            </div>

            {topic ? (
              <>
                <h3>{topic.title}</h3>

                <p style={styles.topicText}>{topicText}</p>

                {topic.document_url && (
                  <div style={{ marginTop: 16 }}>
                    <a
                      href={topic.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.documentButton}
                    >
                      Open Safety Document
                      {topic.document_name ? `: ${topic.document_name}` : ""}
                    </a>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    background: "#f9fafb",
                  }}
                >
                  <label style={{ display: "flex", gap: 10, lineHeight: 1.5 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={alreadyAcknowledged}
                      onChange={(event) => setChecked(event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span>{acknowledgmentText}</span>
                  </label>
                </div>

                <button
                  onClick={acknowledge}
                  disabled={alreadyAcknowledged}
                  style={
                    alreadyAcknowledged
                      ? styles.disabledButton
                      : styles.primaryButton
                  }
                >
                  {acknowledgeButtonText}
                </button>

                {message && (
                  <p
                    style={
                      alreadyAcknowledged || message.includes("successfully")
                        ? styles.notice
                        : styles.warning
                    }
                  >
                    {message}
                  </p>
                )}
              </>
            ) : (
              <p style={styles.warning}>
                {message || "No safety topic assigned."}
              </p>
            )}
          </div>
        )}

        {view === "dashboard" && isAdmin && (
          <div style={styles.card}>
            <h2>Superintendent Dashboard</h2>

            {assignment && topic ? (
              <>
                <div style={styles.card}>
                  <h3 style={{ marginTop: 0 }}>Current Assignment</h3>

                  {project && (
                    <p>
                      <strong>Project:</strong> {project.project_name}
                    </p>
                  )}

                  <p>
                    <strong>Topic:</strong> {topic.title}
                  </p>

                  <p>
                    <strong>Assigned Date:</strong> {assignment.assigned_date}
                  </p>

                  {topic.document_url && (
                    <p>
                      <strong>Document:</strong>{" "}
                      <a
                        href={topic.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {topic.document_name || topic.document_url}
                      </a>
                    </p>
                  )}

                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{totalWorkerCount}</p>
                      <p style={styles.statLabel}>Project Workers</p>
                    </div>

                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{signedCount}</p>
                      <p style={styles.statLabel}>Signed</p>
                    </div>

                    <div style={styles.statBox}>
                      <p style={styles.statNumber}>{pendingCount}</p>
                      <p style={styles.statLabel}>Pending</p>
                    </div>
                  </div>

                  <button
                    onClick={generatePdfReport}
                    style={styles.reportButton}
                  >
                    Generate PDF Report
                  </button>
                </div>

                <h3>Project Worker Sign-Off Status</h3>

                {workers.length > 0 ? (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Worker</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Time Acknowledged</th>
                        </tr>
                      </thead>

                      <tbody>
                        {workers.map((workerItem) => {
                          const workerAck = getAcknowledgementForWorker(
                            workerItem.id
                          );

                          const isSigned = Boolean(workerAck);

                          return (
                            <tr key={workerItem.id}>
                              <td style={styles.td}>
                                {workerItem.full_name}
                              </td>

                              <td style={styles.td}>
                                {workerItem.email || "No email"}
                              </td>

                              <td style={styles.td}>
                                <span
                                  style={
                                    isSigned
                                      ? styles.signedBadge
                                      : styles.pendingBadge
                                  }
                                >
                                  {isSigned ? "Signed" : "Pending"}
                                </span>
                              </td>

                              <td style={styles.td}>
                                {formatDateTime(
                                  workerAck?.acknowledged_at ||
                                  workerAck?.Acknowledged_at
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.warning}>
                    No workers are assigned to this project yet. Add workers to
                    this project under Admin Tools.
                  </p>
                )}
              </>
            ) : (
              <p style={styles.warning}>
                {message || "No assignment found for this project."}
              </p>
            )}
          </div>
        )}

        {view === "admin" && isAdmin && (
          <div style={styles.card}>
            <h2>Admin Tools</h2>
            <p>
              Use these organized sections to manage projects, workers, safety
              topics, and assignments.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              {["projects", "workers", "topics", "assignments"].map(
                (tabName) => (
                  <button
                    key={tabName}
                    onClick={() => setAdminTab(tabName)}
                    style={{
                      ...styles.adminTabButton,
                      background:
                        adminTab === tabName ? "#2563eb" : "#ffffff",
                      color: adminTab === tabName ? "#ffffff" : "#1f2937",
                      fontWeight: adminTab === tabName ? "bold" : "normal",
                    }}
                  >
                    {tabName === "projects" && "Projects"}
                    {tabName === "workers" && "Workers"}
                    {tabName === "topics" && "Safety Topics"}
                    {tabName === "assignments" && "Assignments"}
                  </button>
                )
              )}
            </div>

            {adminTab === "projects" && (
              <div style={styles.card}>
                <h3>Manage Projects</h3>
                <p>
                  Add new projects, rename existing projects, and mark projects
                  active or inactive.
                </p>

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Add New Project</h4>

                  <input
                    style={styles.input}
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                  />

                  <button onClick={createProject} style={styles.primaryButton}>
                    Create Project
                  </button>
                </div>

                <h4>Existing Projects</h4>

                {allProjects.length > 0 ? (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Project Name</th>
                          <th style={styles.th}>Active</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {allProjects.map((projectItem) => (
                          <tr key={projectItem.id}>
                            <td style={styles.td}>
                              <input
                                style={styles.smallInput}
                                value={projectItem.project_name || ""}
                                onChange={(event) =>
                                  updateProjectField(
                                    projectItem.id,
                                    "project_name",
                                    event.target.value
                                  )
                                }
                              />
                            </td>

                            <td style={styles.td}>
                              <select
                                style={styles.smallSelect}
                                value={projectItem.active ? "true" : "false"}
                                onChange={(event) =>
                                  updateProjectField(
                                    projectItem.id,
                                    "active",
                                    event.target.value === "true"
                                  )
                                }
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </td>

                            <td style={styles.td}>
                              <button
                                onClick={() => updateProject(projectItem)}
                                style={styles.saveButton}
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.warning}>No projects found.</p>
                )}
              </div>
            )}

            {adminTab === "workers" && (
              <div style={styles.card}>
                <h3>Manage Workers</h3>
                <p>
                  Add workers, edit worker details, and link workers to
                  projects.
                </p>

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Add New Worker</h4>
                  <p style={{ marginTop: 0, color: "#4b5563" }}>
                    Worker login password will be their phone number using digits only.
                  </p>
                  <div style={styles.inlineGrid}>
                    <label>
                      Full Name
                      <input
                        style={styles.input}
                        placeholder="Full name"
                        value={newWorkerName}
                        onChange={(event) =>
                          setNewWorkerName(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Email
                      <input
                        style={styles.input}
                        placeholder="Email"
                        value={newWorkerEmail}
                        onChange={(event) =>
                          setNewWorkerEmail(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Phone
                      <input
                        style={styles.input}
                        placeholder="Phone"
                        value={newWorkerPhone}
                        onChange={(event) =>
                          setNewWorkerPhone(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Language
                      <select
                        style={styles.select}
                        value={newWorkerLanguage}
                        onChange={(event) =>
                          setNewWorkerLanguage(event.target.value)
                        }
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                      </select>
                    </label>

                    <label>
                      Role
                      <select
                        style={styles.select}
                        value={newWorkerRole}
                        onChange={(event) =>
                          setNewWorkerRole(event.target.value)
                        }
                      >
                        <option value="worker">Worker</option>
                        <option value="superintendent">Superintendent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                  </div>

                  <button onClick={createWorker} style={styles.primaryButton}>
                    Create Worker
                  </button>
                </div>

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Link Worker to Project</h4>

                  <div style={styles.inlineGrid}>
                    <label>
                      Worker
                      <select
                        style={styles.select}
                        value={linkWorkerId}
                        onChange={(event) => setLinkWorkerId(event.target.value)}
                      >
                        <option value="">Select worker</option>
                        {allWorkers.map((workerItem) => (
                          <option key={workerItem.id} value={workerItem.id}>
                            {workerItem.full_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Project
                      <select
                        style={styles.select}
                        value={linkProjectId}
                        onChange={(event) =>
                          setLinkProjectId(event.target.value)
                        }
                      >
                        <option value="">Select project</option>
                        {projects.map((projectItem) => (
                          <option key={projectItem.id} value={projectItem.id}>
                            {projectItem.project_name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={linkWorkerToProject}
                    style={styles.primaryButton}
                  >
                    Link Worker
                  </button>
                </div>
                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Project Worker Assignments</h4>

                  <p style={{ color: "#4b5563" }}>
                    Select a project to see which workers are assigned to it. You can remove a
                    worker from a project without deleting their worker profile.
                  </p>

                  <label>
                    Project
                    <select
                      style={styles.select}
                      value={manageProjectWorkersId}
                      onChange={(event) =>
                        handleManageProjectWorkersChange(event.target.value)
                      }
                    >
                      <option value="">Select project</option>
                      {projects.map((projectItem) => (
                        <option key={projectItem.id} value={projectItem.id}>
                          {projectItem.project_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {manageProjectWorkersId ? (
                    managedProjectWorkers.length > 0 ? (
                      <div style={styles.tableWrap}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Worker</th>
                              <th style={styles.th}>Email</th>
                              <th style={styles.th}>Phone</th>
                              <th style={styles.th}>Role</th>
                              <th style={styles.th}>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {managedProjectWorkers.map((workerItem) => (
                              <tr key={workerItem.id}>
                                <td style={styles.td}>{workerItem.full_name}</td>

                                <td style={styles.td}>{workerItem.email || "No email"}</td>

                                <td style={styles.td}>{workerItem.phone || "No phone"}</td>

                                <td style={styles.td}>{workerItem.role || "worker"}</td>

                                <td style={styles.td}>
                                  <button
                                    onClick={() =>
                                      removeWorkerFromProject(
                                        workerItem.worker_project_link_id
                                      )
                                    }
                                    style={{
                                      ...styles.saveButton,
                                      background: "#dc2626",
                                    }}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={styles.warning}>
                        No workers are assigned to this project yet.
                      </p>
                    )
                  ) : (
                    <p style={styles.warning}>Select a project to view assigned workers.</p>
                  )}
                </div>
                <h4>Existing Workers</h4>
                <input
                  style={styles.input}
                  placeholder="Search workers by name, email, phone, or role..."
                  value={workerSearch}
                  onChange={(event) => setWorkerSearch(event.target.value)}
                />
                {filteredWorkers.length > 0 ? (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Phone</th>
                          <th style={styles.th}>Language</th>
                          <th style={styles.th}>Role</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredWorkers.map((workerItem) => (
                          <tr key={workerItem.id}>
                            <td style={styles.td}>
                              <input
                                style={styles.smallInput}
                                value={workerItem.full_name || ""}
                                onChange={(event) =>
                                  updateWorkerField(
                                    workerItem.id,
                                    "full_name",
                                    event.target.value
                                  )
                                }
                              />
                            </td>

                            <td style={styles.td}>
                              {workerItem.email || "No email"}
                            </td>

                            <td style={styles.td}>
                              <input
                                style={styles.smallInput}
                                value={workerItem.phone || ""}
                                onChange={(event) =>
                                  updateWorkerField(
                                    workerItem.id,
                                    "phone",
                                    event.target.value
                                  )
                                }
                              />
                            </td>

                            <td style={styles.td}>
                              <select
                                style={styles.smallSelect}
                                value={
                                  workerItem.preferred_language || "english"
                                }
                                onChange={(event) =>
                                  updateWorkerField(
                                    workerItem.id,
                                    "preferred_language",
                                    event.target.value
                                  )
                                }
                              >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                              </select>
                            </td>

                            <td style={styles.td}>
                              <select
                                style={styles.smallSelect}
                                value={workerItem.role || "worker"}
                                onChange={(event) =>
                                  updateWorkerField(
                                    workerItem.id,
                                    "role",
                                    event.target.value
                                  )
                                }
                              >
                                <option value="worker">Worker</option>
                                <option value="superintendent">
                                  Superintendent
                                </option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>

                            <td style={styles.td}>
                              <button
                                onClick={() => updateWorker(workerItem)}
                                style={styles.saveButton}
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.warning}>No matching workers found.</p>
                )}
              </div>
            )}

            {adminTab === "topics" && (
              <div style={styles.card}>
                <h3>Manage Safety Topics</h3>
                <p>
                  Add new topics, search existing topics, and edit one topic at
                  a time.
                </p>

                <button
                  onClick={() => setShowAddTopicForm(!showAddTopicForm)}
                  style={styles.primaryButton}
                >
                  {showAddTopicForm ? "Hide Add Topic Form" : "+ Add New Topic"}
                </button>

                {showAddTopicForm && (
                  <div style={styles.card}>
                    <h4 style={{ marginTop: 0 }}>Add New Safety Topic</h4>

                    <input
                      style={styles.input}
                      placeholder="Topic title"
                      value={newTopicTitle}
                      onChange={(event) =>
                        setNewTopicTitle(event.target.value)
                      }
                    />

                    <textarea
                      style={styles.textarea}
                      placeholder="English content"
                      value={newTopicEnglish}
                      onChange={(event) =>
                        setNewTopicEnglish(event.target.value)
                      }
                    />

                    <textarea
                      style={styles.textarea}
                      placeholder="Spanish content"
                      value={newTopicSpanish}
                      onChange={(event) =>
                        setNewTopicSpanish(event.target.value)
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Document name, example: Ladder Safety PDF"
                      value={newTopicDocumentName}
                      onChange={(event) =>
                        setNewTopicDocumentName(event.target.value)
                      }
                    />

                    <input
                      key={fileInputKey}
                      style={styles.input}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(event) =>
                        setNewTopicFile(event.target.files?.[0] || null)
                      }
                    />

                    {newTopicFile && (
                      <p>
                        Selected file: <strong>{newTopicFile.name}</strong>
                      </p>
                    )}

                    <input
                      style={styles.input}
                      placeholder="Optional document URL if not uploading a file"
                      value={newTopicDocumentUrl}
                      onChange={(event) =>
                        setNewTopicDocumentUrl(event.target.value)
                      }
                    />

                    <button
                      onClick={createSafetyTopic}
                      style={
                        uploadingDocument
                          ? styles.disabledButton
                          : styles.primaryButton
                      }
                      disabled={uploadingDocument}
                    >
                      {uploadingDocument
                        ? "Uploading..."
                        : "Create Safety Topic"}
                    </button>
                  </div>
                )}

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Existing Safety Topics</h4>

                  <input
                    style={styles.input}
                    placeholder="Search safety topics..."
                    value={topicSearch}
                    onChange={(event) => setTopicSearch(event.target.value)}
                  />

                  {filteredTopics.length > 0 ? (
                    <div style={styles.compactList}>
                      {filteredTopics.map((topicItem) => (
                        <div key={topicItem.id} style={styles.compactListItem}>
                          <div>
                            <strong>{topicItem.title}</strong>
                            {topicItem.document_url && (
                              <div style={{ fontSize: 13, color: "#4b5563" }}>
                                Document attached
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedTopicId(topicItem.id)}
                            style={styles.saveButton}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.warning}>No safety topics found.</p>
                  )}
                </div>

                {selectedTopicForEdit && (
                  <div style={styles.card}>
                    <h4 style={{ marginTop: 0 }}>
                      Edit Topic: {selectedTopicForEdit.title}
                    </h4>

                    <label>
                      Topic Title
                      <input
                        style={styles.input}
                        value={selectedTopicForEdit.title || ""}
                        onChange={(event) =>
                          updateTopicField(
                            selectedTopicForEdit.id,
                            "title",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      English Content
                      <textarea
                        style={styles.textarea}
                        value={selectedTopicForEdit.english_content || ""}
                        onChange={(event) =>
                          updateTopicField(
                            selectedTopicForEdit.id,
                            "english_content",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Spanish Content
                      <textarea
                        style={styles.textarea}
                        value={selectedTopicForEdit.spanish_content || ""}
                        onChange={(event) =>
                          updateTopicField(
                            selectedTopicForEdit.id,
                            "spanish_content",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Document Name
                      <input
                        style={styles.input}
                        value={selectedTopicForEdit.document_name || ""}
                        placeholder="Document name"
                        onChange={(event) =>
                          updateTopicField(
                            selectedTopicForEdit.id,
                            "document_name",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Document URL
                      <input
                        style={styles.input}
                        value={selectedTopicForEdit.document_url || ""}
                        placeholder="Document URL"
                        onChange={(event) =>
                          updateTopicField(
                            selectedTopicForEdit.id,
                            "document_url",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    {selectedTopicForEdit.document_url && (
                      <p>
                        <a
                          href={selectedTopicForEdit.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open current document
                        </a>
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => updateSafetyTopic(selectedTopicForEdit)}
                        style={styles.saveButton}
                      >
                        Save Safety Topic
                      </button>

                      <button
                        onClick={() => setSelectedTopicId("")}
                        style={styles.button}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {adminTab === "assignments" && (
              <div style={styles.card}>
                <h3>Manage Assignments</h3>
                <p>
                  Assign safety topics to projects and review previous
                  assignments.
                </p>

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Create New Assignment</h4>

                  <label>
                    Project
                    <select
                      style={styles.select}
                      value={assignmentProjectId}
                      onChange={(event) =>
                        setAssignmentProjectId(event.target.value)
                      }
                    >
                      <option value="">Select project</option>
                      {projects.map((projectItem) => (
                        <option key={projectItem.id} value={projectItem.id}>
                          {projectItem.project_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Safety Topic
                    <select
                      style={styles.select}
                      value={assignmentTopicId}
                      onChange={(event) =>
                        setAssignmentTopicId(event.target.value)
                      }
                    >
                      <option value="">Select topic</option>
                      {allTopics.map((topicItem) => (
                        <option key={topicItem.id} value={topicItem.id}>
                          {topicItem.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Date
                    <input
                      style={styles.input}
                      type="date"
                      value={assignmentDate}
                      onChange={(event) =>
                        setAssignmentDate(event.target.value)
                      }
                    />
                  </label>

                  <button
                    onClick={createAssignment}
                    style={styles.primaryButton}
                  >
                    Assign Topic
                  </button>
                </div>

                <div style={styles.card}>
                  <h4 style={{ marginTop: 0 }}>Existing Assignments</h4>

                  {allAssignments.length > 0 ? (
                    <div style={styles.tableWrap}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Assigned Date</th>
                            <th style={styles.th}>Project</th>
                            <th style={styles.th}>Safety Topic</th>
                            <th style={styles.th}>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {allAssignments.map((assignmentItem) => (
                            <tr key={assignmentItem.id}>
                              <td style={styles.td}>
                                {assignmentItem.assigned_date}
                              </td>

                              <td style={styles.td}>
                                {assignmentItem.project_name || "No project"}
                              </td>

                              <td style={styles.td}>
                                {assignmentItem.topic_title || "No topic"}
                              </td>

                              <td style={styles.td}>
                                <button
                                  onClick={() =>
                                    viewAssignmentDashboard(assignmentItem)
                                  }
                                  style={styles.saveButton}
                                >
                                  View Dashboard
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={styles.warning}>No assignments found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
