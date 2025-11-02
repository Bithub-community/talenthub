import { prisma } from "../src/client";
import { predefinedSectors } from "../src/constants";

async function seed() {
  // Seed predefined sectors
  await Promise.all(
    predefinedSectors.map((name, index) =>
      prisma.sector.upsert({
        where: { code: `sector-${index + 1}` },
        update: { name },
        create: {
          code: `sector-${index + 1}`,
          name
        }
      })
    )
  );

  // Create default super user for demos without password (token-based auth only)
  await prisma.user.upsert({
    where: { userName: "super-admin" },
    update: {
      status: "active"
    },
    create: {
      userName: "super-admin",
      email: "super@example.com",
      status: "active"
    }
  });

  console.log("Super user created/updated successfully");
  console.log("Username: super-admin");
  console.log("Email: super@example.com");
  console.log("Note: No password or auth key setup is performed by this seed script.");
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
