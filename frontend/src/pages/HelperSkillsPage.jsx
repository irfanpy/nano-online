import { useEffect, useState } from "react";
import { assignHelperSkill, getHelpers, getHelperSkills, getSkills, removeHelperSkill } from "../api.js";

export default function HelperSkillsPage({ token }) {
  const [helpers, setHelpers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [helperId, setHelperId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [status, setStatus] = useState("");

  const load = async (selectedHelperId = helperId) => {
    try {
      const [helperData, skillData] = await Promise.all([getHelpers(token), getSkills(token)]);
      setHelpers(helperData);
      setSkills(skillData);

      const activeHelperId = selectedHelperId || (helperData[0] ? String(helperData[0].id) : "");
      setHelperId(activeHelperId);
      setSkillId((current) => current || (skillData[0] ? String(skillData[0].id) : ""));

      if (activeHelperId) {
        const assignedData = await getHelperSkills(token, activeHelperId);
        setAssigned(assignedData);
      } else {
        setAssigned([]);
      }
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAssign = async (event) => {
    event.preventDefault();
    try {
      await assignHelperSkill(token, Number(helperId), Number(skillId));
      setStatus("Skill assigned");
      await load(helperId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const onRemove = async (id) => {
    try {
      await removeHelperSkill(token, Number(helperId), id);
      setStatus("Skill removed");
      await load(helperId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Helper Skills</h2>
      </div>

      <form className="filter-grid" onSubmit={onAssign}>
        <select value={helperId} onChange={(event) => { setHelperId(event.target.value); load(event.target.value); }}>
          <option value="">Select helper</option>
          {helpers.map((helper) => (
            <option key={helper.id} value={helper.id}>{helper.full_name}</option>
          ))}
        </select>
        <select value={skillId} onChange={(event) => setSkillId(event.target.value)}>
          <option value="">Select skill</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.skill_name}</option>
          ))}
        </select>
        <button type="submit" disabled={!helperId || !skillId}>Assign Skill</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assigned.map((skill) => (
            <tr key={skill.id}>
              <td>{skill.skill_name}</td>
              <td>{skill.category}</td>
              <td>{skill.description || "-"}</td>
              <td className="row-actions">
                <button type="button" className="danger" onClick={() => onRemove(skill.id)}>
                  Remove
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
