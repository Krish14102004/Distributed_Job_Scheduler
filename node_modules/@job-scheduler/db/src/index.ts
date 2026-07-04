import dotenv from "dotenv";
import { PrismaClient as BasePrismaClient } from "@prisma/client";

dotenv.config();

export class PrismaClient extends BasePrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            "postgresql://scheduler:scheduler@localhost:5432/scheduler"
        }
      }
    });
  }
}
