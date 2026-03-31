import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooking, getPublicHelper } from "../api.js";
import { useUserAuth } from "../context/UserAuthContext.jsx";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function parseTimeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map((value) => Number(value));
  return hours * 60 + (minutes || 0);
}

function minutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function buildHourlySlots(startTime, endTime) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots = [];
  for (let current = start; current + 60 <= end; current += 60) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

function toLocalIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getUpcomingDatesFromHelper(helper, count = 10) {
  const results = [];
  if (!helper) return results;
  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };
  const targetDays = [];
  const addDay = (value, status) => {
    const normalized = (value || "").toLowerCase();
    const state = (status || "available").toLowerCase();
    if (!normalized) return;
    if (state !== "available" && state !== "limited") return;
    const dayIndex = dayMap[normalized];
    if (dayIndex === undefined || targetDays.includes(dayIndex)) return;
    targetDays.push(dayIndex);
  };

  if (Array.isArray(helper?.availability)) {
    helper.availability.forEach((item) => addDay(item.day_of_week || item.day, item.availability_status));
  }
  if (Array.isArray(helper?.availability_schedules)) {
    helper.availability_schedules.forEach((item) => addDay(item.day_of_week, item.availability_status));
  }

  if (!targetDays.length) return results;
  const today = new Date();
  for (let offset = 0; results.length < count && offset < 60; offset += 1) {
    const candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    if (!targetDays.includes(candidate.getDay())) continue;
    const iso = toLocalIso(candidate);
    const [year, month, day] = iso.split("-").map((value) => Number(value));
    const selectedDay = DAY_NAMES[new Date(year, month - 1, day).getDay()].toLowerCase();

    const slots = Array.isArray(helper?.availability)
      ? helper.availability
          .filter((item) => {
            const dayValue = (item.day_of_week || item.day || "").toLowerCase();
            const state = (item.availability_status || "available").toLowerCase();
            return dayValue === selectedDay && (state === "available" || state === "limited");
          })
          .flatMap((item) => buildHourlySlots(item.start_time, item.end_time))
      : Array.isArray(helper?.availability_schedules)
      ? helper.availability_schedules
          .filter((schedule) => {
            const dayValue = (schedule.day_of_week || "").toLowerCase();
            const state = (schedule.availability_status || "available").toLowerCase();
            return dayValue === selectedDay && (state === "available" || state === "limited");
          })
          .flatMap((schedule) => buildHourlySlots(schedule.start_time, schedule.end_time))
      : [];

    if (!slots.length) continue;
    results.push({
      iso,
      label: candidate.toLocaleDateString("en-AE", {
        weekday: "short",
        day: "numeric",
        month: "short"
      })
    });
  }
  return results;
}

export default function BookingPage() {
  const { helperId } = useParams();
  const { token } = useUserAuth();
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [duration, setDuration] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHelper = async () => {
      setLoading(true);
      setStatus("");
      try {
        const data = await getPublicHelper(helperId);
        setHelper(data);
      } catch (error) {
        setStatus(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHelper();
  }, [helperId]);

  const availabilitySlots = useMemo(() => {
    if (!helper || !date) return [];
    const [year, month, day] = date.split("-").map((value) => Number(value));
    const selectedDay = DAY_NAMES[new Date(year, month - 1, day).getDay()].toLowerCase();

    if (Array.isArray(helper.availability)) {
      const matched = helper.availability.filter((item) => {
        const dayValue = (item.day_of_week || item.day || "").toLowerCase();
        const state = (item.availability_status || "available").toLowerCase();
        return dayValue === selectedDay && (state === "available" || state === "limited");
      });
      return matched.flatMap((item) => buildHourlySlots(item.start_time, item.end_time));
    }

    if (Array.isArray(helper.availability_schedules)) {
      return helper.availability_schedules
        .filter((schedule) => {
          const dayValue = (schedule.day_of_week || "").toLowerCase();
          const state = (schedule.availability_status || "available").toLowerCase();
          return dayValue === selectedDay && (state === "available" || state === "limited");
        })
        .flatMap((schedule) => buildHourlySlots(schedule.start_time, schedule.end_time));
    }

    return [];
  }, [helper, date]);

  const upcomingDates = useMemo(() => {
    if (!helper) return [];
    return getUpcomingDatesFromHelper(helper);
  }, [helper]);

  const hourlyRate = Number(
    helper?.hourly_rate || helper?.hourlyRate || helper?.rate_per_hour || helper?.rate || 0
  );
  const totalPrice = hourlyRate && duration ? hourlyRate * duration : 0;

  const endTime = useMemo(() => {
    if (!slot) return "";
    return minutesToTime(parseTimeToMinutes(slot) + duration * 60);
  }, [slot, duration]);

  const submit = async (event) => {
    event.preventDefault();
    if (!date || !slot || !duration) {
      setStatus("Please select a date, time slot, and duration.");
      return;
    }
    if (!hourlyRate) {
      setStatus("Pricing is unavailable for this helper.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      await createBooking(token, {
        helper_id: Number(helperId),
        date,
        start_time: slot,
        end_time: endTime,
        status: "pending",
        total_price: totalPrice
      });
      navigate("/bookings", { replace: true });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !helper) {
    return (
      <section className="public-section">
        <div className="public-container">
          <p className="status">Loading booking details...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="booking-page">
      <section className="public-section">
        <div className="public-container booking-header">
          <div>
            <p className="home-kicker">Booking</p>
            <h1>Reserve {helper?.full_name || "your helper"}</h1>
            <p className="public-lead">
              Select a date and time slot that works for your household.
            </p>
          </div>
          <Link to={`/helpers/${helperId}`} className="button-link">
            Back to profile
          </Link>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container booking-grid">
          <form className="detail-card" onSubmit={submit}>
            <h2>Pick your schedule</h2>
            <label>
              Date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>

            <div>
              <p className="form-label">Available dates</p>
              {upcomingDates.length ? (
                <div className="availability-dates">
                  {upcomingDates.map((item) => (
                    <button
                      key={item.iso}
                      type="button"
                      className={`date-chip ${date === item.iso ? "active" : ""}`}
                      onClick={() => setDate(item.iso)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">No upcoming dates with open slots.</p>
              )}
            </div>

            <label>
              Time slot
              <select value={slot} onChange={(event) => setSlot(event.target.value)} required>
                <option value="">Select a slot</option>
                {availabilitySlots.map((availableSlot) => (
                  <option key={availableSlot} value={availableSlot}>
                    {availableSlot}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Duration (hours)
              <input
                type="number"
                min="1"
                max="12"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                required
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Confirming..." : "Confirm booking"}
            </button>

            {status ? <p className="status">{status}</p> : null}
          </form>

          <div className="detail-card">
            <h2>Booking summary</h2>
            <div className="summary-row">
              <span>Helper</span>
              <strong>{helper?.full_name || "-"}</strong>
            </div>
            <div className="summary-row">
              <span>Date</span>
              <strong>{date || "Select a date"}</strong>
            </div>
            <div className="summary-row">
              <span>Time</span>
              <strong>{slot ? `${slot} - ${endTime}` : "Select a slot"}</strong>
            </div>
            <div className="summary-row">
              <span>Duration</span>
              <strong>{duration ? `${duration} hours` : "-"}</strong>
            </div>
            <div className="summary-row">
              <span>Hourly rate</span>
              <strong>{hourlyRate ? `AED ${hourlyRate}` : "Pricing pending"}</strong>
            </div>
            <div className="summary-row total">
              <span>Total price</span>
              <strong>{totalPrice ? `AED ${totalPrice}` : "Pricing pending"}</strong>
            </div>

            {availabilitySlots.length === 0 && date ? (
              <p className="muted">No available slots for this date. Try another day.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
