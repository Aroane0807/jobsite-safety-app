"use client";

import { styles } from "../../styles/shared";
import ProjectsTab from "./ProjectsTab";
import WorkersTab from "./WorkersTab";
import TopicsTab from "./TopicsTab";
import AssignmentsTab from "./AssignmentsTab";

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "workers", label: "Workers" },
  { key: "topics", label: "Safety Topics" },
  { key: "assignments", label: "Assignments" },
];

export default function AdminTools({ adminTab, onAdminTabChange, ...props }) {
  return (
    <div style={styles.card}>
      <h2>Admin Tools</h2>
      <p>Use these organized sections to manage projects, workers, safety topics, and assignments.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onAdminTabChange(tab.key)}
            style={{
              ...styles.adminTabButton,
              background: adminTab === tab.key ? "#2563eb" : "#ffffff",
              color: adminTab === tab.key ? "#ffffff" : "#1f2937",
              fontWeight: adminTab === tab.key ? "bold" : "normal",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {adminTab === "projects" && <ProjectsTab {...props} />}
      {adminTab === "workers" && <WorkersTab {...props} />}
      {adminTab === "topics" && <TopicsTab {...props} />}
      {adminTab === "assignments" && <AssignmentsTab {...props} />}
    </div>
  );
}
