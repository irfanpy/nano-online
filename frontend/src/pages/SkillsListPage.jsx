import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSkill, getSkills } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function SkillsListPage({ token }) {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = async (currentSearch = search) => {
    try {
      const data = await getSkills(token, currentSearch);
      setSkills(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteSkill(token, id);
      setStatus("Skill deleted");
      await load(search);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Skills Catalog</h2>
        <AddActionButton label="Add Skill" onClick={() => navigate("/admin/skills/new")} />
      </div>

      <form className="filter-row" onSubmit={(event) => { event.preventDefault(); load(search); }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skills" />
        <button type="submit">Search</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td>{skill.skill_name}</td>
              <td>{skill.category}</td>
              <td>{skill.description || "-"}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/skills/${skill.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(skill.id)}>
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
