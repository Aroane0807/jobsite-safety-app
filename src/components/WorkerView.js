"use client";

import { styles } from "../styles/shared";

export default function WorkerView({
  project,
  topic,
  language,
  checked,
  alreadyAcknowledged,
  message,
  onLanguageChange,
  onCheckedChange,
  onAcknowledge,
}) {
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
      ? alreadyAcknowledged ? "Ya Reconocido" : "Reconocer Tema de Seguridad"
      : alreadyAcknowledged ? "Already Acknowledged" : "Acknowledge Safety Topic";

  return (
    <div style={styles.card}>
      <h2>Today's Safety Topic</h2>

      {project && (
        <p>
          <strong>Project:</strong> {project.project_name}
        </p>
      )}

      <div style={styles.languageRow}>
        {["english", "spanish"].map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            style={{
              ...styles.languageButton,
              background: language === lang ? "#2563eb" : "#ffffff",
              color: language === lang ? "#ffffff" : "#1f2937",
              fontWeight: language === lang ? "bold" : "normal",
            }}
          >
            {lang === "english" ? "English" : "Español"}
          </button>
        ))}
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
                Open Safety Document{topic.document_name ? `: ${topic.document_name}` : ""}
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
                onChange={(e) => onCheckedChange(e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <span>{acknowledgmentText}</span>
            </label>
          </div>

          <button
            onClick={onAcknowledge}
            disabled={alreadyAcknowledged}
            style={alreadyAcknowledged ? styles.disabledButton : styles.primaryButton}
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
        <p style={styles.warning}>{message || "No safety topic assigned."}</p>
      )}
    </div>
  );
}
