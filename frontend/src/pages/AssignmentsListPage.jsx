import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssignment, getAssignments, getEmployers, getHelpers } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function AssignmentsListPage({ token }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [filters, setFilters] = useState({ helper_id: "", employer_id: "" });
  const [status, setStatus] = useState("");

  const load = async (nextFilters = filters) => {
    try {
      const [assignmentData, helperData, employerData] = await Promise.all([
        getAssignments(token, nextFilters),
        getHelpers(token),
        getEmployers(token, { page: 1, page_size: 100 })
      ]);
      setItems(assignmentData);
      setHelpers(helperData);
      setEmployers(Array.isArray(employerData) ? employerData : employerData.items || []);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteAssignment(token, id);
      setStatus("Assignment deleted");
      await load(filters);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Helper Assignments</h2>
        <AddActionButton label="Add Assignment" onClick={() => navigate("/admin/assignments/new")} />
      </div>

      <form className="filter-grid" onSubmit={(event) => { event.preventDefault(); load(filters); }}>
        <select value={filters.helper_id} onChange={(event) => setFilters((prev) => ({ ...prev, helper_id: event.target.value }))}>
          <option value="">All helpers</option>
          {helpers.map((helper) => (
            <option key={helper.id} value={helper.id}>{helper.full_name}</option>
          ))}
        </select>
        <select value={filters.employer_id} onChange={(event) => setFilters((prev) => ({ ...prev, employer_id: event.target.value }))}>
          <option value="">All employers</option>
          {employers.map((employer) => (
            <option key={employer.id} value={employer.id}>{employer.family_name}</option>
          ))}
        </select>
        <button type="submit">Apply Filters</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Helper</th>
            <th>Employer</th>
            <th>Status</th>
            <th>Start</th>
            <th>End</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.helper_name}</td>
              <td>{item.employer_family_name}</td>
              <td>{item.status}</td>
              <td>{item.start_date}</td>
              <td>{item.end_date || "-"}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/assignments/${item.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(item.id)}>
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
