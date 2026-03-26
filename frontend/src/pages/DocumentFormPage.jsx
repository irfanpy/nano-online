import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDocument, getDocument, getHelpers, updateDocument } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function DocumentFormPage({ token }) {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const isEdit = Boolean(documentId);
  const [helpers, setHelpers] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    helper_id: "",
    document_type: "passport",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    document_status: "active",
    notes: ""
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

        const record = await getDocument(token, documentId);
        setForm({
          helper_id: String(record.helper_id),
          document_type: record.document_type,
          document_number: record.document_number,
          issue_date: record.issue_date || "",
          expiry_date: record.expiry_date || "",
          document_status: record.document_status,
          notes: record.notes || ""
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [documentId, isEdit, token]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      helper_id: Number(form.helper_id),
      issue_date: form.issue_date || null,
      expiry_date: form.expiry_date || null
    };

    try {
      if (isEdit) {
        await updateDocument(token, documentId, payload);
      } else {
        await createDocument(token, payload);
      }
      navigate("/admin/documents");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Document" : "Add Document"}
        subtitle={isEdit ? "Update compliance status, dates, or notes for this helper document." : "Add a document record so expiry tracking and compliance checks remain visible."}
        onBack={() => navigate("/admin/documents")}
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
          Document Type
          <input value={form.document_type} onChange={(event) => setForm((prev) => ({ ...prev, document_type: event.target.value }))} required />
        </label>
        <label>
          Document Number
          <input value={form.document_number} onChange={(event) => setForm((prev) => ({ ...prev, document_number: event.target.value }))} required />
        </label>
        <label>
          Issue Date
          <input type="date" value={form.issue_date} onChange={(event) => setForm((prev) => ({ ...prev, issue_date: event.target.value }))} />
        </label>
        <label>
          Expiry Date
          <input type="date" value={form.expiry_date} onChange={(event) => setForm((prev) => ({ ...prev, expiry_date: event.target.value }))} />
        </label>
        <label>
          Status
          <select value={form.document_status} onChange={(event) => setForm((prev) => ({ ...prev, document_status: event.target.value }))} required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="full-width">
          Notes
          <textarea rows="4" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
        </label>
        <div className="actions full-width">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Document" updateLabel="Update Document" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
