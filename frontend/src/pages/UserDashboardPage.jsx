import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserBookings } from "../api.js";
import { useUserAuth } from "../context/UserAuthContext.jsx";

function normalizeBookingsResponse(data) {
  if (Array.isArray(data)) return data;
  if (data?.items) return data.items;
  if (data?.results) return data.results;
  return [];
}

function toDateTime(booking) {
  if (!booking?.date) return new Date();
  const time = booking.start_time || "00:00";
  return new Date(`${booking.date}T${time}`);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatTimeRange(start, end) {
  if (!start || !end) return "-";
  const toDisplay = (value) => value.slice(0, 5);
  return `${toDisplay(start)} - ${toDisplay(end)}`;
}

export default function UserDashboardPage() {
  const { token, user } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserBookings(token);
        setBookings(normalizeBookingsResponse(data));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingBookings = [];
    const pastBookings = [];
    bookings.forEach((booking) => {
      const bookingDate = toDateTime(booking);
      if (booking.status === "cancelled") {
        pastBookings.push(booking);
      } else if (bookingDate >= now) {
        upcomingBookings.push(booking);
      } else {
        pastBookings.push(booking);
      }
    });
    return { upcoming: upcomingBookings, past: pastBookings };
  }, [bookings]);

  return (
    <div className="dashboard-page">
      <section className="public-section">
        <div className="public-container">
          <p className="home-kicker">Dashboard</p>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="public-lead">Track your upcoming bookings and manage schedules.</p>

          <div className="dashboard-actions">
            <Link to="/helpers" className="button-link">
              Browse helpers
            </Link>
            <Link to="/bookings" className="button-link primary">
              Manage bookings
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          {loading ? <p className="status">Loading bookings...</p> : null}
          {error ? <p className="status">{error}</p> : null}

          <div className="dashboard-grid">
            <div className="detail-card">
              <h2>Upcoming bookings</h2>
              {upcoming.length === 0 ? (
                <p className="muted">No upcoming bookings yet.</p>
              ) : (
                <ul className="booking-list">
                  {upcoming.slice(0, 3).map((booking) => (
                    <li key={booking.id}>
                      <strong>{booking.helper_name || booking.helper?.full_name || "Helper"}</strong>
                      <span>{formatDate(booking.date)}</span>
                      <span>{formatTimeRange(booking.start_time, booking.end_time)}</span>
                      <span className={`badge ${booking.status || "pending"}`}>{booking.status || "pending"}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/bookings" className="button-link">
                View all bookings
              </Link>
            </div>

            <div className="detail-card">
              <h2>Past bookings</h2>
              {past.length === 0 ? (
                <p className="muted">No past bookings recorded.</p>
              ) : (
                <ul className="booking-list">
                  {past.slice(0, 3).map((booking) => (
                    <li key={booking.id}>
                      <strong>{booking.helper_name || booking.helper?.full_name || "Helper"}</strong>
                      <span>{formatDate(booking.date)}</span>
                      <span className="badge subtle">{booking.status || "completed"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="detail-card">
              <h2>Booking summary</h2>
              <div className="summary-row">
                <span>Total bookings</span>
                <strong>{bookings.length}</strong>
              </div>
              <div className="summary-row">
                <span>Upcoming</span>
                <strong>{upcoming.length}</strong>
              </div>
              <div className="summary-row">
                <span>Completed</span>
                <strong>{past.filter((booking) => booking.status === "completed").length}</strong>
              </div>
              <p className="muted">Need help? Contact support from the bookings page.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
