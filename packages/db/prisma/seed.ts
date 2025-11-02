import { prisma } from "../src/client";
import { predefinedSectors } from "../src/constants";

async function seed() {
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

  // create default super user for demos
  await prisma.user.upsert({
    where: { userName: "super-admin" },
    update: {},
    create: {
      userName: "super-admin",
      email: "super@example.com",
      role: "super_user",
      status: "active"
    }
  });
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
