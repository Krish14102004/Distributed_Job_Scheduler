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
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Dead Letter Queue</h2>
      </div>
      {error && <div className="message error">{error}</div>}
      <ul className="list-reset spacer-top-lg">
        {jobs.map((job) => (
          <li key={job.jobId} className="list-item">
            <div>
              <strong>{job.jobId}</strong>
            </div>
            <div className="info-text">{job.reason}</div>
            <button type="button" className="secondary" onClick={() => handleRetry(job.jobId)}>
              Retry
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
