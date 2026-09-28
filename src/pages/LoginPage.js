import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role (will be handled by App.js)
      navigate("/");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="ds-auth-shell">
      <div className="ds-card ds-auth-card">
        <div className="text-center mb-8">
          <h1>S A R S</h1>
          <p className="ds-helper-text mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="ds-alert">{error}</div>}

          <div className="ds-form-field">
            <label htmlFor="email" className="ds-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ds-input"
              placeholder="your.email@university.edu"
              required
            />
          </div>

          <div className="ds-form-field">
            <label htmlFor="password" className="ds-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ds-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ds-button ds-button-primary w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
