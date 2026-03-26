import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteHelperRole, getHelperRoles } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function RolesListPage({ token }) {
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getHelperRoles(token);
      setRoles(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteHelperRole(token, id);
      setStatus("Role deleted");
      await load();
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Helper Roles</h2>
        <AddActionButton label="Add New Role" onClick={() => navigate("/admin/roles/new")} />
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>{role.description || "-"}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/roles/${role.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(role.id)}>
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
