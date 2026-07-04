import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./auth";
import TopNav from "./components/TopNav";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProjectsPage from "./pages/ProjectsPage";
import QueuesPage from "./pages/QueuesPage";
import JobsPage from "./pages/JobsPage";
import WorkersPage from "./pages/WorkersPage";
import DeadLetterPage from "./pages/DeadLetterPage";
import MetricsPage from "./pages/MetricsPage";
import "./styles.css";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("dashboardTheme") as "light" | "dark" | null;
    const nextTheme = stored || "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark-mode", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("dashboardTheme", nextTheme);
    document.documentElement.classList.toggle("dark-mode", nextTheme === "dark");
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <TopNav theme={theme} toggleTheme={toggleTheme} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
            <Route path="/queues" element={<PrivateRoute><QueuesPage /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
            <Route path="/workers" element={<PrivateRoute><WorkersPage /></PrivateRoute>} />
            <Route path="/dead-letter" element={<PrivateRoute><DeadLetterPage /></PrivateRoute>} />
            <Route path="/metrics" element={<PrivateRoute><MetricsPage /></PrivateRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
