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
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Queues</h2>
      </div>
      <form onSubmit={handleCreate} className="form-grid">
        <div className="form-field">
          <label>Queue name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.id})
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Priority</label>
          <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} />
        </div>
        <div className="form-field">
          <label>Concurrency Limit</label>
          <input type="number" value={concurrencyLimit} onChange={(e) => setConcurrencyLimit(parseInt(e.target.value, 10))} />
        </div>
        {error && <div className="message error">{error}</div>}
        <button type="submit" className="primary">Create Queue</button>
      </form>
      <ul className="list-reset spacer-top-lg">
        {queues.map((queue, index) => (
          <li key={queue.id} className="list-item">
            <strong>#{index + 1}</strong> {queue.name}
            <div className="info-text">
              priority {queue.priority}, concurrency {queue.concurrencyLimit}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
