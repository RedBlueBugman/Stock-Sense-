import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function applyDbAssets() {
  const sql = fs.readFileSync(path.join(__dirname, "views_and_triggers.sql"), "utf-8");
  await prisma.$executeRawUnsafe(sql);
  console.log("   ✅ Database Triggers and Views successfully registered in PostgreSQL.");
}

applyDbAssets()
  .catch((err) => console.error("   ❌ Failed applying SQL views/triggers:", err.message))
  .finally(() => prisma.$disconnect());
