export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8000";

const USER_TOKEN_KEY = "nano_online_user_token";
const ADMIN_TOKEN_KEY = "nano_online_token";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (path.startsWith("/api/")) {
        localStorage.removeItem(USER_TOKEN_KEY);
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        if (window.location.pathname !== "/admin/login") {
          window.location.assign("/admin/login");
        }
      }
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function login({ username, password }) {
  return request("/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export async function fetchProfile(token) {
  return request("/auth/me", token);
}

export async function getStats(token) {
  return request("/stats", token);
}

export async function getHelperRoles(token) {
  return request("/helper-roles", token);
}

export async function createHelperRole(token, payload) {
  return request("/helper-roles", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateHelperRole(token, id, payload) {
  return request(`/helper-roles/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getHelperRole(token, id) {
  return request(`/helper-roles/${id}`, token);
}

export async function deleteHelperRole(token, id) {
  return request(`/helper-roles/${id}`, token, {
    method: "DELETE"
  });
}

export async function getHelpers(token) {
  return request("/helpers", token);
}

export async function createHelper(token, payload) {
  return request("/helpers", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateHelper(token, id, payload) {
  return request(`/helpers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getHelper(token, id) {
  return request(`/helpers/${id}`, token);
}

export async function deleteHelper(token, id) {
  return request(`/helpers/${id}`, token, {
    method: "DELETE"
  });
}

export async function getLocations(token, search = "") {
  const suffix = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/locations${suffix}`, token);
}

export async function getLocation(token, id) {
  return request(`/locations/${id}`, token);
}

export async function createLocation(token, payload) {
  return request("/locations", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateLocation(token, id, payload) {
  return request(`/locations/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteLocation(token, id) {
  return request(`/locations/${id}`, token, {
    method: "DELETE"
  });
}

export async function getEmployers(token, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/employers${suffix}`, token);
}

export async function getEmployer(token, id) {
  return request(`/employers/${id}`, token);
}

export async function createEmployer(token, payload) {
  return request("/employers", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateEmployer(token, id, payload) {
  return request(`/employers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteEmployer(token, id) {
  return request(`/employers/${id}`, token, {
    method: "DELETE"
  });
}

export async function getJobRequests(token, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/job-requests${suffix}`, token);
}

export async function getJobRequest(token, id) {
  return request(`/job-requests/${id}`, token);
}

export async function createJobRequest(token, payload) {
  return request("/job-requests", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateJobRequest(token, id, payload) {
  return request(`/job-requests/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteJobRequest(token, id) {
  return request(`/job-requests/${id}`, token, {
    method: "DELETE"
  });
}

export async function getAssignments(token, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/assignments${suffix}`, token);
}

export async function getAssignment(token, id) {
  return request(`/assignments/${id}`, token);
}

export async function createAssignment(token, payload) {
  return request("/assignments", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAssignment(token, id, payload) {
  return request(`/assignments/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteAssignment(token, id) {
  return request(`/assignments/${id}`, token, {
    method: "DELETE"
  });
}

export async function getAvailability(token, helperId = "") {
  const suffix = helperId ? `?helper_id=${helperId}` : "";
  return request(`/availability${suffix}`, token);
}

export async function getHelperAvailability(token, helperId) {
  return request(`/availability?helper_id=${helperId}`, token);
}

export async function createAvailability(token, payload) {
  return request("/availability", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAvailability(token, id, payload) {
  return request(`/availability/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteAvailability(token, id) {
  return request(`/availability/${id}`, token, {
    method: "DELETE"
  });
}

export async function getSkills(token, search = "") {
  const suffix = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/skills${suffix}`, token);
}

export async function getSkill(token, id) {
  return request(`/skills/${id}`, token);
}

export async function createSkill(token, payload) {
  return request("/skills", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateSkill(token, id, payload) {
  return request(`/skills/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteSkill(token, id) {
  return request(`/skills/${id}`, token, {
    method: "DELETE"
  });
}

export async function getHelperSkills(token, helperId) {
  return request(`/helpers/${helperId}/skills`, token);
}

export async function assignHelperSkill(token, helperId, skillId) {
  return request(`/helpers/${helperId}/skills/${skillId}`, token, {
    method: "POST"
  });
}

export async function removeHelperSkill(token, helperId, skillId) {
  return request(`/helpers/${helperId}/skills/${skillId}`, token, {
    method: "DELETE"
  });
}

export async function getHelperExperiences(token, helperId) {
  const data = await request(`/experience`, token);
  return data.filter((record) => record.helper_id === Number(helperId));
}

export async function getExperience(token, id) {
  return request(`/experience/${id}`, token);
}

export async function createExperience(token, payload) {
  return request("/experience", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateExperience(token, id, payload) {
  return request(`/experience/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteExperience(token, id) {
  return request(`/experience/${id}`, token, {
    method: "DELETE"
  });
}

export async function getHelperDocuments(token, helperId) {
  const data = await request(`/documents`, token);
  return data.filter((record) => record.helper_id === Number(helperId));
}

export async function getDocument(token, id) {
  return request(`/documents/${id}`, token);
}

export async function createDocument(token, payload) {
  return request("/documents", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateDocument(token, id, payload) {
  return request(`/documents/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteDocument(token, id) {
  return request(`/documents/${id}`, token, {
    method: "DELETE"
  });
}

// ── User-facing APIs ─────────────────────────────────

export async function registerUser(payload) {
  return request("/api/auth/register", null, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser({ email, password }) {
  return request("/api/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function fetchUserProfile(token) {
  return request("/api/auth/me", token);
}

export async function getPublicHelpers(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/api/helpers${suffix}`, null);
}

export async function getPublicHelper(id) {
  return request(`/api/helpers/${id}`, null);
}

export async function createBooking(token, payload) {
  return request("/api/bookings", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getUserBookings(token) {
  return request("/api/bookings/user", token);
}

export async function cancelBooking(token, id) {
  return request(`/api/bookings/${id}/cancel`, token, {
    method: "PUT"
  });
}

export async function rescheduleBooking(token, id, payload) {
  return request(`/api/bookings/${id}/reschedule`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function completeBooking(token, id) {
  return request(`/api/bookings/${id}/complete`, token, {
    method: "PUT"
  });
}

export async function createBookingReview(token, id, payload) {
  return request(`/api/bookings/${id}/review`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
