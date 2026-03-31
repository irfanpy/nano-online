import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext.jsx";

export default function UserLoginPage() {
  const { login, status, loading, isAuthenticated, setStatus } = useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="page">
      <main className="card login-card">
        <header>
          <p className="eyebrow">Nano Online UAE</p>
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to manage bookings and shortlists.</p>
        </header>

        <form onSubmit={submit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <button type="button" className="link-button" onClick={() => setStatus("")}>
            Clear message
          </button>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create an account</Link>
        </div>

        {status ? <p className="status">{status}</p> : null}
      </main>
    </div>
  );
}
