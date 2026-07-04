import { useEffect, useState } from "react";
import { api } from "../api";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/metrics").then((res) => setMetrics(res.data)).catch(() => setError("Failed to load metrics"));
  }, []);

  return (
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Metrics</h2>
      </div>
      {error && <div className="message error">{error}</div>}
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
