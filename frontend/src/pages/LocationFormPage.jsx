import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createLocation, getLocation, updateLocation } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function LocationFormPage({ token }) {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const isEdit = Boolean(locationId);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    area_name: "",
    zone: "",
    city: "Dubai",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const load = async () => {
      try {
        const location = await getLocation(token, locationId);
        setForm({
          area_name: location.area_name,
          zone: location.zone,
          city: location.city,
          latitude: location.latitude ?? "",
          longitude: location.longitude ?? ""
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [isEdit, locationId, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude)
    };

    try {
      if (isEdit) {
        await updateLocation(token, locationId, payload);
      } else {
        await createLocation(token, payload);
      }
      navigate("/admin/locations");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Location" : "Add Location"}
        subtitle={isEdit ? "Refine the area details used across helpers, employers, and job requests." : "Create a location record so address-based forms and filters stay consistent."}
        onBack={() => navigate("/admin/locations")}
      />
      <form className="form form-grid" onSubmit={submit}>
        <label>
          Area Name
          <input value={form.area_name} onChange={(event) => setForm((prev) => ({ ...prev, area_name: event.target.value }))} required />
        </label>
        <label>
          Zone
          <input value={form.zone} onChange={(event) => setForm((prev) => ({ ...prev, zone: event.target.value }))} required />
        </label>
        <label>
          City
          <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} required />
        </label>
        <label>
          Latitude
          <input value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))} />
        </label>
        <label>
          Longitude
          <input value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))} />
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Location" updateLabel="Update Location" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
