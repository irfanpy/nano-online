import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAvailability, getAvailability, getHelpers } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function AvailabilityListPage({ token }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [helperId, setHelperId] = useState("");
  const [status, setStatus] = useState("");

  const load = async (selectedHelper = helperId) => {
    try {
      const [availabilityData, helperData] = await Promise.all([
        getAvailability(token, selectedHelper),
        getHelpers(token)
      ]);
      setRecords(availabilityData);
      setHelpers(helperData);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteAvailability(token, id);
      setStatus("Availability deleted");
      await load(helperId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const helperName = (id) => helpers.find((helper) => helper.id === id)?.full_name || "-";

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Availability Schedules</h2>
        <AddActionButton label="Add Schedule" onClick={() => navigate("/admin/availability/new")} />
      </div>

      <form className="filter-row" onSubmit={(event) => { event.preventDefault(); load(helperId); }}>
        <select value={helperId} onChange={(event) => setHelperId(event.target.value)}>
          <option value="">All helpers</option>
          {helpers.map((helper) => (
            <option key={helper.id} value={helper.id}>{helper.full_name}</option>
          ))}
        </select>
        <button type="submit">Filter</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Helper</th>
            <th>Day</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{helperName(record.helper_id)}</td>
              <td>{record.day_of_week}</td>
              <td>{record.start_time} - {record.end_time}</td>
              <td>{record.availability_status}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/availability/${record.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(record.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
