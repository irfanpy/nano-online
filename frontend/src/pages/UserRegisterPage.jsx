import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext.jsx";

export default function UserRegisterPage() {
  const { register, status, loading } = useUserAuth();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });
  const navigate = useNavigate();

  const updateField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const success = await register(formState);
    if (success) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="page">
      <main className="card login-card">
        <header>
          <p className="eyebrow">Nano Online UAE</p>
          <h1>Create your account</h1>
          <p className="subtitle">Start browsing trusted helpers in minutes.</p>
        </header>

        <form onSubmit={submit} className="form">
          <label>
            Full name
            <input
              type="text"
              value={formState.name}
              onChange={updateField("name")}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={formState.email}
              onChange={updateField("email")}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={formState.phone}
              onChange={updateField("phone")}
              placeholder="+971 50 000 0000"
              autoComplete="tel"
              required
            />
          </label>

          <label>
            Address
            <input
              type="text"
              value={formState.address}
              onChange={updateField("address")}
              placeholder="Area, street, villa/apartment"
              autoComplete="street-address"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={formState.password}
              onChange={updateField("password")}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>

        {status ? <p className="status">{status}</p> : null}
      </main>
    </div>
  );
}
