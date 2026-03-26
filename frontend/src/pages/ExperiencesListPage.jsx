import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteExperience, getHelpers, getHelperExperiences } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function ExperiencesListPage({ token }) {
  const navigate = useNavigate();
  const [helpers, setHelpers] = useState([]);
  const [records, setRecords] = useState([]);
  const [helperId, setHelperId] = useState("");
  const [status, setStatus] = useState("");

  const load = async (selectedHelperId = helperId) => {
    try {
      const helperData = await getHelpers(token);
      setHelpers(helperData);
      const activeHelperId = selectedHelperId || (helperData[0] ? String(helperData[0].id) : "");
      setHelperId(activeHelperId);
      if (activeHelperId) {
        const experienceData = await getHelperExperiences(token, activeHelperId);
        setRecords(experienceData);
      } else {
        setRecords([]);
      }
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteExperience(token, id);
      setStatus("Experience deleted");
      await load(helperId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Experience Records</h2>
        <AddActionButton label="Add Experience" onClick={() => navigate("/admin/experience/new")} />
      </div>

      <form className="filter-row" onSubmit={(event) => { event.preventDefault(); load(helperId); }}>
        <select value={helperId} onChange={(event) => setHelperId(event.target.value)}>
          <option value="">Select helper</option>
          {helpers.map((helper) => (
            <option key={helper.id} value={helper.id}>{helper.full_name}</option>
          ))}
        </select>
        <button type="submit">Load</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Helper</th>
            <th>Employer</th>
            <th>Role</th>
            <th>Dates</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.helper_name}</td>
              <td>{record.employer_name}</td>
              <td>{record.role_title}</td>
              <td>{record.start_date} - {record.end_date || "Present"}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/experience/${record.id}/edit`)}>
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
