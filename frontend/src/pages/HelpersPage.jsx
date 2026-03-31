import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPublicHelpers } from "../api.js";
import Pagination from "../components/Pagination.jsx";

const CATEGORY_OPTIONS = ["Babysitter", "Nanny", "Cooking", "Cleaning", "Driver", "Elderly Care"];
const SORT_OPTIONS = [
  { label: "Best match", value: "match" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Availability", value: "availability" }
];

const RATINGS = [
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4.0" },
  { label: "3.5+", value: "3.5" }
];

const PAGE_SIZE = 9;

function getRate(helper) {
  return Number(helper.hourly_rate || helper.hourlyRate || helper.rate_per_hour || helper.rate || 0);
}

function getRating(helper) {
  return Number(helper.rating || helper.average_rating || helper.review_score || 0);
}

function normalizeHelpersResponse(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  if (data?.items) {
    return {
      items: data.items,
      total: data.total ?? data.items.length,
      page: data.page,
      pageSize: data.page_size
    };
  }
  if (data?.results) {
    return {
      items: data.results,
      total: data.total ?? data.count ?? data.results.length,
      page: data.page,
      pageSize: data.page_size
    };
  }
  return { items: [], total: 0 };
}

export default function HelpersPage() {
  const location = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    rating: "",
    minPrice: "",
    maxPrice: "",
    date: "",
    sort: "match"
  });
  const [helpers, setHelpers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    setFilters((current) => (current.category === category ? current : { ...current, category }));
  }, [location.search]);

  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.location, filters.rating, filters.minPrice, filters.maxPrice, filters.date, filters.sort, filters.search]);

  useEffect(() => {
    const fetchHelpers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicHelpers({
          category: filters.category,
          location: filters.location,
          date: filters.date,
          search: filters.search,
          page,
          page_size: PAGE_SIZE
        });
        const normalized = normalizeHelpersResponse(data);
        setHelpers(normalized.items);
        setTotal(normalized.total ?? normalized.items.length);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpers();
  }, [filters.category, filters.location, filters.date, filters.search, page]);

  const filteredHelpers = useMemo(() => {
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Number.POSITIVE_INFINITY;
    const minRating = Number(filters.rating) || 0;

    const match = helpers.filter((helper) => {
      const rate = getRate(helper);
      const rating = getRating(helper);
      return rate >= min && rate <= max && rating >= minRating;
    });

    const sorted = [...match];
    switch (filters.sort) {
      case "price_asc":
        sorted.sort((a, b) => getRate(a) - getRate(b));
        break;
      case "price_desc":
        sorted.sort((a, b) => getRate(b) - getRate(a));
        break;
      case "rating":
        sorted.sort((a, b) => getRating(b) - getRating(a));
        break;
      case "availability":
        sorted.sort((a, b) => Number(b.is_available ?? b.is_active) - Number(a.is_available ?? a.is_active));
        break;
      default:
        break;
    }
    return sorted;
  }, [helpers, filters.minPrice, filters.maxPrice, filters.rating, filters.sort]);

  const pagedHelpers = useMemo(() => {
    if (total > helpers.length) {
      return filteredHelpers;
    }
    const start = (page - 1) * PAGE_SIZE;
    return filteredHelpers.slice(start, start + PAGE_SIZE);
  }, [filteredHelpers, helpers.length, page, total]);

  const totalPages = Math.max(1, Math.ceil((total || filteredHelpers.length) / PAGE_SIZE));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="helpers-page">
      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Helpers</p>
            <h1>Find the right helper for your household</h1>
          </div>
          <p className="public-lead">
            Browse verified helpers, review availability, and book the best match in minutes.
          </p>

          <div className="filter-panel">
            <div className="filter-grid">
              <label>
                Search
                <input
                  type="text"
                  value={filters.search}
                  onChange={updateFilter("search")}
                  placeholder="Search by name or skill"
                />
              </label>

              <label>
                Category
                <select value={filters.category} onChange={updateFilter("category")}>
                  <option value="">All categories</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={filters.location}
                  onChange={updateFilter("location")}
                  placeholder="Dubai Marina"
                />
              </label>

              <label>
                Rating
                <select value={filters.rating} onChange={updateFilter("rating")}>
                  <option value="">All ratings</option>
                  {RATINGS.map((rating) => (
                    <option key={rating.value} value={rating.value}>
                      {rating.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Min price
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={updateFilter("minPrice")}
                  placeholder="AED 25"
                  min="0"
                />
              </label>

              <label>
                Max price
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={updateFilter("maxPrice")}
                  placeholder="AED 80"
                  min="0"
                />
              </label>

              <label>
                Date
                <input type="date" value={filters.date} onChange={updateFilter("date")} />
              </label>

              <label>
                Sort by
                <select value={filters.sort} onChange={updateFilter("sort")}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          {loading ? <p className="status">Loading helpers...</p> : null}
          {error ? <p className="status">{error}</p> : null}
          {!loading && !error && pagedHelpers.length === 0 ? (
            <p className="empty-state">No helpers match your filters yet.</p>
          ) : null}

          <div className="table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Hourly Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedHelpers.map((helper) => (
                  <tr key={helper.id}>
                    <td>{helper.full_name || helper.name || "Helper"}</td>
                    <td>{helper.role_name || helper.category || helper.role || "-"}</td>
                    <td>{helper.location_name || helper.location || helper.city || "Dubai"}</td>
                    <td>{getRate(helper) ? `AED ${getRate(helper)}` : "-"}</td>
                    <td>{helper.is_available ?? helper.is_active ? "Available" : "Limited"}</td>
                    <td className="row-actions">
                      <Link to={`/helpers/${helper.id}`} className="button-link">
                        View
                      </Link>
                      <Link to={`/helpers/${helper.id}/book`} className="button-link primary">
                        Hire
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}
