import "dotenv/config";
import { db } from "./db";
import { users, companies, experiences } from "@shared/schema";
import { eq } from "drizzle-orm";

// Clearly fictional companies for development/testing only
const SEED_COMPANIES = [
  {
    name: "Demo Tech Solutions LLC",
    type: "company" as const,
    industry: "Technology",
    location: "Fictional City, CA",
    description: "DEMO ONLY - Fictional software development company for testing purposes",
    website: "https://example.com/demo-tech"
  },
  {
    name: "Sample Recruiting Agency Inc",
    type: "recruiter" as const,
    industry: "Technology",
    location: "Test Town, NY",
    description: "DEMO ONLY - Fictional recruitment agency for testing purposes",
    website: "https://example.com/sample-recruiting"
  },
  {
    name: "Mock Healthcare Corp",
    type: "company" as const,
    industry: "Healthcare",
    location: "Example City, MA",
    description: "DEMO ONLY - Fictional healthcare technology company for testing purposes",
    website: "https://example.com/mock-healthcare"
  },
  {
    name: "Test Financial Services",
    type: "company" as const,
    industry: "Finance",
    location: "Demo District, IL",
    description: "DEMO ONLY - Fictional financial services company for testing purposes",
    website: "https://example.com/test-financial"
  },
  {
    name: "Prototype Marketing Agency",
    type: "recruiter" as const,
    industry: "Marketing",
    location: "Sample Springs, TX",
    description: "DEMO ONLY - Fictional marketing recruitment agency for testing purposes",
    website: "https://example.com/prototype-marketing"
  },
  {
    name: "Beta Manufacturing Co",
    type: "company" as const,
    industry: "Manufacturing",
    location: "Trial Town, OH",
    description: "DEMO ONLY - Fictional manufacturing company for testing purposes",
    website: "https://example.com/beta-manufacturing"
  },
  {
    name: "Alpha Consulting Group",
    type: "recruiter" as const,
    industry: "Consulting",
    location: "Mock Metro, WA",
    description: "DEMO ONLY - Fictional consulting recruitment firm for testing purposes",
    website: "https://example.com/alpha-consulting"
  }
];

// Generate realistic experience data patterns
const RESPONSE_TIMES = [
  'same_day', '1_3_days', '1_week', '2_weeks', '1_month', 'longer'
] as const;

const COMMUNICATION_QUALITIES = [
  'excellent', 'good', 'fair', 'poor'
] as const;

const POSITIONS = [
  'Software Engineer', 'Senior Developer', 'Product Manager', 'Data Scientist',
  'Marketing Manager', 'Sales Representative', 'UX Designer', 'DevOps Engineer',
  'Business Analyst', 'Project Manager', 'Quality Assurance Engineer', 'Frontend Developer'
];

const COMMENTS = [
  "DEMO DATA - Quick response and clear communication throughout the process.",
  "DEMO DATA - Took a while to hear back but the interview process was smooth.",
  "DEMO DATA - Never heard back after submitting application.",
  "DEMO DATA - Great communication, provided detailed feedback even for rejection.",
  "DEMO DATA - Application disappeared into a black hole - no response at all.",
  "DEMO DATA - Responsive and professional, kept me updated on next steps.",
  "DEMO DATA - Initial response was quick but then communication became sporadic.",
  "DEMO DATA - Excellent experience overall, very transparent about timeline.",
  "DEMO DATA - Ghosted after first interview - very unprofessional.",
  "DEMO DATA - Fair process, though took longer than expected to get feedback."
];

function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate: Date, endDate: Date): Date {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// Create a demo user for experiences
const DEMO_USER = {
  id: "demo-user-12345",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null
};

async function clearSeedData() {
  console.log("🧹 Clearing existing seed data...");
  
  // Delete experiences first (due to foreign key constraints)
  await db.delete(experiences).where(eq(experiences.userId, DEMO_USER.id));
  
  // Delete seed companies (those with "DEMO ONLY" in description)
  const seedCompanies = await db.select().from(companies);
  for (const company of seedCompanies) {
    if (company.description?.includes("DEMO ONLY")) {
      await db.delete(experiences).where(eq(experiences.companyId, company.id));
      await db.delete(companies).where(eq(companies.id, company.id));
    }
  }
  
  // Delete demo user
  await db.delete(users).where(eq(users.id, DEMO_USER.id));
  
  console.log("✅ Seed data cleared successfully");
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // First clear any existing seed data
    await clearSeedData();
    
    // Create demo user
    console.log("👤 Creating demo user...");
    await db.insert(users).values(DEMO_USER);
    
    // Create companies
    console.log("🏢 Creating demo companies...");
    const createdCompanies = [];
    for (const companyData of SEED_COMPANIES) {
      const [company] = await db.insert(companies).values(companyData).returning();
      createdCompanies.push(company);
    }
    
    // Create experiences for each company
    console.log("📝 Creating demo experiences...");
    const startDate = new Date('2023-01-01');
    const endDate = new Date();
    
    for (const company of createdCompanies) {
      // Create 3-8 experiences per company for variety
      const numExperiences = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numExperiences; i++) {
        const receivedResponse = Math.random() > 0.3; // 70% response rate overall
        const applicationDate = getRandomDate(startDate, endDate);
        
        const experienceData = {
          userId: DEMO_USER.id,
          companyId: company.id,
          position: getRandomItem(POSITIONS),
          applicationDate,
          receivedResponse,
          responseTime: receivedResponse ? getRandomItem(RESPONSE_TIMES) : null,
          communicationQuality: receivedResponse ? getRandomItem(COMMUNICATION_QUALITIES) : null,
          comments: getRandomItem(COMMENTS),
          isAnonymous: Math.random() > 0.5 // Mix of anonymous and non-anonymous
        } as const;
        
        await db.insert(experiences).values(experienceData);
      }
    }
    
    // Generate summary
    const totalCompanies = createdCompanies.length;
    const totalExperiences = await db.select().from(experiences).where(eq(experiences.userId, DEMO_USER.id));
    
    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Created ${totalCompanies} demo companies`);
    console.log(`📋 Created ${totalExperiences.length} demo experiences`);
    console.log("⚠️  Remember: This is test data only - clear before production!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === "clear") {
    await clearSeedData();
  } else {
    await seedDatabase();
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});