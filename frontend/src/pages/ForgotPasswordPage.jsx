import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="page">
      <main className="card login-card">
        <header>
          <p className="eyebrow">Nano Online UAE</p>
          <h1>Reset your password</h1>
          <p className="subtitle">
            Enter your email and we will send password reset instructions.
          </p>
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

          <button type="submit">Send reset link</button>
        </form>

        {sent ? (
          <p className="status">If an account exists, a reset link will be sent shortly.</p>
        ) : null}

        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </div>
      </main>
    </div>
  );
}
