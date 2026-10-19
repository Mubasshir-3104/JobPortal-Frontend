import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddIcon from "@mui/icons-material/Add";
import { formatExperience, skillToneClass } from "./skills";

const API_BASE = "http://localhost:8080";
const MAX_VISIBLE_SKILLS = 5;
const SKELETON_COUNT = 6;

// Client-side experience buckets layered on top of the keyword search.
const EXPERIENCE_FILTERS = [
  { id: "all", label: "Any experience", test: () => true },
  { id: "entry", label: "0–2 yrs", test: (y) => y <= 2 },
  { id: "mid", label: "3–5 yrs", test: (y) => y >= 3 && y <= 5 },
  { id: "senior", label: "6+ yrs", test: (y) => y >= 6 },
];

const JobCardSkeleton = () => (
  <div className="job-card job-card--skeleton" aria-hidden="true">
    <div className="job-card__header">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--pill" />
    </div>
    <div className="skeleton skeleton--line" />
    <div className="skeleton skeleton--line" />
    <div className="skeleton skeleton--line skeleton--short" />
    <div className="job-card__skills">
      <div className="skeleton skeleton--chip" />
      <div className="skeleton skeleton--chip" />
      <div className="skeleton skeleton--chip" />
    </div>
  </div>
);

const JobCard = ({ job, onEdit, onDelete }) => {
  const skills = Array.isArray(job.postTechStack) ? job.postTechStack : [];
  const visible = skills.slice(0, MAX_VISIBLE_SKILLS);
  const hidden = skills.length - visible.length;

  return (
    <article className="job-card">
      <header className="job-card__header">
        <h2 className="job-card__title">{job.postProfile}</h2>
        <span className="badge-exp">{formatExperience(job.reqExperience)}</span>
      </header>

      <p className="job-card__desc">{job.postDesc}</p>

      <div className="job-card__skills" aria-label="Tech stack">
        {visible.length > 0 ? (
          <>
            {visible.map((skill) => (
              <span key={skill} className={skillToneClass(skill)}>
                {skill}
              </span>
            ))}
            {hidden > 0 && <span className="skill skill--more">+{hidden}</span>}
          </>
        ) : (
          <span className="job-card__no-skills">No skills listed</span>
        )}
      </div>

      <footer className="job-card__footer">
        <div className="job-card__actions" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className="icon-btn icon-btn--edit"
            onClick={() => onEdit(job.postId)}
            aria-label={`Edit ${job.postProfile}`}
            title="Edit posting"
          >
            <EditOutlinedIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--delete"
            onClick={() => onDelete(job)}
            aria-label={`Delete ${job.postProfile}`}
            title="Delete posting"
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      </footer>
    </article>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [post, setPost] = useState([]);
  // Unfiltered list — used to derive the quick-filter skill chips so they
  // don't vanish while a search is active.
  const [skillPool, setSkillPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [experience, setExperience] = useState("all");
  const [activeSkill, setActiveSkill] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch: full list when the search box is empty, keyword search (debounced) otherwise.
  useEffect(() => {
    const keyword = query.trim();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const url = keyword
          ? `${API_BASE}/jobPost/keyword/${encodeURIComponent(keyword)}`
          : `${API_BASE}/jobPosts`;
        const response = await axios.get(url);
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setPost(list);
        if (!keyword) setSkillPool(list);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        if (err.response && err.response.status === 404) {
          setPost([]); // "no matches" – not a failure
        } else {
          setPost([]);
          setError("We couldn't load jobs. Check that the server is running and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(load, keyword ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, reloadKey]);

  const topSkills = useMemo(() => {
    const counts = new Map();
    skillPool.forEach((job) =>
      (Array.isArray(job.postTechStack) ? job.postTechStack : []).forEach((s) => {
        const key = s.toLowerCase();
        const entry = counts.get(key) || { label: s, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      })
    );
    return [...counts.values()]
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 8)
      .map((e) => e.label);
  }, [skillPool]);

  const visiblePosts = useMemo(() => {
    const bucket = EXPERIENCE_FILTERS.find((f) => f.id === experience);
    return post.filter((job) => {
      const years = Number(job.reqExperience) || 0;
      const skills = Array.isArray(job.postTechStack) ? job.postTechStack : [];
      const skillOk =
        !activeSkill || skills.some((s) => s.toLowerCase() === activeSkill.toLowerCase());
      return bucket.test(years) && skillOk;
    });
  }, [post, experience, activeSkill]);

  const hasActiveFilters = Boolean(query.trim() || activeSkill || experience !== "all");

  const clearFilters = () => {
    setQuery("");
    setActiveSkill("");
    setExperience("all");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.postId;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/deleteJob/${id}`);
      setPost((prev) => prev.filter((job) => job.postId !== id));
      setSkillPool((prev) => prev.filter((job) => job.postId !== id));
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      setError("We couldn't delete that job. Please try again.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Close the confirm dialog with Escape.
  useEffect(() => {
    if (!pendingDelete) return undefined;
    const onKey = (e) => e.key === "Escape" && !deleting && setPendingDelete(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingDelete, deleting]);

  const handleEdit = (id) => {
    navigate("/edit", { state: { id } });
  };

  const resultsLabel = loading
    ? "Loading roles…"
    : `${visiblePosts.length} role${visiblePosts.length === 1 ? "" : "s"} found`;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow">Open positions</p>
          <h1 className="hero__title">Find your next great role</h1>
          <p className="hero__subtitle">
            Search by title, skill or keyword and filter by the experience you bring.
          </p>

          <div className="searchbar" role="search">
            <SearchIcon className="searchbar__icon" />
            <input
              type="search"
              className="searchbar__input"
              placeholder="Search by title, skill, or keyword…"
              aria-label="Search jobs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="searchbar__clear"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <CloseIcon fontSize="small" />
              </button>
            )}
          </div>

          <div className="filters">
            <div className="chip-row" role="group" aria-label="Filter by experience">
              {EXPERIENCE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="chip"
                  aria-pressed={experience === f.id}
                  onClick={() => setExperience(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {topSkills.length > 0 && (
              <div className="chip-row" role="group" aria-label="Filter by skill">
                {topSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="chip"
                    aria-pressed={activeSkill === skill}
                    onClick={() => setActiveSkill((cur) => (cur === skill ? "" : skill))}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Results ---------- */}
      <main className="page">
        <div className="results-bar">
          <p className="results-bar__count" aria-live="polite">
            {resultsLabel}
          </p>
          {hasActiveFilters && (
            <button type="button" className="btn btn--ghost" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <ErrorOutlineIcon fontSize="small" />
            <span>{error}</span>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="job-grid" aria-busy="true">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          !error && (
            <div className="empty-state">
              <div className="empty-state__icon">
                {hasActiveFilters ? <SearchOffIcon /> : <WorkOutlineIcon />}
              </div>
              <h2>{hasActiveFilters ? "No roles match your search" : "No jobs posted yet"}</h2>
              <p>
                {hasActiveFilters
                  ? "Try a different keyword, loosen the filters, or post a new job."
                  : "Be the first to publish a role on the board."}
              </p>
              <div className="empty-state__actions">
                {hasActiveFilters && (
                  <button type="button" className="btn btn--secondary" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                <Link to="/create" className="btn btn--primary">
                  <AddIcon /> Post a Job
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="job-grid">
            {visiblePosts.map((p) => (
              <JobCard
                key={p.postId}
                job={p}
                onEdit={handleEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ---------- Delete confirmation ---------- */}
      {pendingDelete && (
        <div
          className="modal-backdrop"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__icon">
              <DeleteOutlineIcon />
            </div>
            <h2 id="delete-title">Delete this job?</h2>
            <p id="delete-desc">
              “{pendingDelete.postProfile}” will be permanently removed. This can’t be undone.
            </p>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Search;