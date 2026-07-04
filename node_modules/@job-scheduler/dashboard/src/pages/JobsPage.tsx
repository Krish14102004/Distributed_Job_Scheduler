import { useEffect, useState } from "react";
import { api } from "../api";
import { Job, Queue } from "../types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queueId, setQueueId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/queues").then((res) => {
      setQueues(res.data);
      if (res.data.length > 0) {
        setQueueId(res.data[0].id);
      }
    }).catch(() => setError("Failed to load queues"));
    fetchJobs();
  }, []);

  const [payload, setPayload] = useState("{}");
  const [runAt, setRunAt] = useState("");
  const [priority, setPriority] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setError(null);
      setSuccess(null);
      const params: any = {};
      if (queueId) params.queueId = queueId;
      if (status) params.status = status;
      const response = await api.get("/jobs", { params });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to load jobs");
    }
  };

  const handleCreateJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      const parsedPayload = JSON.parse(payload || "{}");
      await api.post(`/jobs/${queueId}/jobs`, {
        payload: parsedPayload,
        runAt: runAt || undefined,
        priority,
        maxAttempts
      });
      setSuccess("Job created successfully");
      setPayload("{}");
      setRunAt("");
      setPriority(0);
      setMaxAttempts(5);
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Unable to create job");
    }
  };

  return (
    <div className="card">
      <div className="page-header">
        <h2 className="page-title">Jobs</h2>
      </div>
      <div className="split-grid">
        <div className="section-card">
          <h3 className="section-title">Filters</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Queue</label>
              <select value={queueId} onChange={(e) => setQueueId(e.target.value)}>
                <option value="">All queues</option>
                {queues.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name} ({queue.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Any</option>
                <option value="QUEUED">Queued</option>
                <option value="CLAIMED">Claimed</option>
                <option value="RUNNING">Running</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="RETRYING">Retrying</option>
                <option value="DEAD_LETTER">Dead Letter</option>
              </select>
            </div>
            <button type="button" className="secondary" onClick={fetchJobs}>
              Load Jobs
            </button>
          </div>
        </div>
        <div className="section-card">
          <h3 className="section-title">Create Job</h3>
          <form onSubmit={handleCreateJob} className="form-grid">
            <div className="form-field">
              <label>Queue</label>
              <select value={queueId} onChange={(e) => setQueueId(e.target.value)} required>
                {queues.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name} ({queue.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Payload (JSON)</label>
              <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={5} />
            </div>
            <div className="form-field">
              <label>Run At (optional)</label>
              <input value={runAt} onChange={(e) => setRunAt(e.target.value)} placeholder="YYYY-MM-DDTHH:MM:SS" />
            </div>
            <div className="form-field">
              <label>Priority</label>
              <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} />
            </div>
            <div className="form-field">
              <label>Max Attempts</label>
              <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10))} />
            </div>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}
            <button type="submit" className="primary">Submit Job</button>
          </form>
        </div>
      </div>
      <ul className="list-reset spacer-top-lg">
        {jobs.map((job, index) => (
          <li key={job.id} className="list-item">
            <div><strong>#{index + 1}</strong> {job.status}</div>
            <div className="info-text">attempts {job.attempts}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
