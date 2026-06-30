"use client";

import { styles } from "../../styles/shared";

export default function AssignmentsTab({
  allAssignments,
  allTopics,
  allProjects,
  projects,
  assignmentProjectId,
  assignmentTopicId,
  assignmentDate,
  weeklyPlannerProjectId,
  weeklyPlannerStartDate,
  weeklyPlannerTopics,
  weeklyReportProjectId,
  weeklyReportStartDate,
  weeklyReportEndDate,
  onAssignmentProjectChange,
  onAssignmentTopicChange,
  onAssignmentDateChange,
  onCreateAssignment,
  onWeeklyPlannerProjectChange,
  onWeeklyPlannerStartDateChange,
  onWeeklyPlannerTopicChange,
  onCreateWeeklyAssignments,
  onWeeklyReportProjectChange,
  onWeeklyReportStartDateChange,
  onWeeklyReportEndDateChange,
  onGenerateWeeklyReport,
  onViewDashboard,
  getWeeklyPlannerDate,
}) {
  return (
    <div style={styles.card}>
      <h3>Manage Assignments</h3>
      <p>Assign safety topics to projects and review previous assignments.</p>

      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Create New Assignment</h4>

        <label>
          Project
          <select
            style={styles.select}
            value={assignmentProjectId}
            onChange={(e) => onAssignmentProjectChange(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
        </label>

        <label>
          Safety Topic
          <select
            style={styles.select}
            value={assignmentTopicId}
            onChange={(e) => onAssignmentTopicChange(e.target.value)}
          >
            <option value="">Select topic</option>
            {allTopics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            style={styles.input}
            type="date"
            value={assignmentDate}
            onChange={(e) => onAssignmentDateChange(e.target.value)}
          />
        </label>

        <button onClick={onCreateAssignment} style={styles.primaryButton}>
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
                {allAssignments.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.assigned_date}</td>
                    <td style={styles.td}>{item.project_name || "No project"}</td>
                    <td style={styles.td}>{item.topic_title || "No topic"}</td>
                    <td style={styles.td}>
                      <button onClick={() => onViewDashboard(item)} style={styles.saveButton}>
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

      <div style={styles.card}>
        <div style={styles.card}>
          <h4 style={{ marginTop: 0 }}>Weekly Assignment Planner</h4>
          <p style={{ color: "#4b5563" }}>
            Plan Monday through Friday safety topics for one project at once. Existing duplicate
            assignments will be skipped.
          </p>

          <label>
            Project
            <select
              style={styles.select}
              value={weeklyPlannerProjectId}
              onChange={(e) => onWeeklyPlannerProjectChange(e.target.value)}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </label>

          <label>
            Monday Date
            <input
              style={styles.input}
              type="date"
              value={weeklyPlannerStartDate}
              onChange={(e) => onWeeklyPlannerStartDateChange(e.target.value)}
            />
          </label>

          {[
            { key: "monday", label: "Monday", offset: 0 },
            { key: "tuesday", label: "Tuesday", offset: 1 },
            { key: "wednesday", label: "Wednesday", offset: 2 },
            { key: "thursday", label: "Thursday", offset: 3 },
            { key: "friday", label: "Friday", offset: 4 },
          ].map((day) => (
            <label key={day.key}>
              {day.label}{weeklyPlannerStartDate ? ` - ${getWeeklyPlannerDate(day.offset)}` : ""}
              <select
                style={styles.select}
                value={weeklyPlannerTopics[day.key]}
                onChange={(e) => onWeeklyPlannerTopicChange(day.key, e.target.value)}
              >
                <option value="">No topic selected</option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </label>
          ))}

          <button onClick={onCreateWeeklyAssignments} style={styles.primaryButton}>
            Create Weekly Assignments
          </button>
        </div>

        <h4 style={{ marginTop: 0 }}>Weekly Report</h4>
        <p style={{ color: "#4b5563" }}>
          Generate one report for all safety assignments on a project during a date range.
        </p>

        <label>
          Project
          <select
            style={styles.select}
            value={weeklyReportProjectId}
            onChange={(e) => onWeeklyReportProjectChange(e.target.value)}
          >
            <option value="">Select project</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
        </label>

        <label>
          Start Date
          <input
            style={styles.input}
            type="date"
            value={weeklyReportStartDate}
            onChange={(e) => onWeeklyReportStartDateChange(e.target.value)}
          />
        </label>

        <label>
          End Date
          <input
            style={styles.input}
            type="date"
            value={weeklyReportEndDate}
            onChange={(e) => onWeeklyReportEndDateChange(e.target.value)}
          />
        </label>

        <button onClick={onGenerateWeeklyReport} style={styles.reportButton}>
          Generate Weekly Report
        </button>
      </div>
    </div>
  );
}
