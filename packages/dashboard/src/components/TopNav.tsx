import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function TopNav() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
      <Link to="/">Home</Link>
      {token ? (
        <>
          <Link to="/projects">Projects</Link>
          <Link to="/queues">Queues</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/workers">Workers</Link>
          <Link to="/dead-letter">Dead Letter</Link>
          <Link to="/metrics">Metrics</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
