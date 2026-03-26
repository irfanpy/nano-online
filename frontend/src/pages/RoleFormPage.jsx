import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createHelperRole, getHelperRole, updateHelperRole } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function RoleFormPage({ token }) {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(roleId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const load = async () => {
      try {
        const role = await getHelperRole(token, roleId);
        setName(role.name);
        setDescription(role.description || "");
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [isEdit, roleId, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = { name, description };

    try {
      if (isEdit) {
        await updateHelperRole(token, roleId, payload);
      } else {
        await createHelperRole(token, payload);
      }
      navigate("/admin/roles");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Role" : "Add New Role"}
        subtitle={isEdit ? "Keep naming and role descriptions aligned across helper records." : "Define a helper role so sourcing and placement categories stay standardized."}
        onBack={() => navigate("/admin/roles")}
      />
      <form onSubmit={submit} className="form">
        <label>
          Role Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Description
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="actions">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Role" updateLabel="Update Role" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
