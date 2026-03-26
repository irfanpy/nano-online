import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEmployer, getEmployer, getLocations, updateEmployer } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function EmployerFormPage({ token }) {
  const navigate = useNavigate();
  const { employerId } = useParams();
  const isEdit = Boolean(employerId);
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    family_name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    location_id: "",
    number_of_adults: 2,
    number_of_children: 0,
    children_ages: "",
    preferred_helper_type: "",
    language_preference: "",
    working_hours: "",
    budget_min: 0,
    budget_max: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const locationData = await getLocations(token);
        setLocations(locationData);

        if (!isEdit) {
          setForm((prev) => ({
            ...prev,
            location_id: locationData[0] ? String(locationData[0].id) : ""
          }));
          return;
        }

        const employer = await getEmployer(token, employerId);
        setForm({
          family_name: employer.family_name,
          contact_name: employer.contact_name,
          phone: employer.phone,
          email: employer.email,
          address: employer.address,
          location_id: String(employer.location_id),
          number_of_adults: employer.number_of_adults,
          number_of_children: employer.number_of_children,
          children_ages: employer.children_ages || "",
          preferred_helper_type: employer.preferred_helper_type,
          language_preference: employer.language_preference,
          working_hours: employer.working_hours,
          budget_min: employer.budget_min,
          budget_max: employer.budget_max
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [employerId, isEdit, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      location_id: Number(form.location_id),
      number_of_adults: Number(form.number_of_adults),
      number_of_children: Number(form.number_of_children),
      budget_min: Number(form.budget_min),
      budget_max: Number(form.budget_max)
    };

    try {
      if (isEdit) {
        await updateEmployer(token, employerId, payload);
      } else {
        await createEmployer(token, payload);
      }
      navigate("/admin/employers");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Employer" : "Add Employer"}
        subtitle={isEdit ? "Adjust family preferences, household details, and budget information." : "Add a new employer profile with household needs, location, and budget range."}
        onBack={() => navigate("/admin/employers")}
      />
      <form className="form form-grid" onSubmit={submit}>
        <label>
          Family Name
          <input value={form.family_name} onChange={(event) => setForm((prev) => ({ ...prev, family_name: event.target.value }))} required />
        </label>
        <label>
          Contact Name
          <input value={form.contact_name} onChange={(event) => setForm((prev) => ({ ...prev, contact_name: event.target.value }))} required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} required />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
        </label>
        <label>
          Address
          <input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} required />
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
          Adults
          <input type="number" value={form.number_of_adults} onChange={(event) => setForm((prev) => ({ ...prev, number_of_adults: event.target.value }))} required />
        </label>
        <label>
          Children
          <input type="number" value={form.number_of_children} onChange={(event) => setForm((prev) => ({ ...prev, number_of_children: event.target.value }))} required />
        </label>
        <label>
          Children Ages
          <input value={form.children_ages} onChange={(event) => setForm((prev) => ({ ...prev, children_ages: event.target.value }))} />
        </label>
        <label>
          Preferred Helper Type
          <input value={form.preferred_helper_type} onChange={(event) => setForm((prev) => ({ ...prev, preferred_helper_type: event.target.value }))} required />
        </label>
        <label>
          Language Preference
          <input value={form.language_preference} onChange={(event) => setForm((prev) => ({ ...prev, language_preference: event.target.value }))} required />
        </label>
        <label>
          Working Hours
          <input value={form.working_hours} onChange={(event) => setForm((prev) => ({ ...prev, working_hours: event.target.value }))} required />
        </label>
        <label>
          Budget Min
          <input type="number" value={form.budget_min} onChange={(event) => setForm((prev) => ({ ...prev, budget_min: event.target.value }))} required />
        </label>
        <label>
          Budget Max
          <input type="number" value={form.budget_max} onChange={(event) => setForm((prev) => ({ ...prev, budget_max: event.target.value }))} required />
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Employer" updateLabel="Update Employer" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
