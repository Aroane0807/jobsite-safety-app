import { escapeHtml, formatDateTime } from "./utils";

export function generateDailyPdf({ project, assignment, topic, workers, acknowledgements }) {
  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    alert("Popup blocked. Please allow popups for this site and try again.");
    return;
  }

  const signedCount = workers.filter((w) =>
    acknowledgements.some((ack) => ack.worker_id === w.id)
  ).length;
  const totalWorkerCount = workers.length;
  const pendingCount = totalWorkerCount - signedCount;

  const reportRows = workers
    .map((workerItem) => {
      const workerAck = acknowledgements.find((ack) => ack.worker_id === workerItem.id);
      const isSigned = Boolean(workerAck);
      return `
        <tr>
          <td>${escapeHtml(workerItem.full_name)}</td>
          <td>${escapeHtml(workerItem.email || "No email")}</td>
          <td class="${isSigned ? "signed" : "pending"}">${isSigned ? "Signed" : "Pending"}</td>
          <td>${escapeHtml(formatDateTime(workerAck?.acknowledged_at || workerAck?.Acknowledged_at))}</td>
        </tr>
      `;
    })
    .join("");

  const documentSection = topic.document_url
    ? `<p><strong>Document:</strong> <a href="${escapeHtml(topic.document_url)}" target="_blank">${escapeHtml(topic.document_name || topic.document_url)}</a></p>`
    : "";

  const generatedAt = new Date().toLocaleString();

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Jobsite Safety Sign-Off Report</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 40px; }
          h1 { margin-bottom: 5px; }
          h2 { margin-top: 30px; border-bottom: 2px solid #111827; padding-bottom: 6px; }
          .muted { color: #6b7280; font-size: 14px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
          .summary-box { border: 1px solid #d1d5db; border-radius: 8px; padding: 14px; background: #f9fafb; }
          .summary-number { font-size: 28px; font-weight: bold; margin: 0; }
          .summary-label { margin: 4px 0 0 0; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { text-align: left; border-bottom: 2px solid #111827; padding: 10px; background: #f3f4f6; }
          td { border-bottom: 1px solid #d1d5db; padding: 10px; }
          .signed { color: #166534; font-weight: bold; }
          .pending { color: #991b1b; font-weight: bold; }
          .footer { margin-top: 35px; font-size: 12px; color: #6b7280; }
          @media print { button { display: none; } body { margin: 24px; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 16px; margin-bottom: 20px;">Print / Save as PDF</button>
        <h1>Jobsite Safety Sign-Off Report</h1>
        <p class="muted">Generated: ${escapeHtml(generatedAt)}</p>
        <h2>Assignment Details</h2>
        <p><strong>Project:</strong> ${escapeHtml(project.project_name)}</p>
        <p><strong>Safety Topic:</strong> ${escapeHtml(topic.title)}</p>
        <p><strong>Assigned Date:</strong> ${escapeHtml(assignment.assigned_date)}</p>
        ${documentSection}
        <h2>Summary</h2>
        <div class="summary">
          <div class="summary-box"><p class="summary-number">${totalWorkerCount}</p><p class="summary-label">Project Workers</p></div>
          <div class="summary-box"><p class="summary-number">${signedCount}</p><p class="summary-label">Signed</p></div>
          <div class="summary-box"><p class="summary-number">${pendingCount}</p><p class="summary-label">Pending</p></div>
        </div>
        <h2>Worker Sign-Off Status</h2>
        <table>
          <thead><tr><th>Worker</th><th>Email</th><th>Status</th><th>Time Acknowledged</th></tr></thead>
          <tbody>${reportRows}</tbody>
        </table>
        <p class="footer">This report was generated from the Jobsite Safety app.</p>
        <script>setTimeout(() => { window.print(); }, 500);</script>
      </body>
    </html>
  `);

  reportWindow.document.close();
}

export function generateWeeklyPdf({ project, startDate, endDate, assignments, topics, acknowledgements, projectWorkers }) {
  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    alert("Popup blocked. Please allow popups for this site and try again.");
    return;
  }

  const topicMap = new Map((topics || []).map((item) => [item.id, item]));
  const ackList = acknowledgements || [];

  const summaryRows = assignments
    .map((assignmentItem) => {
      const topicItem = topicMap.get(assignmentItem.topic_id);
      const signedCount = projectWorkers.filter((w) =>
        ackList.some((ack) => ack.assignment_id === assignmentItem.id && ack.worker_id === w.id)
      ).length;
      const pendingCount = projectWorkers.length - signedCount;
      const documentLink = topicItem?.document_url
        ? `<a href="${escapeHtml(topicItem.document_url)}" target="_blank">${escapeHtml(topicItem.document_name || "Open document")}</a>`
        : "No document";

      return `
        <tr>
          <td>${escapeHtml(assignmentItem.assigned_date)}</td>
          <td>${escapeHtml(topicItem?.title || "No topic")}</td>
          <td>${documentLink}</td>
          <td>${projectWorkers.length}</td>
          <td class="signed">${signedCount}</td>
          <td class="pending">${pendingCount}</td>
        </tr>
      `;
    })
    .join("");

  const detailRows = assignments
    .map((assignmentItem) => {
      const topicItem = topicMap.get(assignmentItem.topic_id);
      return projectWorkers
        .map((workerItem) => {
          const workerAck = ackList.find(
            (ack) => ack.assignment_id === assignmentItem.id && ack.worker_id === workerItem.id
          );
          const isSigned = Boolean(workerAck);
          return `
            <tr>
              <td>${escapeHtml(assignmentItem.assigned_date)}</td>
              <td>${escapeHtml(topicItem?.title || "No topic")}</td>
              <td>${escapeHtml(workerItem.full_name)}</td>
              <td>${escapeHtml(workerItem.email || "No email")}</td>
              <td class="${isSigned ? "signed" : "pending"}">${isSigned ? "Signed" : "Pending"}</td>
              <td>${escapeHtml(formatDateTime(workerAck?.acknowledged_at || workerAck?.Acknowledged_at))}</td>
            </tr>
          `;
        })
        .join("");
    })
    .join("");

  const generatedAt = new Date().toLocaleString();

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Weekly Jobsite Safety Report</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 40px; }
          h1 { margin-bottom: 5px; }
          h2 { margin-top: 30px; border-bottom: 2px solid #111827; padding-bottom: 6px; }
          .muted { color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0 25px 0; }
          th { text-align: left; border-bottom: 2px solid #111827; padding: 10px; background: #f3f4f6; }
          td { border-bottom: 1px solid #d1d5db; padding: 10px; vertical-align: top; }
          .signed { color: #166534; font-weight: bold; }
          .pending { color: #991b1b; font-weight: bold; }
          .footer { margin-top: 35px; font-size: 12px; color: #6b7280; }
          @media print { button { display: none; } body { margin: 24px; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 16px; margin-bottom: 20px;">Print / Save as PDF</button>
        <h1>Weekly Jobsite Safety Report</h1>
        <p class="muted">Generated: ${escapeHtml(generatedAt)}</p>
        <h2>Report Details</h2>
        <p><strong>Project:</strong> ${escapeHtml(project?.project_name || "")}</p>
        <p><strong>Date Range:</strong> ${escapeHtml(startDate)} through ${escapeHtml(endDate)}</p>
        <h2>Weekly Assignment Summary</h2>
        <table>
          <thead><tr><th>Date</th><th>Safety Topic</th><th>Document</th><th>Workers</th><th>Signed</th><th>Pending</th></tr></thead>
          <tbody>${summaryRows}</tbody>
        </table>
        <h2>Detailed Worker Sign-Off Status</h2>
        <table>
          <thead><tr><th>Date</th><th>Safety Topic</th><th>Worker</th><th>Email</th><th>Status</th><th>Time Acknowledged</th></tr></thead>
          <tbody>${detailRows}</tbody>
        </table>
        <p class="footer">This weekly report was generated from the Jobsite Safety app.</p>
        <script>setTimeout(() => { window.print(); }, 500);</script>
      </body>
    </html>
  `);

  reportWindow.document.close();
}
