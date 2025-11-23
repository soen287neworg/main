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

interface Seeder {
  name: string;
  seed: (prisma: PrismaClient) => Promise<void>;
  dependsOn: string[];
}

async function topologicalSort(
  seeders: Map<string, Seeder>
): Promise<Seeder[]> {
  const sorted: Seeder[] = [];
  const visited: Set<string> = new Set();
  const visiting: Set<string> = new Set();

  function visit(seeder: Seeder) {
    if (visited.has(seeder.name)) {
      return;
    }
    if (visiting.has(seeder.name)) {
      throw new Error(`Circular dependency detected: ${seeder.name}`);
    }

    visiting.add(seeder.name);

    for (const depName of seeder.dependsOn) {
      const dep = seeders.get(depName);
      if (!dep) {
        throw new Error(
          `Dependency '${depName}' not found for seeder '${seeder.name}'`
        );
      }
      visit(dep);
    }

    visiting.delete(seeder.name);
    visited.add(seeder.name);
    sorted.push(seeder);
  }

  seeders.forEach(visit);

  return sorted;
}

export async function main() {
  console.log("Starting seeding process...");
  try {
    const seedFiles = (await fs.readdir(seedingsDir)).filter((file) =>
      file.endsWith("-seed.ts")
    );
    const seeders = new Map<string, Seeder>();

    for (const file of seedFiles) {
      const filePath = path.join(seedingsDir, file);
      const seederModule = await import(pathToFileURL(filePath).href);
      const seeder = seederModule.default;
      if (seeder && typeof seeder.seed === "function") {
        seeders.set(seeder.name, seeder);
      } else {
        console.warn(
          `Seed file ${file} does not export a default object with a 'seed' function.`
        );
      }
    }

    const sortedSeeders = await topologicalSort(seeders);

    for (const seeder of sortedSeeders) {
      console.log(`Seeding ${seeder.name}...`);
      await seeder.seed(prisma);
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
