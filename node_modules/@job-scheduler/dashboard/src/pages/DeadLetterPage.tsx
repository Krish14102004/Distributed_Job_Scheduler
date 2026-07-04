import { useEffect, useState } from "react";
import { api } from "../api";

export default function DeadLetterPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/dead-letter").then((res) => setJobs(res.data)).catch(() => setError("Failed to load dead letter jobs"));
  }, []);

  const handleRetry = async (jobId: string) => {
    await api.post(`/jobs/${jobId}/retry`);
    setJobs((prev) => prev.filter((job) => job.jobId !== jobId));
  };

  return (
    <div>
      <h2>Dead Letter Queue</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {jobs.map((job) => (
          <li key={job.jobId}>
            {job.jobId} - {job.reason}
            <button onClick={() => handleRetry(job.jobId)} style={{ marginLeft: 12 }}>
              Retry
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
