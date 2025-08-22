import "dotenv/config";
import { db } from "./server/db";
import { users, companies, experiences } from "./shared/schema";
import { readFileSync } from "fs";

async function clearAllData() {
  console.log("🗑️ Clearing all existing data...");
  
  try {
    // Delete in order due to foreign key constraints
    await db.delete(experiences);
    await db.delete(companies);
    await db.delete(users);
    
    console.log("✅ All data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }
}

async function restoreData(backupFile: string) {
  console.log(`📥 Restoring data from ${backupFile}...`);
  
  try {
    const backupContent = readFileSync(backupFile, 'utf-8');
    const backup = JSON.parse(backupContent);
    
    console.log(`📊 Backup contains: ${backup.users.length} users, ${backup.companies.length} companies, ${backup.experiences.length} experiences`);
    console.log(`📅 Backup created: ${backup.timestamp}`);
    
    // Restore users first
    if (backup.users.length > 0) {
      const usersData = backup.users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));
      await db.insert(users).values(usersData);
      console.log(`👥 Restored ${backup.users.length} users`);
    }
    
    // Restore companies
    if (backup.companies.length > 0) {
      const companiesData = backup.companies.map((company: any) => ({
        ...company,
        createdAt: new Date(company.createdAt),
        updatedAt: new Date(company.updatedAt)
      }));
      await db.insert(companies).values(companiesData);
      console.log(`🏢 Restored ${backup.companies.length} companies`);
    }
    
    // Restore experiences
    if (backup.experiences.length > 0) {
      const experiencesData = backup.experiences.map((experience: any) => ({
        ...experience,
        applicationDate: new Date(experience.applicationDate),
        createdAt: new Date(experience.createdAt),
        updatedAt: new Date(experience.updatedAt)
      }));
      await db.insert(experiences).values(experiencesData);
      console.log(`📝 Restored ${backup.experiences.length} experiences`);
    }
    
    console.log("✅ Data restoration completed successfully!");
    
  } catch (error) {
    console.error("❌ Error restoring data:", error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];
  const backupFile = process.argv[3];
  
  if (command === "clear") {
    await clearAllData();
  } else if (command === "restore" && backupFile) {
    await restoreData(backupFile);
  } else if (command === "test" && backupFile) {
    // Test complete backup/recovery cycle
    console.log("🧪 Testing complete backup/recovery cycle...");
    await clearAllData();
    await restoreData(backupFile);
    console.log("✅ Test completed successfully!");
  } else {
    console.log("Usage:");
    console.log("  npx tsx restore-data.ts clear");
    console.log("  npx tsx restore-data.ts restore <backup-file>");
    console.log("  npx tsx restore-data.ts test <backup-file>");
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});