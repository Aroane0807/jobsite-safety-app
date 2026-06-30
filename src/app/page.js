"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/shared";

import LoginForm from "../components/LoginForm";
import WorkerView from "../components/WorkerView";
import Dashboard from "../components/Dashboard";
import AdminTools from "../components/admin/AdminTools";

import {
  fetchWorkerByEmail,
  fetchAllWorkers,
  fetchWorkersByIds,
  fetchWorkerProjectIds,
  fetchWorkerProjectLinks,
  checkWorkerProjectLink,
  addWorkerToProject,
  removeWorkerProjectLink,
  saveWorkerUpdate,
} from "../lib/workers";

import {
  fetchActiveProjects,
  fetchAllProjects,
  fetchProjectById,
  createProject,
  saveProjectUpdate,
} from "../lib/projects";

import {
  fetchAllTopics,
  createTopic,
  saveTopicUpdate,
} from "../lib/topics";

import {
  fetchTodaysAssignment,
  fetchAssignmentById,
  fetchAllAssignments,
  fetchAcknowledgements,
  fetchWorkerAcknowledgement,
  submitAcknowledgement,
  checkDuplicateAssignment,
  createAssignment,
  fetchWeeklyReportData,
} from "../lib/assignments";

import { generateDailyPdf, generateWeeklyPdf } from "../lib/reports";

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

  const [weeklyReportProjectId, setWeeklyReportProjectId] = useState("");
  const [weeklyReportStartDate, setWeeklyReportStartDate] = useState("");
  const [weeklyReportEndDate, setWeeklyReportEndDate] = useState("");

  const [weeklyPlannerProjectId, setWeeklyPlannerProjectId] = useState("");
  const [weeklyPlannerStartDate, setWeeklyPlannerStartDate] = useState("");
  const [weeklyPlannerTopics, setWeeklyPlannerTopics] = useState({
    monday: "", tuesday: "", wednesday: "", thursday: "", friday: "",
  });

  const isAdmin = worker?.role === "admin" || worker?.role === "superintendent";

  const alreadyAcknowledgedMessage =
    language === "spanish"
      ? "Ya ha reconocido este tema de seguridad."
      : "You have already acknowledged this safety topic.";

  const successMessage =
    language === "spanish"
      ? "Tema de seguridad reconocido correctamente."
      : "Safety topic acknowledged successfully.";

  // ─── Auth ────────────────────────────────────────────────────────────────────

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setUser(data.user);
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

  // ─── Data loading ─────────────────────────────────────────────────────────────

  async function loadWorker(currentUser) {
    if (!currentUser?.email) return null;
    const data = await fetchWorkerByEmail(currentUser.email);

    if (!data) {
      setMessage("No worker profile found for this email. Add this email to the workers table in Supabase.");
      return null;
    }

    setWorker(data);
    if (data.role !== "admin" && data.role !== "superintendent") setView("worker");
    setLanguage(data.preferred_language === "spanish" ? "spanish" : "english");
    return data;
  }

  async function refreshAdminLists(currentProjectList) {
    await Promise.all([
      fetchAllProjects().then(setAllProjects),
      fetchAllWorkers().then(setAllWorkers),
      fetchAllTopics().then(setAllTopics),
      fetchAllAssignments().then(setAllAssignments),
    ]);

    if (!selectedProjectId && currentProjectList?.length > 0) {
      setSelectedProjectId(currentProjectList[0].id);
    }
  }

  async function loadProjectWorkers(projectId) {
    if (!projectId) { setWorkers([]); return []; }
    const workerIds = await fetchWorkerProjectIds(projectId);
    const workerData = await fetchWorkersByIds(workerIds);
    setWorkers(workerData);
    return workerData;
  }

  async function loadLatestAssignmentForProject(projectId, currentWorker) {
    if (!projectId) {
      setAssignment(null); setTopic(null); setAcknowledgements([]);
      setWorkers([]); setAlreadyAcknowledged(false); setChecked(false); setMessage("");
      return;
    }

    setChecked(false); setAlreadyAcknowledged(false); setMessage("");

    const projectData = await fetchProjectById(projectId);
    setProject(projectData);
    await loadProjectWorkers(projectId);

    const data = await fetchTodaysAssignment(projectId);

    if (!data) {
      setAssignment(null); setTopic(null); setAcknowledgements([]);
      setMessage("No safety topic has been assigned to this project yet.");
      return;
    }

    setAssignment(data);
    setTopic(data.safety_topics);

    const acks = await fetchAcknowledgements(data.id);
    setAcknowledgements(acks);

    if (currentWorker) {
      const existing = await fetchWorkerAcknowledgement(data.id, currentWorker.id);
      if (existing) { setAlreadyAcknowledged(true); setMessage(alreadyAcknowledgedMessage); }
    }
  }

  async function loadManagedProjectWorkers(projectId) {
    if (!projectId) { setManagedProjectWorkers([]); return; }
    const links = await fetchWorkerProjectLinks(projectId);
    const workerIds = links.map((r) => r.worker_id);
    const workerData = await fetchWorkersByIds(workerIds);
    const withLinks = workerData.map((w) => ({
      ...w,
      worker_project_link_id: links.find((r) => r.worker_id === w.id)?.id,
    }));
    setManagedProjectWorkers(withLinks);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async function acknowledge() {
    if (!checked) {
      alert(language === "spanish"
        ? "Marque la casilla de reconocimiento antes de enviar."
        : "Please check the acknowledgment box before submitting.");
      return;
    }
    if (!assignment) { alert("No daily assignment found."); return; }
    if (!worker) { alert("No worker profile found for this login."); return; }

    const isAssigned = await checkWorkerProjectLink(worker.id, selectedProjectId);
    if (!isAssigned) { alert("This worker is not assigned to this project."); return; }

    const existing = await fetchWorkerAcknowledgement(assignment.id, worker.id);
    if (existing) { setAlreadyAcknowledged(true); setMessage(alreadyAcknowledgedMessage); return; }

    const error = await submitAcknowledgement(assignment.id, worker.id);
    if (error) { alert(error.message); return; }

    setAlreadyAcknowledged(true);
    setMessage(successMessage);
    const updated = await fetchAcknowledgements(assignment.id);
    setAcknowledgements(updated);
  }

  async function handleCreateProject() {
    if (!isAdmin) { alert("You do not have access to create projects."); return; }
    if (!newProjectName.trim()) { alert("Enter a project name."); return; }
    const error = await createProject(newProjectName);
    if (error) { alert(error.message); return; }
    setNewProjectName("");
    const updated = await fetchActiveProjects();
    setProjects(updated);
    await refreshAdminLists(updated);
    alert("Project created.");
  }

  function updateProjectField(projectId, fieldName, value) {
    setAllProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, [fieldName]: value } : p)
    );
  }

  async function handleSaveProject(projectItem) {
    if (!isAdmin) { alert("You do not have access to update projects."); return; }
    if (!projectItem.project_name?.trim()) { alert("Project name cannot be blank."); return; }
    const error = await saveProjectUpdate(projectItem);
    if (error) { alert(error.message); return; }
    const updated = await fetchActiveProjects();
    setProjects(updated);
    setAllProjects(await fetchAllProjects());
    if (selectedProjectId === projectItem.id) setProject(await fetchProjectById(projectItem.id));
    alert("Project updated.");
  }

  async function handleCreateWorker() {
    if (!isAdmin) { alert("You do not have access to create workers."); return; }
    if (!newWorkerName.trim()) { alert("Enter worker name."); return; }
    if (!newWorkerEmail.trim()) { alert("Enter worker email."); return; }
    if (!newWorkerPhone.trim()) { alert("Enter worker phone number. This will be used as their password."); return; }

    const cleanedPhone = newWorkerPhone.replace(/\D/g, "");
    if (!cleanedPhone) { alert("Enter a valid phone number using digits."); return; }

    const response = await fetch("/api/create-worker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
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
    if (!response.ok) { alert(result.error || "Could not create worker."); return; }

    setNewWorkerName(""); setNewWorkerEmail(""); setNewWorkerPhone("");
    setNewWorkerLanguage("english"); setNewWorkerRole("worker");

    const updated = await fetchActiveProjects();
    setProjects(updated);
    await refreshAdminLists(updated);
    alert("Worker created. They can log in with their email and phone number as the password.");
  }

  function updateWorkerField(workerId, fieldName, value) {
    setAllWorkers((prev) =>
      prev.map((w) => w.id === workerId ? { ...w, [fieldName]: value } : w)
    );
  }

  async function handleSaveWorker(workerItem) {
    if (!isAdmin) { alert("You do not have access to update workers."); return; }
    if (!workerItem.full_name?.trim()) { alert("Worker name cannot be blank."); return; }
    const error = await saveWorkerUpdate(workerItem);
    if (error) { alert(error.message); return; }
    if (worker?.id === workerItem.id) {
      setWorker({ ...worker, full_name: workerItem.full_name.trim(), phone: workerItem.phone?.trim() || null, preferred_language: workerItem.preferred_language || "english", role: workerItem.role || "worker" });
    }
    setAllWorkers(await fetchAllWorkers());
    if (selectedProjectId) await loadProjectWorkers(selectedProjectId);
    alert("Worker updated.");
  }

  async function handleLinkWorker() {
    if (!isAdmin) { alert("You do not have access to link workers to projects."); return; }
    if (!linkWorkerId) { alert("Choose a worker."); return; }
    if (!linkProjectId) { alert("Choose a project."); return; }

    const already = await checkWorkerProjectLink(linkWorkerId, linkProjectId);
    if (already) { alert("This worker is already assigned to that project."); return; }

    const error = await addWorkerToProject(linkWorkerId, linkProjectId);
    if (error) { alert(error.message); return; }

    setLinkWorkerId(""); setLinkProjectId("");
    if (linkProjectId === selectedProjectId) await loadLatestAssignmentForProject(selectedProjectId, worker);
    if (linkProjectId === manageProjectWorkersId) await loadManagedProjectWorkers(manageProjectWorkersId);
    alert("Worker linked to project.");
  }

  async function handleRemoveWorkerFromProject(linkId) {
    if (!isAdmin) { alert("You do not have access to remove workers from projects."); return; }
    if (!linkId) { alert("Project worker link not found."); return; }
    if (!window.confirm("Remove this worker from the selected project?")) return;

    const error = await removeWorkerProjectLink(linkId);
    if (error) { alert(error.message); return; }

    await loadManagedProjectWorkers(manageProjectWorkersId);
    if (manageProjectWorkersId === selectedProjectId) await loadProjectWorkers(selectedProjectId);
    alert("Worker removed from project.");
  }

  async function handleCreateTopic() {
    if (!isAdmin) { alert("You do not have access to create safety topics."); return; }
    if (!newTopicTitle.trim()) { alert("Enter a safety topic title."); return; }
    setUploadingDocument(true);
    const { error } = await createTopic({
      title: newTopicTitle, english: newTopicEnglish, spanish: newTopicSpanish,
      documentName: newTopicDocumentName, documentUrl: newTopicDocumentUrl, file: newTopicFile,
    });
    setUploadingDocument(false);
    if (error) { alert(error.message); return; }
    setNewTopicTitle(""); setNewTopicEnglish(""); setNewTopicSpanish("");
    setNewTopicDocumentName(""); setNewTopicDocumentUrl(""); setNewTopicFile(null);
    setFileInputKey(Date.now()); setShowAddTopicForm(false);
    const updated = await fetchActiveProjects();
    await refreshAdminLists(updated);
    alert("Safety topic created.");
  }

  function updateTopicField(topicId, fieldName, value) {
    setAllTopics((prev) =>
      prev.map((t) => t.id === topicId ? { ...t, [fieldName]: value } : t)
    );
  }

  async function handleSaveTopic(topicItem) {
    if (!isAdmin) { alert("You do not have access to update safety topics."); return; }
    if (!topicItem.title?.trim()) { alert("Safety topic title cannot be blank."); return; }
    const error = await saveTopicUpdate(topicItem);
    if (error) { alert(error.message); return; }
    setAllTopics(await fetchAllTopics());
    if (topic?.id === topicItem.id) await loadLatestAssignmentForProject(selectedProjectId, worker);
    alert("Safety topic updated.");
  }

  async function handleCreateAssignment() {
    if (!isAdmin) { alert("You do not have access to create assignments."); return; }
    if (!assignmentProjectId) { alert("Choose a project."); return; }
    if (!assignmentTopicId) { alert("Choose a safety topic."); return; }
    if (!assignmentDate) { alert("Choose an assignment date."); return; }

    const isDuplicate = await checkDuplicateAssignment(assignmentProjectId, assignmentTopicId, assignmentDate);
    if (isDuplicate) { alert("This safety topic is already assigned to this project for that date."); return; }

    const error = await createAssignment(assignmentProjectId, assignmentTopicId, assignmentDate);
    if (error) { alert(error.message); return; }

    setAssignmentProjectId(""); setAssignmentTopicId(""); setAssignmentDate("");
    if (assignmentProjectId === selectedProjectId) await loadLatestAssignmentForProject(selectedProjectId, worker);
    setAllAssignments(await fetchAllAssignments());
    alert("Safety topic assigned to project.");
  }

  async function handleCreateWeeklyAssignments() {
    if (!isAdmin) { alert("You do not have access to create assignments."); return; }
    if (!weeklyPlannerProjectId) { alert("Choose a project for the weekly planner."); return; }
    if (!weeklyPlannerStartDate) { alert("Choose the Monday date for the weekly planner."); return; }

    const days = [
      { key: "monday", offset: 0 }, { key: "tuesday", offset: 1 },
      { key: "wednesday", offset: 2 }, { key: "thursday", offset: 3 },
      { key: "friday", offset: 4 },
    ];

    const toCreate = days
      .map((day) => ({
        project_id: weeklyPlannerProjectId,
        topic_id: weeklyPlannerTopics[day.key],
        assigned_date: getWeeklyPlannerDate(day.offset),
      }))
      .filter((item) => item.topic_id);

    if (toCreate.length === 0) { alert("Choose at least one safety topic for the week."); return; }

    let createdCount = 0, skippedCount = 0;

    for (const item of toCreate) {
      const isDuplicate = await checkDuplicateAssignment(item.project_id, item.topic_id, item.assigned_date);
      if (isDuplicate) { skippedCount++; continue; }
      const error = await createAssignment(item.project_id, item.topic_id, item.assigned_date);
      if (error) { alert(error.message); return; }
      createdCount++;
    }

    setAllAssignments(await fetchAllAssignments());
    if (weeklyPlannerProjectId === selectedProjectId) await loadLatestAssignmentForProject(selectedProjectId, worker);
    alert(`Weekly assignments complete. Created: ${createdCount}. Skipped duplicates: ${skippedCount}.`);
  }

  async function handleGenerateWeeklyReport() {
    if (!weeklyReportProjectId) { alert("Choose a project for the weekly report."); return; }
    if (!weeklyReportStartDate) { alert("Choose a start date for the weekly report."); return; }
    if (!weeklyReportEndDate) { alert("Choose an end date for the weekly report."); return; }
    if (weeklyReportStartDate > weeklyReportEndDate) { alert("Start date cannot be after end date."); return; }

    const selectedProject = allProjects.find((p) => p.id === weeklyReportProjectId);
    const { data, error } = await fetchWeeklyReportData(weeklyReportProjectId, weeklyReportStartDate, weeklyReportEndDate);

    if (error) { alert(error.message); return; }
    if (!data) { alert("No assignments found for that project and date range."); return; }

    const workerIds = await fetchWorkerProjectIds(weeklyReportProjectId);
    const projectWorkers = await fetchWorkersByIds(workerIds);

    generateWeeklyPdf({
      project: selectedProject,
      startDate: weeklyReportStartDate,
      endDate: weeklyReportEndDate,
      assignments: data.assignments,
      topics: data.topics,
      acknowledgements: data.acknowledgements,
      projectWorkers,
    });
  }

  async function viewAssignmentDashboard(assignmentItem) {
    setChecked(false); setAlreadyAcknowledged(false); setMessage("");
    setSelectedProjectId(assignmentItem.project_id);

    const projectData = await fetchProjectById(assignmentItem.project_id);
    setProject(projectData);
    await loadProjectWorkers(assignmentItem.project_id);

    const data = await fetchAssignmentById(assignmentItem.id);
    if (!data) { alert("Assignment not found."); return; }

    setAssignment(data);
    setTopic(data.safety_topics);

    const acks = await fetchAcknowledgements(data.id);
    setAcknowledgements(acks);

    if (worker) {
      const existing = await fetchWorkerAcknowledgement(data.id, worker.id);
      if (existing) { setAlreadyAcknowledged(true); setMessage(alreadyAcknowledgedMessage); }
    }

    setView("dashboard");
  }

  function handleProjectChange(e) {
    const newId = e.target.value;
    setSelectedProjectId(newId);
    loadLatestAssignmentForProject(newId, worker);
  }

  function handleViewChange(nextView) {
    if ((nextView === "dashboard" || nextView === "admin") && !isAdmin) {
      setView("worker");
      alert("You do not have access to that section.");
      return;
    }
    setView(nextView);
  }

  function getWeeklyPlannerDate(dayIndex) {
    if (!weeklyPlannerStartDate) return "";
    const date = new Date(`${weeklyPlannerStartDate}T00:00:00`);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split("T")[0];
  }

  function handleGenerateDailyPdf() {
    if (!assignment || !topic || !project) { alert("No report data found."); return; }
    generateDailyPdf({ project, assignment, topic, workers, acknowledgements });
  }

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadInitialData() {
      const currentWorker = await loadWorker(user);
      const projectList = await fetchActiveProjects();
      setProjects(projectList);
      await refreshAdminLists(projectList);

      if (projectList.length > 0) {
        const firstId = projectList[0].id;
        setSelectedProjectId(firstId);
        await loadLatestAssignmentForProject(firstId, currentWorker);
      }
    }

    loadInitialData();
  }, [user]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={login}
      />
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
            {worker?.role ? <span style={styles.roleBadge}>{worker.role}</span> : null}
          </p>
        </div>

        <div style={styles.card}>
          <button onClick={logout} style={styles.button}>Logout</button>

          <div style={{ marginTop: 20 }}>
            <label>
              <strong>Select Project</strong>
              <select value={selectedProjectId} onChange={handleProjectChange} style={styles.select}>
                {projects.length > 0 ? (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))
                ) : (
                  <option value="">No active projects found</option>
                )}
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
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
          <WorkerView
            project={project}
            topic={topic}
            language={language}
            checked={checked}
            alreadyAcknowledged={alreadyAcknowledged}
            message={message}
            onLanguageChange={setLanguage}
            onCheckedChange={setChecked}
            onAcknowledge={acknowledge}
          />
        )}

        {view === "dashboard" && isAdmin && (
          <Dashboard
            project={project}
            assignment={assignment}
            topic={topic}
            workers={workers}
            acknowledgements={acknowledgements}
            message={message}
            onGeneratePdf={handleGenerateDailyPdf}
          />
        )}

        {view === "admin" && isAdmin && (
          <AdminTools
            adminTab={adminTab}
            onAdminTabChange={setAdminTab}
            allProjects={allProjects}
            allWorkers={allWorkers}
            allTopics={allTopics}
            allAssignments={allAssignments}
            projects={projects}
            managedProjectWorkers={managedProjectWorkers}
            manageProjectWorkersId={manageProjectWorkersId}
            newProjectName={newProjectName}
            onNewProjectNameChange={setNewProjectName}
            onCreateProject={handleCreateProject}
            onUpdateProjectField={updateProjectField}
            onSaveProject={handleSaveProject}
            newWorkerName={newWorkerName}
            newWorkerEmail={newWorkerEmail}
            newWorkerPhone={newWorkerPhone}
            newWorkerLanguage={newWorkerLanguage}
            newWorkerRole={newWorkerRole}
            onNewWorkerNameChange={setNewWorkerName}
            onNewWorkerEmailChange={setNewWorkerEmail}
            onNewWorkerPhoneChange={setNewWorkerPhone}
            onNewWorkerLanguageChange={setNewWorkerLanguage}
            onNewWorkerRoleChange={setNewWorkerRole}
            onCreateWorker={handleCreateWorker}
            onUpdateWorkerField={updateWorkerField}
            onSaveWorker={handleSaveWorker}
            linkWorkerId={linkWorkerId}
            linkProjectId={linkProjectId}
            onLinkWorkerIdChange={setLinkWorkerId}
            onLinkProjectIdChange={setLinkProjectId}
            onLinkWorker={handleLinkWorker}
            onManageProjectChange={(id) => { setManageProjectWorkersId(id); loadManagedProjectWorkers(id); }}
            onRemoveWorkerFromProject={handleRemoveWorkerFromProject}
            topicSearch={topicSearch}
            selectedTopicId={selectedTopicId}
            showAddTopicForm={showAddTopicForm}
            newTopicTitle={newTopicTitle}
            newTopicEnglish={newTopicEnglish}
            newTopicSpanish={newTopicSpanish}
            newTopicDocumentName={newTopicDocumentName}
            newTopicDocumentUrl={newTopicDocumentUrl}
            newTopicFile={newTopicFile}
            fileInputKey={fileInputKey}
            uploadingDocument={uploadingDocument}
            onTopicSearchChange={setTopicSearch}
            onSelectTopic={setSelectedTopicId}
            onToggleAddForm={() => setShowAddTopicForm((prev) => !prev)}
            onNewTopicTitleChange={setNewTopicTitle}
            onNewTopicEnglishChange={setNewTopicEnglish}
            onNewTopicSpanishChange={setNewTopicSpanish}
            onNewTopicDocumentNameChange={setNewTopicDocumentName}
            onNewTopicDocumentUrlChange={setNewTopicDocumentUrl}
            onNewTopicFileChange={setNewTopicFile}
            onCreateTopic={handleCreateTopic}
            onUpdateTopicField={updateTopicField}
            onSaveTopic={handleSaveTopic}
            assignmentProjectId={assignmentProjectId}
            assignmentTopicId={assignmentTopicId}
            assignmentDate={assignmentDate}
            onAssignmentProjectChange={setAssignmentProjectId}
            onAssignmentTopicChange={setAssignmentTopicId}
            onAssignmentDateChange={setAssignmentDate}
            onCreateAssignment={handleCreateAssignment}
            weeklyPlannerProjectId={weeklyPlannerProjectId}
            weeklyPlannerStartDate={weeklyPlannerStartDate}
            weeklyPlannerTopics={weeklyPlannerTopics}
            onWeeklyPlannerProjectChange={setWeeklyPlannerProjectId}
            onWeeklyPlannerStartDateChange={setWeeklyPlannerStartDate}
            onWeeklyPlannerTopicChange={(day, val) => setWeeklyPlannerTopics((prev) => ({ ...prev, [day]: val }))}
            onCreateWeeklyAssignments={handleCreateWeeklyAssignments}
            weeklyReportProjectId={weeklyReportProjectId}
            weeklyReportStartDate={weeklyReportStartDate}
            weeklyReportEndDate={weeklyReportEndDate}
            onWeeklyReportProjectChange={setWeeklyReportProjectId}
            onWeeklyReportStartDateChange={setWeeklyReportStartDate}
            onWeeklyReportEndDateChange={setWeeklyReportEndDate}
            onGenerateWeeklyReport={handleGenerateWeeklyReport}
            onViewDashboard={viewAssignmentDashboard}
            getWeeklyPlannerDate={getWeeklyPlannerDate}
          />
        )}
      </div>
    </main>
  );
}
