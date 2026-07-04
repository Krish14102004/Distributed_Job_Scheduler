"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWorker = ensureWorker;
exports.heartbeat = heartbeat;
const db_1 = require("@job-scheduler/db");
const prisma = new db_1.PrismaClient();
async function ensureWorker(workerId, hostname) {
    const existing = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!existing) {
        await prisma.worker.create({ data: { id: workerId, hostname } });
        console.log(`Registered new worker ${workerId} (${hostname})`);
    }
}
async function heartbeat(workerId, runningJobs) {
    await prisma.workerHeartbeat.create({ data: { workerId, runningJobs } });
    console.log(`Heartbeat from ${workerId} - runningJobs=${runningJobs}`);
}
