import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      login(token);
      navigate("/projects");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Login failed");
    }
  };

  return (
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Login</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="message error">{error}</div>}
        <button type="submit" className="primary">Login</button>
      </form>
      <p className="muted-paragraph">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
