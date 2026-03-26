import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteJobRequest, getJobRequests, getLocations } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function JobRequestsListPage({ token }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({ status: "", location_id: "", job_type: "", search: "" });

  const load = async (nextFilters = filters) => {
    try {
      const [jobData, locationData] = await Promise.all([
        getJobRequests(token, nextFilters),
        getLocations(token)
      ]);
      setJobs(jobData);
      setLocations(locationData);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteJobRequest(token, id);
      setStatus("Job request deleted");
      await load(filters);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Job Requests</h2>
        <AddActionButton label="Add Job Request" onClick={() => navigate("/admin/job-requests/new")} />
      </div>

      <form className="filter-grid" onSubmit={(event) => { event.preventDefault(); load(filters); }}>
        <input value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search description or family" />
        <input value={filters.job_type} onChange={(event) => setFilters((prev) => ({ ...prev, job_type: event.target.value }))} placeholder="Job type" />
        <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filters.location_id} onChange={(event) => setFilters((prev) => ({ ...prev, location_id: event.target.value }))}>
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.area_name}</option>
          ))}
        </select>
        <button type="submit">Apply Filters</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employer</th>
            <th>Category</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.employer_family_name}</td>
              <td>{job.job_category}</td>
              <td>{job.location_name}</td>
              <td>{job.salary_min} - {job.salary_max}</td>
              <td>{job.status}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/job-requests/${job.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(job.id)}>
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
