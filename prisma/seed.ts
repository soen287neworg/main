import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "path";
import fs from "fs/promises";
import { pathToFileURL } from "url";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const seedingsDir = path.join(process.cwd(), "prisma", "seedings");

async function readSeedFiles(dir: string): Promise<string[]> {
  let files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await readSeedFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith("-seed.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function main() {
  console.log("Starting seeding process...");
  try {
    const seedFiles = await readSeedFiles(seedingsDir);
    for (const file of seedFiles) {
      console.log(`Seeding from ${file}...`);
      const seeder = await import(pathToFileURL(file).href);
      if (seeder.default && typeof seeder.default.seed === "function") {
        await seeder.default.seed(prisma);
        console.log(`Finished seeding from ${file}`);
      } else {
        console.warn(
          `Seed file ${file} does not export a default object with a 'seed' function.`
        );
      }
    }
    console.log("Seeding finished.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
