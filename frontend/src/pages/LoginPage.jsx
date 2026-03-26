import { useState } from "react";

export default function LoginPage({ onLogin, status, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="page">
      <main className="card login-card">
        <header>
          <p className="eyebrow">Nano Online UAE</p>
          <h1>Admin Login</h1>
          <p className="subtitle">Use the demo admin account to manage helper records.</p>
        </header>

        <form onSubmit={submit} className="form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin"
              autoComplete="current-password"
              required
            />
          </label>
          <p className="hint">Demo credentials: username `admin`, password `admin`</p>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          
        </form>


        {status ? <p className="status">{status}</p> : null}
      </main>
    </div>
  );
}
