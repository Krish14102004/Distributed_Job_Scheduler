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
    <div>
      <h2>Workers</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {workers.map((worker, index) => (
          <li key={worker.id}>
            #{index + 1} {worker.hostname} - status {worker.status} - last heartbeat {worker.heartbeats?.[0]?.reportedAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
