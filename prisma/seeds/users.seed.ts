import { scryptAsync } from "@noble/hashes/scrypt.js";
import type { PrismaClient } from "../../src/generated/prisma/client";

/**
 * Hash a password using scrypt (matching Better-Auth's implementation)
 * Uses the same config as Better-Auth for compatibility
 * Format: {salt}:{hash}
 */
async function hashPassword(password: string): Promise<string> {
  // Generate random salt (16 bytes as hex)
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Use exact same config as Better-Auth
  const key = await scryptAsync(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  });

  // Convert key to hex
  const keyHex = Array.from(key as Uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${salt}:${keyHex}`;
}

interface SeedResult {
  created: number;
  updated: number;
  skipped: number;
}

export async function seedUsers(prisma: PrismaClient): Promise<SeedResult> {
  const result: SeedResult = { created: 0, updated: 0, skipped: 0 };

  // Define users to seed (password is optional)
  const usersToSeed = [
    {
      id: crypto.randomUUID(),
      email: "johantv15@gmail.com",
      name: "Johan Tanta",
      role: "admin",
      emailVerified: true,
      banned: false,
      // No password - will use Google OAuth only
    },
    {
      id: crypto.randomUUID(),
      email: "ederson.flores7539@gmail.com",
      name: "Ederson Flores",
      role: "sales_agent",
      emailVerified: true,
      banned: false,
      password: "ederson123", // Plain password - will be hashed
    },
    {
      id: crypto.randomUUID(),
      email: "janetg2503@gmail.com",
      name: "Janet Villanueva",
      role: "sales_agent",
      emailVerified: true,
      banned: false,
      password: "janet123", // Plain password - will be hashed
    },
    {
      id: crypto.randomUUID(),
      email: "carlos.rodriguez@gmail.com",
      name: "Carlos Rodriguez",
      role: "sales_agent",
      emailVerified: true,
      banned: false,
      password: "carlos123", // Plain password - will be hashed
    },
    {
      id: crypto.randomUUID(),
      email: "maria.santos@gmail.com",
      name: "Maria Santos",
      role: "sales_agent",
      emailVerified: true,
      banned: false,
      password: "maria123", // Plain password - will be hashed
    },
  ] as Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    banned: boolean;
    password?: string; // Optional password
  }>;

  console.log(`\n👥 Seeding ${usersToSeed.length} users...`);

  for (const userData of usersToSeed) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // Check if update is needed
        if (
          existingUser.name !== userData.name ||
          existingUser.role !== userData.role
        ) {
          await prisma.user.update({
            where: { email: userData.email },
            data: {
              name: userData.name,
              role: userData.role,
            },
          });
          console.log(`   ✏️  Updated: ${userData.name} (${userData.email})`);
          result.updated++;
        } else {
          console.log(
            `   ⏭️  Skipped: ${userData.name} (${userData.email}) - Already exists`,
          );
          result.skipped++;
        }

        // Only create/update password account if password is provided
        if (userData.password) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              providerId: "credential",
            },
          });

          const hashedPassword = await hashPassword(userData.password);

          if (!existingAccount) {
            // Create password account for existing user
            await prisma.account.create({
              data: {
                id: crypto.randomUUID(),
                accountId: existingUser.id,
                providerId: "credential",
                userId: existingUser.id,
                password: hashedPassword,
              },
            });
            console.log(
              `   🔑 Added password authentication for: ${userData.email}`,
            );
          } else if (existingAccount.password?.startsWith("scrypt:")) {
            // Update old password format to new format
            await prisma.account.update({
              where: { id: existingAccount.id },
              data: { password: hashedPassword },
            });
            console.log(`   🔄 Updated password format for: ${userData.email}`);
          }
        }
      } else {
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            emailVerified: userData.emailVerified,
            banned: userData.banned,
          },
        });

        // Only create password account if password is provided
        if (userData.password) {
          const hashedPassword = await hashPassword(userData.password);
          await prisma.account.create({
            data: {
              id: crypto.randomUUID(),
              accountId: newUser.id,
              providerId: "credential",
              userId: newUser.id,
              password: hashedPassword,
            },
          });
        }

        console.log(`   ✅ Created: ${userData.name} (${userData.email})`);
        result.created++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${userData.email}:`, error);
    }
  }

  return result;
}
