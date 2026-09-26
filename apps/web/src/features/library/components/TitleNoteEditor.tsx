"use client";

import type { MediaNote } from "@watchnotes/shared";
import { useEffect, useState } from "react";
import { deleteTitleNote, saveTitleNote } from "../api/library.api";
import styles from "./TitleDetail.module.css";

type TitleNoteEditorProps = {
  mediaId: string;
  initialNote: MediaNote | null;
  canEdit: boolean;
};

export function TitleNoteEditor({
  mediaId,
  initialNote,
  canEdit,
}: TitleNoteEditorProps) {
  const [note, setNote] = useState<MediaNote | null>(initialNote);
  const [body, setBody] = useState(initialNote?.body ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setNote(initialNote);
    setBody(initialNote?.body ?? "");
  }, [initialNote]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await saveTitleNote(mediaId, body);
      setNote(response.note);
      setBody(response.note.body);
      setMessage("Note saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save note.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    setMessage(null);

    try {
      await deleteTitleNote(mediaId);
      setNote(null);
      setBody("");
      setMessage("Note removed.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to remove note.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className={styles.noteCard}>
      <div className={styles.sectionHeading}>
        <div>
          <p className="page-kicker">Personal note</p>
          <h2>Your take</h2>
        </div>
        {note ? (
          <small>
            Updated {new Date(note.updatedAt).toLocaleDateString()}
          </small>
        ) : null}
      </div>

      {canEdit ? (
        <>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
            rows={7}
            placeholder="What stuck with you? Favorite scene, performance, feeling, or anything you want to remember."
          />
          <div className={styles.noteFooter}>
            <small>{body.length}/2000</small>
            <div className={styles.noteActions}>
              {note ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={isSaving}
                  onClick={() => void handleDelete()}
                >
                  Remove
                </button>
              ) : null}
              <button
                type="button"
                disabled={isSaving || body.trim().length === 0}
                onClick={() => void handleSave()}
              >
                {isSaving ? "Saving..." : "Save note"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className={styles.muted}>
          Mark this title watched before adding a personal note.
        </p>
      )}

      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}
