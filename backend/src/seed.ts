import prisma from "./prisma.js";
import * as bcrypt from "bcrypt";

const password = await bcrypt.hash("admin369!", 10);

const adminUser = await prisma.user.findFirst({
  where: {
    roles: {
      has: "ADMIN",
    },
  },
});

if (!adminUser) {
  await prisma.user.create({
    data: {
      name: "admin",
      username: "admin",
      email: "admin@admin.com",
      password: {
        create: {
          hash: password,
        },
      },
      roles: ["ADMIN"],
    },
  });
}
