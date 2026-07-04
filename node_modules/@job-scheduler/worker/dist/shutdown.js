"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerShutdown = registerShutdown;
const db_1 = require("@job-scheduler/db");
const prisma = new db_1.PrismaClient();
function registerShutdown(workerId, stop, waitForIdle) {
    const handle = async () => {
        await prisma.worker.update({ where: { id: workerId }, data: { status: "DRAINING" } });
        stop();
        await waitForIdle();
        process.exit(0);
    };
    process.on("SIGINT", handle);
    process.on("SIGTERM", handle);
}
