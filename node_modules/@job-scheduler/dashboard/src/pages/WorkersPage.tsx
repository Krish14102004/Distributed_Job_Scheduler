import { useEffect, useState } from "react";
import { api } from "../api";
import { WorkerInfo } from "../types";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/workers").then((res) => setWorkers(res.data)).catch(() => setError("Failed to load workers"));
  }, []);

  return (
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Workers</h2>
      </div>
      {error && <div className="message error">{error}</div>}
      <ul className="list-reset spacer-top-lg">
        {workers.map((worker, index) => (
          <li key={worker.id} className="list-item">
            <strong>#{index + 1}</strong> {worker.hostname}
            <div className="info-text">
              status {worker.status} · last heartbeat {worker.heartbeats?.[0]?.reportedAt}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
