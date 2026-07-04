import { useEffect, useState } from "react";
import { api } from "../api";
import { Project } from "../types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data)).catch(() => setError("Failed to load projects"));
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await api.post("/projects", { name });
      setProjects((prev) => [...prev, response.data]);
      setName("");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Unable to create project");
    }
  };

  return (
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Projects</h2>
      </div>
      <form onSubmit={handleCreate} className="form-grid">
        <div className="form-field">
          <label>Project name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <div className="message error">{error}</div>}
        <button type="submit" className="primary">Create Project</button>
      </form>
      <ul className="list-reset">
        {projects.map((project, index) => (
          <li key={project.id} className="list-item">
            <strong>#{index + 1}</strong> {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
