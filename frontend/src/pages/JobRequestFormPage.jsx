import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";
import {
  createJobRequest,
  getEmployer,
  getEmployers,
  getJobRequest,
  getLocations,
  updateJobRequest
} from "../api.js";

export default function JobRequestFormPage({ token }) {
  const navigate = useNavigate();
  const { jobRequestId } = useParams();
  const isEdit = Boolean(jobRequestId);
  const [employers, setEmployers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    employer_id: "",
    location_id: "",
    job_category: "",
    description: "",
    required_skills: "",
    salary_min: 0,
    salary_max: 0,
    working_hours: "",
    live_in: false,
    start_date: "",
    status: "draft"
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [employerData, locationData] = await Promise.all([
          getEmployers(token, { page: 1, page_size: 100 }),
          getLocations(token)
        ]);
          setEmployers(employerData);
        setLocations(locationData);

        if (!isEdit) {
          setForm((prev) => ({
            ...prev,
              employer_id: employerData[0] ? String(employerData[0].id) : "",
            location_id: locationData[0] ? String(locationData[0].id) : ""
          }));
          return;
        }

        const jobRequest = await getJobRequest(token, jobRequestId);
        setForm({
          employer_id: String(jobRequest.employer_id),
          location_id: String(jobRequest.location_id),
          job_category: jobRequest.job_category,
          description: jobRequest.description,
          required_skills: jobRequest.required_skills || "",
          salary_min: jobRequest.salary_min,
          salary_max: jobRequest.salary_max,
          working_hours: jobRequest.working_hours,
          live_in: jobRequest.live_in,
          start_date: jobRequest.start_date,
          status: jobRequest.status
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [isEdit, jobRequestId, token]);

  useEffect(() => {
    if (!form.employer_id || locations.length === 0 || isEdit) {
      return;
    }

    const syncLocation = async () => {
      try {
        const employer = await getEmployer(token, form.employer_id);
        setForm((prev) => ({ ...prev, location_id: String(employer.location_id) }));
      } catch {
        // Ignore background sync failures here.
      }
    };

    syncLocation();
  }, [form.employer_id, isEdit, locations, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      employer_id: Number(form.employer_id),
      location_id: Number(form.location_id),
      salary_min: Number(form.salary_min),
      salary_max: Number(form.salary_max)
    };

    try {
      if (isEdit) {
        await updateJobRequest(token, jobRequestId, payload);
      } else {
        await createJobRequest(token, payload);
      }
      navigate("/admin/job-requests");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Job Request" : "Add Job Request"}
        subtitle={isEdit ? "Update demand details, salary range, and timeline for this request." : "Capture a new hiring request with role needs, salary band, and start timing."}
        onBack={() => navigate("/admin/job-requests")}
      />
      <form className="form form-grid" onSubmit={submit}>
        <label>
          Employer
          <select value={form.employer_id} onChange={(event) => setForm((prev) => ({ ...prev, employer_id: event.target.value }))} required>
            <option value="" disabled>Select employer</option>
            {employers.map((employer) => (
              <option key={employer.id} value={employer.id}>{employer.family_name}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select value={form.location_id} onChange={(event) => setForm((prev) => ({ ...prev, location_id: event.target.value }))} required>
            <option value="" disabled>Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.area_name}</option>
            ))}
          </select>
        </label>
        <label>
          Job Category
          <input value={form.job_category} onChange={(event) => setForm((prev) => ({ ...prev, job_category: event.target.value }))} required />
        </label>
        <label>
          Working Hours
          <input value={form.working_hours} onChange={(event) => setForm((prev) => ({ ...prev, working_hours: event.target.value }))} required />
        </label>
        <label className="full-width">
          Description
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows="4" required />
        </label>
        <label className="full-width">
          Required Skills
          <input value={form.required_skills} onChange={(event) => setForm((prev) => ({ ...prev, required_skills: event.target.value }))} />
        </label>
        <label>
          Salary Min
          <input type="number" value={form.salary_min} onChange={(event) => setForm((prev) => ({ ...prev, salary_min: event.target.value }))} required />
        </label>
        <label>
          Salary Max
          <input type="number" value={form.salary_max} onChange={(event) => setForm((prev) => ({ ...prev, salary_max: event.target.value }))} required />
        </label>
        <label>
          Start Date
          <input type="date" value={form.start_date} onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))} required />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} required>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="checkbox-row full-width">
          <input type="checkbox" checked={form.live_in} onChange={(event) => setForm((prev) => ({ ...prev, live_in: event.target.checked }))} />
          Live In
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Job Request" updateLabel="Update Job Request" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
