import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";
import {
  createHelper,
  getHelper,
  getHelperRoles,
  getLocations,
  updateHelper
} from "../api.js";

export default function HelperFormPage({ token }) {
  const { helperId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(helperId);

  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    role_id: "",
    location_id: "",
    notes: "",
    hourly_rate: "",
    is_active: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [roleData, locationData] = await Promise.all([
          getHelperRoles(token),
          getLocations(token)
        ]);
        setRoles(roleData);
        setLocations(locationData);

        if (!isEdit) {
          setForm((prev) => ({
            ...prev,
            role_id: roleData[0] ? String(roleData[0].id) : "",
            location_id: locationData[0] ? String(locationData[0].id) : ""
          }));
          return;
        }

        const helper = await getHelper(token, helperId);
        setForm({
          full_name: helper.full_name,
          phone: helper.phone,
          address: helper.address,
          role_id: String(helper.role_id),
          location_id: helper.location_id ? String(helper.location_id) : "",
          notes: helper.notes || "",
          hourly_rate: helper.hourly_rate ? String(helper.hourly_rate) : "",
          is_active: helper.is_active
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [helperId, isEdit, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      role_id: Number(form.role_id),
      location_id: form.location_id ? Number(form.location_id) : null,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null
    };

    try {
      if (isEdit) {
        await updateHelper(token, helperId, payload);
      } else {
        await createHelper(token, payload);
      }
      navigate("/admin/helpers");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Helper" : "Add New Helper"}
        subtitle={isEdit ? "Update profile details, role mapping, and activity status for this helper." : "Capture a complete helper profile so they can be matched into placements quickly."}
        onBack={() => navigate("/admin/helpers")}
      />
      <form onSubmit={submit} className="form form-grid">
        <label>
          Full Name
          <input
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            required
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
        </label>
        <label>
          UAE Address
          <input
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            placeholder="Dubai Marina, Dubai"
            required
          />
        </label>
        <label>
          Role
          <select
            value={form.role_id}
            onChange={(event) => setForm((prev) => ({ ...prev, role_id: event.target.value }))}
            required
          >
            <option value="" disabled>Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select
            value={form.location_id}
            onChange={(event) => setForm((prev) => ({ ...prev, location_id: event.target.value }))}
          >
            <option value="">No location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city} — {loc.area_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hourly Rate (AED)
          <input
            type="number"
            min="0"
            value={form.hourly_rate}
            onChange={(event) => setForm((prev) => ({ ...prev, hourly_rate: event.target.value }))}
            placeholder="45"
          />
        </label>
        <label className="full-width">
          Notes
          <textarea
            rows="3"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>
        <label className="checkbox-row full-width">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
          />
          Active
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Helper" updateLabel="Update Helper" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
