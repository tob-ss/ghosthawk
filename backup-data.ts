import "dotenv/config";
import { db } from "./server/db";
import { users, companies, experiences } from "./shared/schema";
import { writeFileSync } from "fs";

async function backupData() {
  console.log("📦 Creating data backup...");
  
  try {
    // Get all data
    const allUsers = await db.select().from(users);
    const allCompanies = await db.select().from(companies);
    const allExperiences = await db.select().from(experiences);
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: allUsers,
      companies: allCompanies,
      experiences: allExperiences
    };
    
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${filename}`);
    console.log(`📊 Backed up: ${allUsers.length} users, ${allCompanies.length} companies, ${allExperiences.length} experiences`);
    
  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  }
}

backupData().then(() => process.exit(0)).catch(() => process.exit(1));