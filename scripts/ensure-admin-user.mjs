import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const { hash } = bcrypt;

loadDotEnv();

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD ?? "";

if (!adminEmail || adminPassword.length < 6) {
  console.error("ADMIN_EMAIL or ADMIN_PASSWORD is missing/invalid. Password must be at least 6 chars.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await hash(adminPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Admin", passwordHash },
    create: { email: adminEmail, name: "Admin", passwordHash },
    select: { id: true, email: true, name: true, updatedAt: true }
  });

  console.log(`Admin user is ready: ${user.email}`);
} finally {
  await prisma.$disconnect();
}

function loadDotEnv(path = ".env") {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] ??= value;
  }
}
