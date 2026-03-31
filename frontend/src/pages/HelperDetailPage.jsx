import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicHelper } from "../api.js";
import { useUserAuth } from "../context/UserAuthContext.jsx";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Rate on request";
  }
  return `AED ${Number(value).toFixed(0)} / hour`;
}

function mapAvailability(helper) {
  if (Array.isArray(helper.availability)) {
    return helper.availability.map((slot) => ({
      label: slot.date || slot.day || slot.day_of_week || "Schedule",
      time: `${slot.start_time || slot.start || ""} - ${slot.end_time || slot.end || ""}`
    }));
  }
  if (Array.isArray(helper.availability_schedules)) {
    return helper.availability_schedules.map((slot) => ({
      label: slot.day_of_week || "Schedule",
      time: `${slot.start_time || ""} - ${slot.end_time || ""}`
    }));
  }
  return [];
}

function normalizeSkill(skill) {
  if (!skill) return "";
  if (typeof skill === "string") return skill;
  if (typeof skill === "number") return String(skill);
  if (typeof skill === "object") {
    return skill.skill_name || skill.name || skill.label || "";
  }
  return "";
}

function normalizeExperience(record) {
  if (!record || typeof record !== "object") return null;
  return {
    title: record.role_title || record.title || "Role",
    employer: record.employer_name || record.company || "",
    period: record.start_date && record.end_date ? `${record.start_date} - ${record.end_date}` : ""
  };
}

function formatLabel(value) {
  if (!value) return "";
  return value
    .toString()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimeRange(start, end) {
  if (!start || !end) return "";
  const toDisplay = (value) => value.toString().slice(0, 5);
  return `${toDisplay(start)} - ${toDisplay(end)}`;
}

export default function HelperDetailPage() {
  const { helperId } = useParams();
  const { isAuthenticated } = useUserAuth();
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHelper = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicHelper(helperId);
        setHelper(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHelper();
  }, [helperId]);

  const skills = useMemo(() => {
    if (!helper) return [];
    if (Array.isArray(helper.skills)) {
      return helper.skills.map(normalizeSkill).filter(Boolean);
    }
    if (Array.isArray(helper.skill_set)) {
      return helper.skill_set.map(normalizeSkill).filter(Boolean);
    }
    return [];
  }, [helper]);

  const experiences = useMemo(() => {
    if (!helper) return [];
    const source = Array.isArray(helper.experience)
      ? helper.experience
      : Array.isArray(helper.experience_records)
      ? helper.experience_records
      : [];
    return source.map(normalizeExperience).filter(Boolean);
  }, [helper]);

  const availability = useMemo(() => (helper ? mapAvailability(helper) : []), [helper]);

  if (loading) {
    return (
      <section className="public-section">
        <div className="public-container">
          <p className="status">Loading helper profile...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="public-section">
        <div className="public-container">
          <p className="status">{error}</p>
        </div>
      </section>
    );
  }

  if (!helper) {
    return null;
  }

  const hourlyRate = helper.hourly_rate || helper.hourlyRate || helper.rate_per_hour || helper.rate;

  return (
    <div className="helper-detail">
      <section className="public-section">
        <div className="public-container helper-detail-header">
          <div>
            <p className="home-kicker">Helper profile</p>
            <h1>{helper.full_name || helper.name || "Helper"}</h1>
            <p className="public-lead">
              {helper.role_name || helper.category || helper.role || "Home helper"}
            </p>
          </div>
          <div className="helper-detail-actions">
            <p className="helper-price">{formatCurrency(hourlyRate)}</p>
            <Link to={`/helpers/${helper.id}/book`} className="button-link primary">
              Book now
            </Link>
            {!isAuthenticated ? (
              <p className="helper-note">Sign in to confirm a booking.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container detail-grid">
          <div className="detail-card">
            <h2>About</h2>
            <p>{helper.notes || helper.description || "Profile details coming soon."}</p>
            <div className="detail-list">
              <div>
                <h4>Location</h4>
                <p>{helper.location_name || helper.location || helper.city || "Dubai"}</p>
              </div>
              <div>
                <h4>Experience</h4>
                <p>{(helper.experience_years ?? experiences.length) || "-"} years</p>
              </div>
              <div>
                <h4>Rating</h4>
                <p>{helper.rating || helper.average_rating || "4.8"}</p>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h2>Skills</h2>
            {skills.length ? (
              <div className="skills-list">
                {skills.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">Skills will be confirmed during screening.</p>
            )}

            {experiences.length ? (
              <div className="experience-list">
                <h3>Recent experience</h3>
                {experiences.map((record, index) => (
                  <div key={`${record.title}-${index}`} className="experience-item">
                    <p className="experience-role">{record.title}</p>
                    <div className="experience-meta">
                      <span>{record.employer}</span>
                      {record.period ? <span>{record.period}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="detail-card">
            <h2>Availability</h2>
            {availability.length ? (
              <ul className="availability-list">
                {availability.map((slot, index) => (
                  <li key={`${slot.label}-${index}`}>
                    <strong>{formatLabel(slot.label)}:</strong> {formatTimeRange(...slot.time.split(" - "))}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Availability will appear once schedules are confirmed.</p>
            )}
            <Link to={`/helpers/${helper.id}/book`} className="button-link">
              Check slots
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
