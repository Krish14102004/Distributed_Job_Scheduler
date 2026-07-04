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
    <div>
      <h2>Projects</h2>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <label>
          Project name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button>Create Project</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {projects.map((project, index) => (
          <li key={project.id}>
            #{index + 1} {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
