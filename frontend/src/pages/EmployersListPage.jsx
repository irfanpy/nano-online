import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteEmployer, getEmployers } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function EmployersListPage({ token }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, page_size: 10 });
  const [status, setStatus] = useState("");

  const load = async (nextPage = page, nextSearch = search) => {
    try {
      const data = await getEmployers(token, {
        page: nextPage,
        page_size: pageInfo.page_size,
        search: nextSearch
      });
      const allItems = Array.isArray(data) ? data : data.items || [];
      const normalizedSearch = nextSearch.trim().toLowerCase();
      const filteredItems = normalizedSearch
        ? allItems.filter((employer) =>
            [employer.family_name, employer.contact_name, employer.phone]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(normalizedSearch))
          )
        : allItems;
      const startIndex = (nextPage - 1) * pageInfo.page_size;
      const pagedItems = filteredItems.slice(startIndex, startIndex + pageInfo.page_size);

      setItems(pagedItems);
      setPageInfo({ total: filteredItems.length, page_size: pageInfo.page_size });
      setPage(nextPage);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load(1, "");
  }, []);

  const totalPages = Math.max(1, Math.ceil(pageInfo.total / pageInfo.page_size));

  const onDelete = async (id) => {
    try {
      await deleteEmployer(token, id);
      setStatus("Employer deleted");
      await load(page, search);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Employers / Families</h2>
        <AddActionButton label="Add Employer" onClick={() => navigate("/admin/employers/new")} />
      </div>

      <form className="filter-row" onSubmit={(event) => { event.preventDefault(); load(1, search); }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search family, contact or phone" />
        <button type="submit">Search</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Family</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Members</th>
            <th>Budget</th>
            <th>Requests</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((employer) => (
            <tr key={employer.id}>
              <td>{employer.family_name}</td>
              <td>{employer.contact_name}<br />{employer.phone}</td>
              <td>{employer.location_name}</td>
              <td>{employer.number_of_adults} adults / {employer.number_of_children} children</td>
              <td>{employer.budget_min} - {employer.budget_max}</td>
              <td>{employer.total_job_requests}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/employers/${employer.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(employer.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-row">
        <button type="button" className="secondary" disabled={page <= 1} onClick={() => load(page - 1, search)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="secondary" disabled={page >= totalPages} onClick={() => load(page + 1, search)}>
          Next
        </button>
      </div>

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
