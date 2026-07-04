import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import queueRoutes from "./routes/queues.routes";
import jobRoutes from "./routes/jobs.routes";
import deadLetterRoutes from "./routes/dead-letter.routes";
import workerRoutes from "./routes/workers.routes";
import metricsRoutes from "./routes/metrics.routes";
import { env } from "./config/env";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/queues", queueRoutes);
app.use("/jobs", jobRoutes);
app.use("/dead-letter", deadLetterRoutes);
app.use("/workers", workerRoutes);
app.use("/metrics", metricsRoutes);
app.use(errorHandler);

app.listen(env.port, () => console.log(`API listening on ${env.port}`));

export default app;
