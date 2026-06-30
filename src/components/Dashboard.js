"use client";

import { styles } from "../styles/shared";
import { formatDateTime } from "../lib/utils";

export default function Dashboard({
  project,
  assignment,
  topic,
  workers,
  acknowledgements,
  message,
  onGeneratePdf,
}) {
  const signedCount = workers.filter((w) =>
    acknowledgements.some((ack) => ack.worker_id === w.id)
  ).length;
  const totalWorkerCount = workers.length;
  const pendingCount = totalWorkerCount - signedCount;

  function getAcknowledgementForWorker(workerId) {
    return acknowledgements.find((ack) => ack.worker_id === workerId);
  }

  return (
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
                <a href={topic.document_url} target="_blank" rel="noopener noreferrer">
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

            <button onClick={onGeneratePdf} style={styles.reportButton}>
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
                    const workerAck = getAcknowledgementForWorker(workerItem.id);
                    const isSigned = Boolean(workerAck);
                    return (
                      <tr key={workerItem.id}>
                        <td style={styles.td}>{workerItem.full_name}</td>
                        <td style={styles.td}>{workerItem.email || "No email"}</td>
                        <td style={styles.td}>
                          <span style={isSigned ? styles.signedBadge : styles.pendingBadge}>
                            {isSigned ? "Signed" : "Pending"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {formatDateTime(workerAck?.acknowledged_at || workerAck?.Acknowledged_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.warning}>
              No workers are assigned to this project yet. Add workers to this project under Admin Tools.
            </p>
          )}
        </>
      ) : (
        <p style={styles.warning}>{message || "No assignment found for this project."}</p>
      )}
    </div>
  );
}
