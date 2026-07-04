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
    <div>
      <h2>Jobs</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <label>
          Queue
          <select value={queueId} onChange={(e) => setQueueId(e.target.value)}>
            <option value="">All queues</option>
            {queues.map((queue) => (
              <option key={queue.id} value={queue.id}>
                {queue.name} ({queue.id})
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
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
        </label>
        <button onClick={fetchJobs}>Load Jobs</button>
      </div>
      <h3>Create Job</h3>
      <form onSubmit={handleCreateJob} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <label>
          Queue
          <select value={queueId} onChange={(e) => setQueueId(e.target.value)} required>
            {queues.map((queue) => (
              <option key={queue.id} value={queue.id}>
                {queue.name} ({queue.id})
              </option>
            ))}
          </select>
        </label>
        <label>
          Payload (JSON)
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={5} />
        </label>
        <label>
          Run At (optional)
          <input value={runAt} onChange={(e) => setRunAt(e.target.value)} placeholder="YYYY-MM-DDTHH:MM:SS" />
        </label>
        <label>
          Priority
          <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} />
        </label>
        <label>
          Max Attempts
          <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10))} />
        </label>
        <button type="submit">Submit Job</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <ul>
        {jobs.map((job, index) => (
          <li key={job.id}>
            #{index + 1} - {job.status} - attempts {job.attempts}
          </li>
        ))}
      </ul>
    </div>
  );
}
