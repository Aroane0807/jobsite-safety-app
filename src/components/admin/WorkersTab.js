"use client";

import { styles } from "../../styles/shared";

export default function WorkersTab({
  allWorkers,
  projects,
  managedProjectWorkers,
  manageProjectWorkersId,
  newWorkerName,
  newWorkerEmail,
  newWorkerPhone,
  newWorkerLanguage,
  newWorkerRole,
  linkWorkerId,
  linkProjectId,
  onNewWorkerNameChange,
  onNewWorkerEmailChange,
  onNewWorkerPhoneChange,
  onNewWorkerLanguageChange,
  onNewWorkerRoleChange,
  onCreateWorker,
  onUpdateWorkerField,
  onSaveWorker,
  onLinkWorkerIdChange,
  onLinkProjectIdChange,
  onLinkWorker,
  onManageProjectChange,
  onRemoveWorkerFromProject,
}) {
  return (
    <div style={styles.card}>
      <h3>Manage Workers</h3>
      <p>Add workers, edit worker details, and link workers to projects.</p>

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
              onChange={(e) => onNewWorkerNameChange(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              style={styles.input}
              placeholder="Email"
              value={newWorkerEmail}
              onChange={(e) => onNewWorkerEmailChange(e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              style={styles.input}
              placeholder="Phone"
              value={newWorkerPhone}
              onChange={(e) => onNewWorkerPhoneChange(e.target.value)}
            />
          </label>

          <label>
            Language
            <select
              style={styles.select}
              value={newWorkerLanguage}
              onChange={(e) => onNewWorkerLanguageChange(e.target.value)}
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
              onChange={(e) => onNewWorkerRoleChange(e.target.value)}
            >
              <option value="worker">Worker</option>
              <option value="superintendent">Superintendent</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        <button onClick={onCreateWorker} style={styles.primaryButton}>
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
              onChange={(e) => onLinkWorkerIdChange(e.target.value)}
            >
              <option value="">Select worker</option>
              {allWorkers.map((w) => (
                <option key={w.id} value={w.id}>{w.full_name}</option>
              ))}
            </select>
          </label>

          <label>
            Project
            <select
              style={styles.select}
              value={linkProjectId}
              onChange={(e) => onLinkProjectIdChange(e.target.value)}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </label>
        </div>

        <button onClick={onLinkWorker} style={styles.primaryButton}>
          Link Worker
        </button>
      </div>

      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Project Worker Assignments</h4>
        <p style={{ color: "#4b5563" }}>
          Select a project to see which workers are assigned to it. You can remove a worker from a
          project without deleting their worker profile.
        </p>

        <label>
          Project
          <select
            style={styles.select}
            value={manageProjectWorkersId}
            onChange={(e) => onManageProjectChange(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
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
                          onClick={() => onRemoveWorkerFromProject(workerItem.worker_project_link_id)}
                          style={{ ...styles.saveButton, background: "#dc2626" }}
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
            <p style={styles.warning}>No workers are assigned to this project yet.</p>
          )
        ) : (
          <p style={styles.warning}>Select a project to view assigned workers.</p>
        )}
      </div>

      <h4>Existing Workers</h4>

      {allWorkers.length > 0 ? (
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
              {allWorkers.map((workerItem) => (
                <tr key={workerItem.id}>
                  <td style={styles.td}>
                    <input
                      style={styles.smallInput}
                      value={workerItem.full_name || ""}
                      onChange={(e) => onUpdateWorkerField(workerItem.id, "full_name", e.target.value)}
                    />
                  </td>
                  <td style={styles.td}>{workerItem.email || "No email"}</td>
                  <td style={styles.td}>
                    <input
                      style={styles.smallInput}
                      value={workerItem.phone || ""}
                      onChange={(e) => onUpdateWorkerField(workerItem.id, "phone", e.target.value)}
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.smallSelect}
                      value={workerItem.preferred_language || "english"}
                      onChange={(e) => onUpdateWorkerField(workerItem.id, "preferred_language", e.target.value)}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.smallSelect}
                      value={workerItem.role || "worker"}
                      onChange={(e) => onUpdateWorkerField(workerItem.id, "role", e.target.value)}
                    >
                      <option value="worker">Worker</option>
                      <option value="superintendent">Superintendent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => onSaveWorker(workerItem)} style={styles.saveButton}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={styles.warning}>No workers found.</p>
      )}
    </div>
  );
}
