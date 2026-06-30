"use client";

import { styles } from "../../styles/shared";

export default function ProjectsTab({
  allProjects,
  newProjectName,
  onNewProjectNameChange,
  onCreateProject,
  onUpdateProjectField,
  onSaveProject,
}) {
  return (
    <div style={styles.card}>
      <h3>Manage Projects</h3>
      <p>Add new projects, rename existing projects, and mark projects active or inactive.</p>

      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Add New Project</h4>
        <input
          style={styles.input}
          placeholder="Project name"
          value={newProjectName}
          onChange={(e) => onNewProjectNameChange(e.target.value)}
        />
        <button onClick={onCreateProject} style={styles.primaryButton}>
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
                      onChange={(e) => onUpdateProjectField(projectItem.id, "project_name", e.target.value)}
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.smallSelect}
                      value={projectItem.active ? "true" : "false"}
                      onChange={(e) => onUpdateProjectField(projectItem.id, "active", e.target.value === "true")}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => onSaveProject(projectItem)} style={styles.saveButton}>
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
  );
}
