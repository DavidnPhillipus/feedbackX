import prisma from "./prisma.js";
import { setupSupabaseStorage } from "./setup-supabase-storage.js";
import * as bcrypt from "bcrypt";
import { stringifyRoles } from "./utils/roles.js";
import { stringifyTags } from "./utils/tags.js";
import { nanoid } from "nanoid";

async function main() {
  await setupSupabaseStorage();

  const password = await bcrypt.hash("admin369!", 10);

  const adminUser = await prisma.user.findFirst({
    where: { username: "admin" },
  });

  let adminId = adminUser?.id;

  if (!adminUser) {
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        username: "admin",
        email: "admin@admin.com",
        roles: stringifyRoles(["ADMIN", "USER"]),
        password: { create: { hash: password } },
      },
    });
    adminId = admin.id;
    console.log("Created admin user (admin / admin369!)");
  }

  const demoUser = await prisma.user.findFirst({
    where: { username: "demo_user" },
  });

  let demoId = demoUser?.id;

  if (!demoUser) {
    const demo = await prisma.user.create({
      data: {
        name: "Demo User",
        username: "demo_user",
        email: "demo@feedbackx.com",
        roles: stringifyRoles(["USER"]),
        bio: "Designer sharing work-in-progress for peer feedback.",
        avatarUrl: "https://i.pravatar.cc/150?img=9",
        password: { create: { hash: await bcrypt.hash("Demo1234!", 10) } },
      },
    });
    demoId = demo.id;
    console.log("Created demo user (demo_user / Demo1234!)");
  }

  const postCount = await prisma.post.count();
  if (postCount === 0 && demoId) {
    const samplePosts = [
      {
        title: "Design critique: landing hero",
        body: "Looking for feedback on hero section spacing and copy.",
        tags: ["Design"],
        imageUrl: "https://picsum.photos/600/400?image=10",
      },
      {
        title: "Prototype usability test results",
        body: "Summary of the first round of usability tests.",
        tags: ["UX"],
        imageUrl: "https://picsum.photos/600/400?image=20",
      },
      {
        title: "Experimenting with micro-interactions",
        body: "Micro-interactions for button states and animations.",
        tags: ["Frontend"],
        imageUrl: "https://picsum.photos/600/400?image=30",
      },
      {
        title: "New color palette exploration",
        body: "Testing accessibility-first color schemes.",
        tags: ["Design"],
        imageUrl: "https://picsum.photos/600/400?image=40",
      },
    ];

    for (const p of samplePosts) {
      await prisma.post.create({
        data: {
          title: p.title,
          body: p.body,
          imageUrl: p.imageUrl,
          userId: demoId,
          tags: stringifyTags(p.tags),
        },
      });
    }
    console.log(`Seeded ${samplePosts.length} sample posts`);
  }

  const inviteCount = await prisma.invite.count();
  if (inviteCount === 0 && adminId && demoId) {
    await prisma.invite.createMany({
      data: [
        {
          code: nanoid(10),
          inviterId: adminId,
          title: "Design Review Room",
          about: "Join our weekly design critique session",
          avatar: "https://i.pravatar.cc/80?img=12",
          roomId: "room-design",
        },
        {
          code: nanoid(10),
          inviterId: demoId,
          title: "Frontend Feedback",
          about: "React component review and best practices",
          avatar: "https://i.pravatar.cc/80?img=15",
          roomId: "room-frontend",
        },
      ],
    });
    console.log("Seeded sample invites");
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
