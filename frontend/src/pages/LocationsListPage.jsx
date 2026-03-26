import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteLocation, getLocations } from "../api.js";
import AddActionButton from "../components/AddActionButton.jsx";

export default function LocationsListPage({ token }) {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = async (currentSearch = search) => {
    try {
      const data = await getLocations(token, currentSearch);
      setLocations(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    await load(search);
  };

  const onDelete = async (id) => {
    try {
      await deleteLocation(token, id);
      setStatus("Location deleted");
      await load(search);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Locations</h2>
        <AddActionButton label="Add Location" onClick={() => navigate("/admin/locations/new")} />
      </div>

      <form className="filter-row" onSubmit={handleSearch}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by area name" />
        <button type="submit">Search</button>
      </form>

      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Area</th>
            <th>Zone</th>
            <th>City</th>
            <th>Coordinates</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>{location.id}</td>
              <td>{location.area_name}</td>
              <td>{location.zone}</td>
              <td>{location.city}</td>
              <td>
                {location.latitude && location.longitude
                  ? `${location.latitude}, ${location.longitude}`
                  : "-"}
              </td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => navigate(`/admin/locations/${location.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(location.id)}>
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
