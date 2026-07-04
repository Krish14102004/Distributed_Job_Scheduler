"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeJob = executeJob;
const db_1 = require("@job-scheduler/db");
const shared_1 = require("@job-scheduler/shared");
const prisma = new db_1.PrismaClient();
async function executeJob(job) {
    const workerId = job.workerId;
    const queue = await prisma.queue.findUnique({ where: { id: job.queueId }, include: { retryPolicy: true } });
    console.log(`Worker ${workerId} - starting job ${job.id}`);
    await prisma.job.update({ where: { id: job.id }, data: { status: "RUNNING", startedAt: new Date() } });
    await prisma.jobLog.create({ data: { jobId: job.id, level: "info", message: `Started job ${job.id}` } });
    try {
        (0, shared_1.assertTransition)("CLAIMED", "RUNNING");
        await prisma.jobExecution.create({
            data: {
                jobId: job.id,
                attemptNumber: job.attempts + 1,
                workerId,
                status: "RUNNING"
            }
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        // simulate success
        await prisma.job.update({ where: { id: job.id }, data: { status: "COMPLETED", completedAt: new Date() } });
        await prisma.jobExecution.updateMany({ where: { jobId: job.id }, data: { status: "COMPLETED", finishedAt: new Date(), durationMs: 50 } });
        await prisma.jobLog.create({ data: { jobId: job.id, level: "info", message: "Completed successfully" } });
        console.log(`Worker ${workerId} - completed job ${job.id}`);
    }
    catch (error) {
        const attempts = job.attempts + 1;
        if (attempts <= job.maxAttempts) {
            const delay = (0, shared_1.computeBackoffMs)(queue?.retryPolicy?.strategy ?? "EXPONENTIAL", attempts, queue?.retryPolicy?.baseDelayMs ?? 1000, queue?.retryPolicy?.maxDelayMs ?? 10000);
            await prisma.job.update({
                where: { id: job.id },
                data: { attempts, status: "RETRYING", scheduledAt: new Date(Date.now() + delay) }
            });
            await prisma.jobLog.create({ data: { jobId: job.id, level: "warn", message: `Scheduled retry in ${delay}ms` } });
            console.log(`Worker ${workerId} - job ${job.id} failed; scheduled retry in ${delay}ms`);
        }
        else {
            await prisma.job.update({ where: { id: job.id }, data: { status: "DEAD_LETTER" } });
            await prisma.deadLetterJob.create({ data: { jobId: job.id, reason: error.message } });
            await prisma.jobLog.create({ data: { jobId: job.id, level: "error", message: error.message } });
            console.log(`Worker ${workerId} - job ${job.id} moved to dead letter: ${error.message}`);
        }
    }
}
