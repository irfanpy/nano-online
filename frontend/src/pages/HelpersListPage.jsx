import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteHelper, getHelpers } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function HelpersListPage({ token }) {
  const [helpers, setHelpers] = useState([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getHelpers(token);
      setHelpers(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteHelper(token, id);
      setStatus("Helper deleted");
      await load();
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Helpers</h2>
        <AddActionButton label="Add New Helper" onClick={() => navigate("/admin/helpers/new")} />
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Hourly Rate</th>
            <th>Phone</th>
            <th>Address (UAE)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {helpers.map((helper) => (
            <tr key={helper.id}>
              <td>{helper.id}</td>
              <td>{helper.full_name}</td>
              <td>{helper.role_name}</td>
              <td>{helper.hourly_rate ? `AED ${helper.hourly_rate}` : "-"}</td>
              <td>{helper.phone}</td>
              <td>{helper.address}</td>
              <td>{helper.is_active ? "Active" : "Inactive"}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/helpers/${helper.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(helper.id)}>
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
