import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSkill, getSkill, updateSkill } from "../api.js";
import FormPageHeader from "../components/FormPageHeader.jsx";
import SubmitActionButton from "../components/SubmitActionButton.jsx";

export default function SkillFormPage({ token }) {
  const navigate = useNavigate();
  const { skillId } = useParams();
  const isEdit = Boolean(skillId);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ skill_name: "", category: "", description: "" });

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const load = async () => {
      try {
        const skill = await getSkill(token, skillId);
        setForm({
          skill_name: skill.skill_name,
          category: skill.category,
          description: skill.description || ""
        });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, [isEdit, skillId, token]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await updateSkill(token, skillId, form);
      } else {
        await createSkill(token, form);
      }
      navigate("/admin/skills");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel form-panel">
      <FormPageHeader
        title={isEdit ? "Edit Skill" : "Add Skill"}
        subtitle={isEdit ? "Refine the skill name or category used in helper capability mapping." : "Add a searchable skill so helper profiles can be filtered and matched more precisely."}
        onBack={() => navigate("/admin/skills")}
      />
      <form className="form" onSubmit={submit}>
        <label>
          Skill Name
          <input value={form.skill_name} onChange={(event) => setForm((prev) => ({ ...prev, skill_name: event.target.value }))} required />
        </label>
        <label>
          Category
          <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} required />
        </label>
        <label>
          Description
          <input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
        </label>
        <div className="actions">
          <SubmitActionButton isEdit={isEdit} createLabel="Create Skill" updateLabel="Update Skill" />
        </div>
      </form>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
