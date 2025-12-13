import prisma from "../src/lib/db";
import { seedUsers } from "./seeds";

/**
 * Main seed orchestrator
 * Executes all seed functions in order and provides summary
 */
async function main() {
  console.log("🌱 Starting database seeding...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const startTime = Date.now();
  const summary = {
    totalCreated: 0,
    totalUpdated: 0,
    totalSkipped: 0,
  };

  // Execute seed functions
  try {
    // Seed Users (Admin + Sales Agents)
    const usersResult = await seedUsers(prisma);
    summary.totalCreated += usersResult.created;
    summary.totalUpdated += usersResult.updated;
    summary.totalSkipped += usersResult.skipped;

    // TODO: Add more seed functions here as needed
    // const leadsResult = await seedLeads(prisma);
    // const conversationsResult = await seedConversations(prisma);

    // Print summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Seeding Summary:");
    console.log(`   ✅ Created: ${summary.totalCreated}`);
    console.log(`   ✏️  Updated: ${summary.totalUpdated}`);
    console.log(`   ⏭️  Skipped: ${summary.totalSkipped}`);
    console.log(`   ⏱️  Duration: ${Date.now() - startTime}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Seeding failed:");
    console.error(error);
    throw error;
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
