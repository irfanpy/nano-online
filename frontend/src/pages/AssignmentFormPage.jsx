import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";
import {
  createAssignment,
  getAssignment,
  getHelpers,
  getJobRequests,
  updateAssignment
} from "../api.js";

export default function AssignmentFormPage({ token }) {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const isEdit = Boolean(assignmentId);
  const [helpers, setHelpers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    helper_id: "",
    job_request_id: "",
    start_date: "",
    end_date: "",
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [helperData, jobData] = await Promise.all([
          getHelpers(token),
          getJobRequests(token)
        ]);
        setHelpers(helperData);
        setJobs(jobData);

        if (!isEdit) {
          setForm((prev) => ({
            ...prev,
            helper_id: helperData[0] ? String(helperData[0].id) : "",
            job_request_id: jobData[0] ? String(jobData[0].id) : ""
          }));
          return;
        }

        const assignment = await getAssignment(token, assignmentId);
        setForm({
          helper_id: String(assignment.helper_id),
          job_request_id: String(assignment.job_request_id),
          start_date: assignment.start_date,
          end_date: assignment.end_date || "",
          status: assignment.status,
          notes: assignment.notes || ""
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [assignmentId, isEdit, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      helper_id: Number(form.helper_id),
      job_request_id: Number(form.job_request_id),
      end_date: form.end_date || null
    };

    try {
      if (isEdit) {
        await updateAssignment(token, assignmentId, payload);
      } else {
        await createAssignment(token, payload);
      }
      navigate("/admin/assignments");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Assignment" : "Add Assignment"}
        subtitle={isEdit ? "Adjust assignment timing, status, or notes for the current placement." : "Create a helper assignment by linking a candidate to an active family request."}
        onBack={() => navigate("/admin/assignments")}
      />
      <form className="form form-grid" onSubmit={submit}>
        <label>
          Helper
          <select value={form.helper_id} onChange={(event) => setForm((prev) => ({ ...prev, helper_id: event.target.value }))} required>
            <option value="" disabled>Select helper</option>
            {helpers.map((helper) => (
              <option key={helper.id} value={helper.id}>{helper.full_name}</option>
            ))}
          </select>
        </label>
        <label>
          Job Request
          <select value={form.job_request_id} onChange={(event) => setForm((prev) => ({ ...prev, job_request_id: event.target.value }))} required>
            <option value="" disabled>Select job request</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.employer_family_name} - {job.job_category}</option>
            ))}
          </select>
        </label>
        <label>
          Start Date
          <input type="date" value={form.start_date} onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))} required />
        </label>
        <label>
          End Date
          <input type="date" value={form.end_date} onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))} />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} required>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="full-width">
          Notes
          <input value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Assignment" updateLabel="Update Assignment" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
