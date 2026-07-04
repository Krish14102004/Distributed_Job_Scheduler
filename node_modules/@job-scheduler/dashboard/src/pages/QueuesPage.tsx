import { useEffect, useState } from "react";
import { api } from "../api";
import { Queue, Project } from "../types";

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState(0);
  const [concurrencyLimit, setConcurrencyLimit] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/queues").then((res) => setQueues(res.data)).catch(() => setError("Failed to load queues"));
    api.get("/projects").then((res) => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId(res.data[0].id);
      }
    }).catch(() => setError("Failed to load projects"));
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await api.post("/queues", { name, projectId, priority, concurrencyLimit });
      setQueues((prev) => [...prev, response.data]);
      setName("");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Unable to create queue");
    }
  };

  return (
    <div>
      <h2>Queues</h2>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <label>
          Queue name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Project
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.id})
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} />
        </label>
        <label>
          Concurrency Limit
          <input type="number" value={concurrencyLimit} onChange={(e) => setConcurrencyLimit(parseInt(e.target.value, 10))} />
        </label>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button>Create Queue</button>
      </form>
      <ul>
        {queues.map((queue, index) => (
          <li key={queue.id}>
            #{index + 1} {queue.name} (priority {queue.priority}, concurrency {queue.concurrencyLimit})
          </li>
        ))}
      </ul>
    </div>
  );
}
