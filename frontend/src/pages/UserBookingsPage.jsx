import { useEffect, useState } from "react";
import {
  cancelBooking,
  completeBooking,
  createBookingReview,
  getUserBookings,
  rescheduleBooking
} from "../api.js";
import { useUserAuth } from "../context/UserAuthContext.jsx";

function normalizeBookingsResponse(data) {
  if (Array.isArray(data)) return data;
  if (data?.items) return data.items;
  if (data?.results) return data.results;
  return [];
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

export default function UserBookingsPage() {
  const { token } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "", comment: "" });
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    start_time: "",
    end_time: ""
  });

  const loadBookings = async () => {
    setLoading(true);
    setStatus("");
    try {
      const data = await getUserBookings(token);
      setBookings(normalizeBookingsResponse(data));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [token]);

  const handleCancel = async (bookingId) => {
    setLoading(true);
    setStatus("");
    try {
      await cancelBooking(token, bookingId);
      await loadBookings();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startReschedule = (booking) => {
    setEditing(booking.id);
    setRescheduleForm({
      date: booking.date || "",
      start_time: booking.start_time || "",
      end_time: booking.end_time || ""
    });
  };

  const handleComplete = async (bookingId) => {
    setLoading(true);
    setStatus("");
    try {
      await completeBooking(token, bookingId);
      await loadBookings();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startReview = (booking) => {
    setReviewing(booking.id);
    setReviewForm({ rating: "", comment: "" });
  };

  const submitReview = async (bookingId) => {
    if (!reviewForm.comment.trim()) {
      setStatus("Please add a comment before submitting.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      await createBookingReview(token, bookingId, {
        rating: reviewForm.rating ? Number(reviewForm.rating) : null,
        comment: reviewForm.comment.trim()
      });
      setReviewedIds((prev) => new Set(prev).add(bookingId));
      setReviewing(null);
      setReviewForm({ rating: "", comment: "" });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReschedule = async (bookingId) => {
    if (!rescheduleForm.date || !rescheduleForm.start_time || !rescheduleForm.end_time) {
      setStatus("Select a new date and time window.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      await rescheduleBooking(token, bookingId, rescheduleForm);
      setEditing(null);
      await loadBookings();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookings-page">
      <section className="public-section">
        <div className="public-container">
          <p className="home-kicker">My bookings</p>
          <h1>Manage your helper bookings</h1>
          <p className="public-lead">
            Cancel or reschedule bookings you have already placed.
          </p>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          {loading ? <p className="status">Updating bookings...</p> : null}
          {status ? <p className="status">{status}</p> : null}

          {bookings.length === 0 && !loading ? (
            <p className="empty-state">You have no bookings yet.</p>
          ) : null}

          <div className="booking-cards">
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div className="booking-meta">
                  <div>
                    <h3>{booking.helper_name || booking.helper?.full_name || "Helper"}</h3>
                    <p>{formatDate(booking.date)}</p>
                    <p>{formatTimeRange(booking.start_time, booking.end_time)}</p>
                  </div>
                  <span className={`badge ${booking.status || "pending"}`}>
                    {booking.status || "pending"}
                  </span>
                </div>

                <div className="booking-actions">
                  {booking.status !== "cancelled" ? (
                    <button type="button" onClick={() => handleCancel(booking.id)}>
                      Cancel
                    </button>
                  ) : null}
                  {booking.status === "pending" || booking.status === "confirmed" ? (
                    <button type="button" className="secondary" onClick={() => startReschedule(booking)}>
                      Reschedule
                    </button>
                  ) : null}
                  {booking.status !== "completed" && booking.status !== "cancelled" ? (
                    <button type="button" className="secondary" onClick={() => handleComplete(booking.id)}>
                      Mark complete
                    </button>
                  ) : null}
                  {booking.status === "completed" && !booking.has_review && !reviewedIds.has(booking.id) ? (
                    <button type="button" className="secondary" onClick={() => startReview(booking)}>
                      Leave a comment
                    </button>
                  ) : null}
                </div>

                {editing === booking.id ? (
                  <div className="reschedule-form">
                    <label>
                      New date
                      <input
                        type="date"
                        value={rescheduleForm.date}
                        onChange={(event) =>
                          setRescheduleForm((current) => ({
                            ...current,
                            date: event.target.value
                          }))
                        }
                      />
                    </label>
                    <label>
                      Start time
                      <input
                        type="time"
                        value={rescheduleForm.start_time}
                        onChange={(event) =>
                          setRescheduleForm((current) => ({
                            ...current,
                            start_time: event.target.value
                          }))
                        }
                      />
                    </label>
                    <label>
                      End time
                      <input
                        type="time"
                        value={rescheduleForm.end_time}
                        onChange={(event) =>
                          setRescheduleForm((current) => ({
                            ...current,
                            end_time: event.target.value
                          }))
                        }
                      />
                    </label>
                    <div className="reschedule-actions">
                      <button type="button" onClick={() => submitReschedule(booking.id)}>
                        Save
                      </button>
                      <button type="button" className="secondary" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {reviewing === booking.id && !booking.has_review ? (
                  <div className="reschedule-form">
                    <label>
                      Rating (optional)
                      <select
                        value={reviewForm.rating}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            rating: event.target.value
                          }))
                        }
                      >
                        <option value="">Select rating</option>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Comment
                      <textarea
                        rows="3"
                        value={reviewForm.comment}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            comment: event.target.value
                          }))
                        }
                        placeholder="Share feedback about your helper"
                      />
                    </label>
                    <div className="reschedule-actions">
                      <button type="button" onClick={() => submitReview(booking.id)}>
                        Submit
                      </button>
                      <button type="button" className="secondary" onClick={() => setReviewing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
