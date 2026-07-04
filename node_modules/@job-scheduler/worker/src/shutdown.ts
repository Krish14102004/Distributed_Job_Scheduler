import { PrismaClient } from "@job-scheduler/db";

const prisma = new PrismaClient();

export function registerShutdown(workerId: string, stop: () => void, waitForIdle: () => Promise<void>) {
  const handle = async () => {
    await prisma.worker.update({ where: { id: workerId }, data: { status: "DRAINING" } });
    stop();
    await waitForIdle();
    process.exit(0);
  };

  process.on("SIGINT", handle);
  process.on("SIGTERM", handle);
}
