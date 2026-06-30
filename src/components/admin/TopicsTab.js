"use client";

import { styles } from "../../styles/shared";

export default function TopicsTab({
  allTopics,
  topicSearch,
  selectedTopicId,
  showAddTopicForm,
  newTopicTitle,
  newTopicEnglish,
  newTopicSpanish,
  newTopicDocumentName,
  newTopicDocumentUrl,
  newTopicFile,
  fileInputKey,
  uploadingDocument,
  onTopicSearchChange,
  onSelectTopic,
  onToggleAddForm,
  onNewTopicTitleChange,
  onNewTopicEnglishChange,
  onNewTopicSpanishChange,
  onNewTopicDocumentNameChange,
  onNewTopicDocumentUrlChange,
  onNewTopicFileChange,
  onCreateTopic,
  onUpdateTopicField,
  onSaveTopic,
}) {
  const filteredTopics = allTopics.filter((t) => {
    const search = topicSearch.toLowerCase();
    return (
      t.title?.toLowerCase().includes(search) ||
      t.english_content?.toLowerCase().includes(search) ||
      t.spanish_content?.toLowerCase().includes(search)
    );
  });

  const selectedTopicForEdit = allTopics.find((t) => t.id === selectedTopicId);

  return (
    <div style={styles.card}>
      <h3>Manage Safety Topics</h3>
      <p>Add new topics, search existing topics, and edit one topic at a time.</p>

      <button onClick={onToggleAddForm} style={styles.primaryButton}>
        {showAddTopicForm ? "Hide Add Topic Form" : "+ Add New Topic"}
      </button>

      {showAddTopicForm && (
        <div style={styles.card}>
          <h4 style={{ marginTop: 0 }}>Add New Safety Topic</h4>

          <input
            style={styles.input}
            placeholder="Topic title"
            value={newTopicTitle}
            onChange={(e) => onNewTopicTitleChange(e.target.value)}
          />

          <textarea
            style={styles.textarea}
            placeholder="English content"
            value={newTopicEnglish}
            onChange={(e) => onNewTopicEnglishChange(e.target.value)}
          />

          <textarea
            style={styles.textarea}
            placeholder="Spanish content"
            value={newTopicSpanish}
            onChange={(e) => onNewTopicSpanishChange(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Document name, example: Ladder Safety PDF"
            value={newTopicDocumentName}
            onChange={(e) => onNewTopicDocumentNameChange(e.target.value)}
          />

          <input
            key={fileInputKey}
            style={styles.input}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => onNewTopicFileChange(e.target.files?.[0] || null)}
          />

          {newTopicFile && (
            <p>Selected file: <strong>{newTopicFile.name}</strong></p>
          )}

          <input
            style={styles.input}
            placeholder="Optional document URL if not uploading a file"
            value={newTopicDocumentUrl}
            onChange={(e) => onNewTopicDocumentUrlChange(e.target.value)}
          />

          <button
            onClick={onCreateTopic}
            style={uploadingDocument ? styles.disabledButton : styles.primaryButton}
            disabled={uploadingDocument}
          >
            {uploadingDocument ? "Uploading..." : "Create Safety Topic"}
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Existing Safety Topics</h4>

        <input
          style={styles.input}
          placeholder="Search safety topics..."
          value={topicSearch}
          onChange={(e) => onTopicSearchChange(e.target.value)}
        />

        {filteredTopics.length > 0 ? (
          <div style={styles.compactList}>
            {filteredTopics.map((topicItem) => (
              <div key={topicItem.id} style={styles.compactListItem}>
                <div>
                  <strong>{topicItem.title}</strong>
                  {topicItem.document_url && (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>Document attached</div>
                  )}
                </div>
                <button onClick={() => onSelectTopic(topicItem.id)} style={styles.saveButton}>
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
          <h4 style={{ marginTop: 0 }}>Edit Topic: {selectedTopicForEdit.title}</h4>

          <label>
            Topic Title
            <input
              style={styles.input}
              value={selectedTopicForEdit.title || ""}
              onChange={(e) => onUpdateTopicField(selectedTopicForEdit.id, "title", e.target.value)}
            />
          </label>

          <label>
            English Content
            <textarea
              style={styles.textarea}
              value={selectedTopicForEdit.english_content || ""}
              onChange={(e) => onUpdateTopicField(selectedTopicForEdit.id, "english_content", e.target.value)}
            />
          </label>

          <label>
            Spanish Content
            <textarea
              style={styles.textarea}
              value={selectedTopicForEdit.spanish_content || ""}
              onChange={(e) => onUpdateTopicField(selectedTopicForEdit.id, "spanish_content", e.target.value)}
            />
          </label>

          <label>
            Document Name
            <input
              style={styles.input}
              value={selectedTopicForEdit.document_name || ""}
              placeholder="Document name"
              onChange={(e) => onUpdateTopicField(selectedTopicForEdit.id, "document_name", e.target.value)}
            />
          </label>

          <label>
            Document URL
            <input
              style={styles.input}
              value={selectedTopicForEdit.document_url || ""}
              placeholder="Document URL"
              onChange={(e) => onUpdateTopicField(selectedTopicForEdit.id, "document_url", e.target.value)}
            />
          </label>

          {selectedTopicForEdit.document_url && (
            <p>
              <a href={selectedTopicForEdit.document_url} target="_blank" rel="noopener noreferrer">
                Open current document
              </a>
            </p>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => onSaveTopic(selectedTopicForEdit)} style={styles.saveButton}>
              Save Safety Topic
            </button>
            <button onClick={() => onSelectTopic("")} style={styles.button}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
