import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function TopNav({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="topnav">
      <div className="nav-brand">
        <span className="brand">Scheduler</span>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/projects">Projects</Link>
            <Link to="/queues">Queues</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/workers">Workers</Link>
            <Link to="/dead-letter">Dead Letter</Link>
            <Link to="/metrics">Metrics</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
      <div className="nav-actions">
        <button type="button" className="secondary theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {token && (
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
