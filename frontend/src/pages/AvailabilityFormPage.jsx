import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAvailability, getAvailability, getHelpers, updateAvailability } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function AvailabilityFormPage({ token }) {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const isEdit = Boolean(scheduleId);
  const [helpers, setHelpers] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    helper_id: "",
    day_of_week: "monday",
    start_time: "09:00:00",
    end_time: "17:00:00",
    availability_status: "available"
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

        const records = await getAvailability(token);
        const record = records.find((item) => String(item.id) === String(scheduleId));
        if (!record) {
          throw new Error("Availability schedule not found");
        }
        setForm({
          helper_id: String(record.helper_id),
          day_of_week: record.day_of_week,
          start_time: record.start_time,
          end_time: record.end_time,
          availability_status: record.availability_status
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [isEdit, scheduleId, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, helper_id: Number(form.helper_id) };
    try {
      if (isEdit) {
        await updateAvailability(token, scheduleId, payload);
      } else {
        await createAvailability(token, payload);
      }
      navigate("/admin/availability");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Availability" : "Add Availability"}
        subtitle={isEdit ? "Adjust the schedule window to keep assignment planning accurate." : "Create an availability block so helper scheduling and matching stay conflict-free."}
        onBack={() => navigate("/admin/availability")}
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
          Day of Week
          <select value={form.day_of_week} onChange={(event) => setForm((prev) => ({ ...prev, day_of_week: event.target.value }))} required>
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>
        <label>
          Start Time
          <input type="time" value={form.start_time} onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))} required />
        </label>
        <label>
          End Time
          <input type="time" value={form.end_time} onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))} required />
        </label>
        <label>
          Status
          <select value={form.availability_status} onChange={(event) => setForm((prev) => ({ ...prev, availability_status: event.target.value }))} required>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="busy">Busy</option>
          </select>
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Availability" updateLabel="Update Availability" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
