import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { fetchProfile, login } from "./api.js";
import AdminLayout from "./components/AdminLayout.jsx";
import RequireUser from "./components/RequireUser.jsx";
import { UserAuthProvider } from "./context/UserAuthContext.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AssignmentFormPage from "./pages/AssignmentFormPage.jsx";
import AssignmentsListPage from "./pages/AssignmentsListPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AvailabilityFormPage from "./pages/AvailabilityFormPage.jsx";
import AvailabilityListPage from "./pages/AvailabilityListPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentFormPage from "./pages/DocumentFormPage.jsx";
import DocumentsListPage from "./pages/DocumentsListPage.jsx";
import EmployerFormPage from "./pages/EmployerFormPage.jsx";
import EmployersListPage from "./pages/EmployersListPage.jsx";
import ExperienceFormPage from "./pages/ExperienceFormPage.jsx";
import ExperiencesListPage from "./pages/ExperiencesListPage.jsx";
import HelperFormPage from "./pages/HelperFormPage.jsx";
import HelperDetailPage from "./pages/HelperDetailPage.jsx";
import HelpersPage from "./pages/HelpersPage.jsx";
import HelperSkillsPage from "./pages/HelperSkillsPage.jsx";
import HelpersListPage from "./pages/HelpersListPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import JobRequestFormPage from "./pages/JobRequestFormPage.jsx";
import JobRequestsListPage from "./pages/JobRequestsListPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import LocationFormPage from "./pages/LocationFormPage.jsx";
import LocationsListPage from "./pages/LocationsListPage.jsx";
import RoleFormPage from "./pages/RoleFormPage.jsx";
import RolesListPage from "./pages/RolesListPage.jsx";
import SkillFormPage from "./pages/SkillFormPage.jsx";
import SkillsListPage from "./pages/SkillsListPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import UserBookingsPage from "./pages/UserBookingsPage.jsx";
import UserDashboardPage from "./pages/UserDashboardPage.jsx";
import UserLoginPage from "./pages/UserLoginPage.jsx";
import UserRegisterPage from "./pages/UserRegisterPage.jsx";

const TOKEN_KEY = "nano_online_token";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    const verify = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
      } catch (error) {
        setStatus(error.message);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
      }
    };

    verify();
  }, [token]);

  const handleLogin = async (username, password) => {
    setLoading(true);
    setStatus("");

    try {
      const data = await login({ username, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setStatus("Login successful");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
    setStatus("Logged out");
    localStorage.removeItem(TOKEN_KEY);
  };

  const isAuthenticated = Boolean(token && profile);

  return (
    <UserAuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/helpers" element={<HelpersPage />} />
            <Route path="/helpers/:helperId" element={<HelperDetailPage />} />
            <Route
              path="/helpers/:helperId/book"
              element={
                <RequireUser>
                  <BookingPage />
                </RequireUser>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<UserRegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireUser>
                  <UserDashboardPage />
                </RequireUser>
              }
            />
            <Route
              path="/bookings"
              element={
                <RequireUser>
                  <UserBookingsPage />
                </RequireUser>
              }
            />
          </Route>

          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <LoginPage onLogin={handleLogin} status={status} loading={loading} />
              )
            }
          />

          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminLayout profile={profile} onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage token={token} />} />

            {/* Helpers */}
            <Route path="roles" element={<RolesListPage token={token} />} />
            <Route path="roles/new" element={<RoleFormPage token={token} />} />
            <Route path="roles/:roleId/edit" element={<RoleFormPage token={token} />} />
            <Route path="helpers" element={<HelpersListPage token={token} />} />
            <Route path="helpers/new" element={<HelperFormPage token={token} />} />
            <Route path="helpers/:helperId/edit" element={<HelperFormPage token={token} />} />
            <Route path="availability" element={<AvailabilityListPage token={token} />} />
            <Route path="availability/new" element={<AvailabilityFormPage token={token} />} />
            <Route
              path="availability/:scheduleId/edit"
              element={<AvailabilityFormPage token={token} />}
            />
            <Route path="skills" element={<SkillsListPage token={token} />} />
            <Route path="skills/new" element={<SkillFormPage token={token} />} />
            <Route path="skills/:skillId/edit" element={<SkillFormPage token={token} />} />
            <Route path="helper-skills" element={<HelperSkillsPage token={token} />} />
            <Route path="experience" element={<ExperiencesListPage token={token} />} />
            <Route path="experience/new" element={<ExperienceFormPage token={token} />} />
            <Route path="experience/:experienceId/edit" element={<ExperienceFormPage token={token} />} />
            <Route path="documents" element={<DocumentsListPage token={token} />} />
            <Route path="documents/new" element={<DocumentFormPage token={token} />} />
            <Route path="documents/:documentId/edit" element={<DocumentFormPage token={token} />} />

            {/* Placements */}
            <Route path="employers" element={<EmployersListPage token={token} />} />
            <Route path="employers/new" element={<EmployerFormPage token={token} />} />
            <Route path="employers/:employerId/edit" element={<EmployerFormPage token={token} />} />
            <Route path="job-requests" element={<JobRequestsListPage token={token} />} />
            <Route path="job-requests/new" element={<JobRequestFormPage token={token} />} />
            <Route path="job-requests/:jobRequestId/edit" element={<JobRequestFormPage token={token} />} />
            <Route path="assignments" element={<AssignmentsListPage token={token} />} />
            <Route path="assignments/new" element={<AssignmentFormPage token={token} />} />
            <Route path="assignments/:assignmentId/edit" element={<AssignmentFormPage token={token} />} />

            {/* Setup */}
            <Route path="locations" element={<LocationsListPage token={token} />} />
            <Route path="locations/new" element={<LocationFormPage token={token} />} />
            <Route path="locations/:locationId/edit" element={<LocationFormPage token={token} />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserAuthProvider>
  );
}

