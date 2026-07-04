"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const claim_1 = require("./claim");
const execute_1 = require("./execute");
const heartbeat_1 = require("./heartbeat");
const shutdown_1 = require("./shutdown");
const db_1 = require("@job-scheduler/db");
const prisma = new db_1.PrismaClient();
const CONCURRENCY = 5;
let running = 0;
let shuttingDown = false;
async function pollLoop(workerId, queueIds) {
    console.log(`Polling loop started for queues ${queueIds.join(',')}`);
    let idx = 0;
    while (!shuttingDown) {
        if (running < CONCURRENCY && queueIds.length > 0) {
            const queueId = queueIds[idx % queueIds.length];
            idx++;
            try {
                const job = await (0, claim_1.claimNextJob)(workerId, queueId);
                if (job) {
                    running++;
                    (0, execute_1.executeJob)(job).finally(() => (running--));
                }
            }
            catch (err) {
                console.error('Error while attempting to claim job for queue', queueId, err);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}
(async () => {
    const workerId = (0, crypto_1.randomUUID)();
    await (0, heartbeat_1.ensureWorker)(workerId, "local");
    // Load all queues and poll them in round-robin. Refresh periodically.
    let queues = await prisma.queue.findMany();
    if (!queues || queues.length === 0) {
        console.error('No queues found in the database. Create a queue before starting workers.');
        process.exit(1);
    }
    let queueIds = queues.map((q) => q.id);
    const refreshInterval = setInterval(async () => {
        try {
            const qs = await prisma.queue.findMany();
            queueIds = qs.map((q) => q.id);
            console.log('Refreshed queue list:', queueIds);
        }
        catch (err) {
            console.error('Failed to refresh queues', err);
        }
    }, 30000);
    (0, shutdown_1.registerShutdown)(workerId, () => { shuttingDown = true; }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
    });
    setInterval(() => (0, heartbeat_1.heartbeat)(workerId, running), 5000);
    (0, shutdown_1.registerShutdown)(workerId, () => { shuttingDown = true; }, async () => {
        clearInterval(refreshInterval);
        await new Promise((resolve) => setTimeout(resolve, 100));
    });
    await pollLoop(workerId, queueIds);
})();
