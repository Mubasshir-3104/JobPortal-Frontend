import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { SKILL_OPTIONS, skillToneClass } from "./skills";

const EXPERIENCE_PRESETS = [
  { value: 0, label: "Fresher" },
  { value: 1, label: "1+ yr" },
  { value: 2, label: "2+ yrs" },
  { value: 3, label: "3+ yrs" },
  { value: 5, label: "5+ yrs" },
  { value: 8, label: "8+ yrs" },
];

const FloatingField = ({ id, label, required, error, as: Tag = "input", ...rest }) => (
  <div className={`field${error ? " field--error" : ""}`}>
    <Tag
      id={id}
      className="field__control"
      placeholder=" "
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
    <label htmlFor={id} className="field__label">
      {label}
      {required && <span className="field__req">*</span>}
    </label>
    {error && (
      <p id={`${id}-error`} className="field__error" role="alert">
        {error}
      </p>
    )}
  </div>
);

/**
 * Presentational form shared by Create and Edit. It owns UI-only state
 * (validation visibility, the skill being typed) while the parent owns the
 * payload and the network call.
 *
 * Payload keys are unchanged: postId, postProfile, reqExperience,
 * postTechStack, postDesc.
 */
const JobForm = ({
  mode,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  loading = false,
  error = "",
}) => {
  const isEdit = mode === "edit";
  const [attempted, setAttempted] = useState(false);
  const [draft, setDraft] = useState("");

  const skills = Array.isArray(values.postTechStack) ? values.postTechStack : [];
  const exp = values.reqExperience;

  const errors = {
    postProfile: String(values.postProfile ?? "").trim() ? "" : "Please enter a job title.",
    postDesc: String(values.postDesc ?? "").trim() ? "" : "Please describe the role.",
    reqExperience:
      exp === "" || exp == null || Number.isNaN(Number(exp)) || Number(exp) < 0
        ? "Enter 0 or more years."
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (key) => (attempted ? errors[key] : "");

  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  // Merge a comma / Enter separated string into the skill list (case-insensitive de-dupe).
  const mergeSkills = (raw) => {
    const next = [...skills];
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => {
        if (!next.some((x) => x.toLowerCase() === s.toLowerCase())) next.push(s);
      });
    return next;
  };

  const commitDraft = () => {
    if (!draft.trim()) return;
    onChange({ ...values, postTechStack: mergeSkills(draft) });
    setDraft("");
  };

  const addSkill = (skill) =>
    onChange({ ...values, postTechStack: mergeSkills(skill) });

  const removeSkill = (skill) =>
    onChange({ ...values, postTechStack: skills.filter((s) => s !== skill) });

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && skills.length) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const suggestions = SKILL_OPTIONS.filter(
    (s) =>
      !skills.some((x) => x.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(draft.trim().toLowerCase())
  ).slice(0, 8);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (hasErrors) return;
    // Include a half-typed skill so nothing is lost on submit.
    onSubmit({ ...values, postTechStack: mergeSkills(draft) });
    setDraft("");
  };

  return (
    <main className="page page--narrow">
      <button type="button" className="back-link" onClick={onCancel}>
        <ArrowBackIcon fontSize="small" /> Back to jobs
      </button>

      <section className="form-card" aria-busy={loading}>
        <header className="form-card__header">
          <h1>{isEdit ? "Edit job posting" : "Post a new job"}</h1>
          <p>
            {isEdit
              ? "Update the details below and save your changes."
              : "Fill in the details to publish a role to the job board."}
          </p>
        </header>

        {loading ? (
          <div className="form-skeleton" aria-label="Loading job details">
            <div className="skeleton skeleton--input" />
            <div className="skeleton skeleton--input" />
            <div className="skeleton skeleton--textarea" />
            <div className="skeleton skeleton--input" />
            <div className="skeleton skeleton--input" />
          </div>
        ) : (
          <form autoComplete="off" noValidate onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert--error" role="alert">
                <ErrorOutlineIcon fontSize="small" />
                <span>{error}</span>
              </div>
            )}

            {/* ---------- Role details ---------- */}
            <fieldset className="form-section">
              <legend>
                <span className="form-section__step">1</span> Role details
              </legend>

              <div className="form-row">
                <div className="form-row__sm">
                  <FloatingField
                    id="postId"
                    label="Post ID"
                    type="number"
                    min="0"
                    value={values.postId ?? ""}
                    onChange={set("postId")}
                  />
                </div>
                <div className="form-row__grow">
                  <FloatingField
                    id="postProfile"
                    label="Job title / profile"
                    required
                    type="text"
                    value={values.postProfile ?? ""}
                    onChange={set("postProfile")}
                    error={show("postProfile")}
                  />
                </div>
              </div>

              <FloatingField
                id="postDesc"
                as="textarea"
                label="Job description"
                required
                rows={5}
                value={values.postDesc ?? ""}
                onChange={set("postDesc")}
                error={show("postDesc")}
              />
            </fieldset>

            {/* ---------- Experience ---------- */}
            <fieldset className="form-section">
              <legend>
                <span className="form-section__step">2</span> Experience
              </legend>

              <FloatingField
                id="reqExperience"
                label="Years of experience required"
                required
                type="number"
                min="0"
                value={exp ?? ""}
                onChange={set("reqExperience")}
                error={show("reqExperience")}
              />

              <div className="chip-row" role="group" aria-label="Experience presets">
                {EXPERIENCE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className="chip"
                    aria-pressed={exp !== "" && Number(exp) === p.value}
                    onClick={() => onChange({ ...values, reqExperience: p.value })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* ---------- Skills ---------- */}
            <fieldset className="form-section">
              <legend>
                <span className="form-section__step">3</span> Skills
              </legend>

              <label htmlFor="skillDraft" className="form-section__label">
                Tech stack
              </label>
              <div
                className="skill-input"
                onClick={() => document.getElementById("skillDraft")?.focus()}
              >
                {skills.map((skill) => (
                  <span key={skill} className={skillToneClass(skill)}>
                    {skill}
                    <button
                      type="button"
                      className="skill__remove"
                      aria-label={`Remove ${skill}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(skill);
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
                <input
                  id="skillDraft"
                  className="skill-input__field"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={
                    skills.length ? "Add another…" : "Type a skill and press Enter"
                  }
                  aria-describedby="skillHint"
                />
              </div>
              <p id="skillHint" className="form-hint">
                Press <kbd>Enter</kbd> or <kbd>,</kbd> to add · <kbd>Backspace</kbd> removes the last.
              </p>

              {suggestions.length > 0 && (
                <div className="chip-row" role="group" aria-label="Suggested skills">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip"
                      onClick={() => addSkill(s)}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            {/* ---------- Actions ---------- */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary btn--lg"
                onClick={onCancel}
                disabled={submitting}
              >
                {isEdit ? "Cancel" : "Back"}
              </button>
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={submitting}
              >
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting
                  ? isEdit
                    ? "Saving…"
                    : "Publishing…"
                  : isEdit
                  ? "Save Changes"
                  : "Publish Job"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default JobForm;
