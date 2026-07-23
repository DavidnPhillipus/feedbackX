import prisma from "./prisma.js";
import { setupSupabaseStorage } from "./setup-supabase-storage.js";
import * as bcrypt from "bcrypt";
import { stringifyRoles } from "./utils/roles.js";

async function main() {
  await setupSupabaseStorage();

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!adminEmail || !adminPassword) {
    console.log(
      "Seed skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin user."
    );
    return;
  }

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: adminUsername }, { email: adminEmail }] },
  });

  if (existing) {
    console.log(`Admin user already exists (${adminUsername})`);
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      verified: true,
      roles: stringifyRoles(["ADMIN", "USER"]),
      password: { create: { hash } },
    },
  });

  console.log(`Created admin user (${adminUsername})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
