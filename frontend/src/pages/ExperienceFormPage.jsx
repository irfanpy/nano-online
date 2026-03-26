import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createExperience, getExperience, getHelpers, updateExperience } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function ExperienceFormPage({ token }) {
  const navigate = useNavigate();
  const { experienceId } = useParams();
  const isEdit = Boolean(experienceId);
  const [helpers, setHelpers] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    helper_id: "",
    employer_name: "",
    role_title: "",
    start_date: "",
    end_date: "",
    responsibilities: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const helperData = await getHelpers(token);
        setHelpers(helperData);

        if (!isEdit) {
          setForm((prev) => ({ ...prev, helper_id: helperData[0] ? String(helperData[0].id) : "" }));
          return;
        }

        const record = await getExperience(token, experienceId);
        setForm({
          helper_id: String(record.helper_id),
          employer_name: record.employer_name,
          role_title: record.role_title,
          start_date: record.start_date,
          end_date: record.end_date || "",
          responsibilities: record.responsibilities || ""
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [experienceId, isEdit, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      helper_id: Number(form.helper_id),
      end_date: form.end_date || null
    };

    try {
      if (isEdit) {
        await updateExperience(token, experienceId, payload);
      } else {
        await createExperience(token, payload);
      }
      navigate("/admin/experience");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Experience" : "Add Experience"}
        subtitle={isEdit ? "Refine work history details that help employers evaluate past performance." : "Record previous household experience to strengthen helper profiles during shortlisting."}
        onBack={() => navigate("/admin/experience")}
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
          Employer Name
          <input value={form.employer_name} onChange={(event) => setForm((prev) => ({ ...prev, employer_name: event.target.value }))} required />
        </label>
        <label>
          Role Title
          <input value={form.role_title} onChange={(event) => setForm((prev) => ({ ...prev, role_title: event.target.value }))} required />
        </label>
        <label>
          Start Date
          <input type="date" value={form.start_date} onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))} required />
        </label>
        <label>
          End Date
          <input type="date" value={form.end_date} onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))} />
        </label>
        <label className="full-width">
          Responsibilities
          <textarea rows="4" value={form.responsibilities} onChange={(event) => setForm((prev) => ({ ...prev, responsibilities: event.target.value }))} />
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Experience" updateLabel="Update Experience" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
