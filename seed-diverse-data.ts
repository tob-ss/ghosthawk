import "dotenv/config";
import { db } from "./server/db";
import { users, companies, experiences } from "./shared/schema";

// Demo users
const DEMO_USERS = [
  {
    id: "user-1",
    email: "demo1@example.com",
    firstName: "Alex",
    lastName: "Johnson",
    profileImageUrl: null
  },
  {
    id: "user-2", 
    email: "demo2@example.com",
    firstName: "Taylor",
    lastName: "Smith",
    profileImageUrl: null
  },
  {
    id: "user-3",
    email: "demo3@example.com", 
    firstName: "Jordan",
    lastName: "Brown",
    profileImageUrl: null
  }
];

// Diverse companies with different ghost risk profiles
const DIVERSE_COMPANIES = [
  // VERY LOW GHOST RISK (0-20%) - Excellent companies
  {
    name: "Stellar Tech Corp",
    type: "company" as const,
    industry: "Technology",
    location: "San Francisco, CA",
    description: "DEMO - Innovative tech company known for transparent hiring",
    responseProfile: { rate: 95, legitimateJobs: 90, interviews: 80, hires: 60 }
  },
  {
    name: "Honest Recruiting Partners",
    type: "recruiter" as const,
    industry: "Technology",
    location: "Austin, TX", 
    description: "DEMO - Transparent recruitment agency with great track record",
    responseProfile: { rate: 92, legitimateJobs: 85, interviews: 75, hires: 50 }
  },
  {
    name: "Transparent Healthcare Solutions",
    type: "company" as const,
    industry: "Healthcare",
    location: "Boston, MA",
    description: "DEMO - Healthcare company with excellent candidate experience",
    responseProfile: { rate: 88, legitimateJobs: 95, interviews: 70, hires: 45 }
  },

  // LOW GHOST RISK (21-40%) - Good companies
  {
    name: "Reliable Finance Group",
    type: "company" as const,
    industry: "Finance",
    location: "New York, NY",
    description: "DEMO - Established financial services with decent hiring practices",
    responseProfile: { rate: 75, legitimateJobs: 70, interviews: 60, hires: 35 }
  },
  {
    name: "Professional Staffing Inc",
    type: "recruiter" as const,
    industry: "Finance",
    location: "Chicago, IL",
    description: "DEMO - Mid-tier recruiting firm with mixed results",
    responseProfile: { rate: 70, legitimateJobs: 75, interviews: 55, hires: 30 }
  },
  {
    name: "Growing Marketing Agency",
    type: "company" as const,
    industry: "Marketing",
    location: "Los Angeles, CA",
    description: "DEMO - Fast-growing agency with evolving hiring practices",
    responseProfile: { rate: 68, legitimateJobs: 80, interviews: 50, hires: 28 }
  },

  // MEDIUM GHOST RISK (41-60%) - Questionable companies
  {
    name: "Inconsistent Corp",
    type: "company" as const,
    industry: "Technology",
    location: "Seattle, WA",
    description: "DEMO - Company with spotty communication and unclear processes",
    responseProfile: { rate: 50, legitimateJobs: 50, interviews: 40, hires: 20 }
  },
  {
    name: "Questionable Talent Solutions",
    type: "recruiter" as const,
    industry: "Healthcare",
    location: "Denver, CO",
    description: "DEMO - Recruitment firm with mixed reviews and unclear job postings",
    responseProfile: { rate: 45, legitimateJobs: 45, interviews: 35, hires: 15 }
  },
  {
    name: "Maybe Manufacturing",
    type: "company" as const,
    industry: "Manufacturing",
    location: "Detroit, MI",
    description: "DEMO - Manufacturing company with inconsistent hiring patterns",
    responseProfile: { rate: 40, legitimateJobs: 60, interviews: 30, hires: 12 }
  },

  // HIGH GHOST RISK (61-80%) - Problematic companies
  {
    name: "Vanishing Opportunities LLC",
    type: "company" as const,
    industry: "Technology",
    location: "Remote",
    description: "DEMO - Company known for posting jobs but rarely hiring",
    responseProfile: { rate: 25, legitimateJobs: 20, interviews: 15, hires: 5 }
  },
  {
    name: "Silent Recruiters Network",
    type: "recruiter" as const,
    industry: "Marketing",
    location: "Phoenix, AZ",
    description: "DEMO - Recruitment firm notorious for ghosting candidates",
    responseProfile: { rate: 20, legitimateJobs: 25, interviews: 20, hires: 8 }
  },
  {
    name: "Phantom Finance Solutions",
    type: "company" as const,
    industry: "Finance",
    location: "Miami, FL",
    description: "DEMO - Financial firm with poor candidate communication",
    responseProfile: { rate: 30, legitimateJobs: 15, interviews: 25, hires: 6 }
  },

  // VERY HIGH GHOST RISK (81-100%) - Worst companies
  {
    name: "Ghost Jobs Unlimited",
    type: "company" as const,
    industry: "Technology",
    location: "Anywhere, USA",
    description: "DEMO - Company that posts fake jobs to collect resumes",
    responseProfile: { rate: 10, legitimateJobs: 5, interviews: 8, hires: 2 }
  },
  {
    name: "Black Hole Recruiting",
    type: "recruiter" as const,
    industry: "Healthcare",
    location: "Las Vegas, NV",
    description: "DEMO - Recruitment agency where applications disappear forever",
    responseProfile: { rate: 5, legitimateJobs: 10, interviews: 5, hires: 1 }
  },
  {
    name: "Never Respond Manufacturing",
    type: "company" as const,
    industry: "Manufacturing",
    location: "Houston, TX", 
    description: "DEMO - Manufacturing company with terrible hiring reputation",
    responseProfile: { rate: 8, legitimateJobs: 8, interviews: 3, hires: 0 }
  }
];

const POSITIONS = [
  'Software Engineer', 'Senior Developer', 'Product Manager', 'Data Scientist',
  'Marketing Manager', 'Sales Representative', 'UX Designer', 'DevOps Engineer',
  'Business Analyst', 'Project Manager', 'Quality Assurance Engineer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'Account Manager', 'Financial Analyst'
];

const RESPONSE_TIMES = ['same_day', '1_3_days', '1_week', '2_weeks', '1_month', 'longer'] as const;
const COMMUNICATION_QUALITIES = ['excellent', 'good', 'fair', 'poor'] as const;

const POSITIVE_COMMENTS = [
  "DEMO - Great experience, very professional throughout the process",
  "DEMO - Quick response and clear communication about next steps", 
  "DEMO - Transparent about timeline and provided helpful feedback",
  "DEMO - Professional interview process, felt respected as a candidate",
  "DEMO - Even though I wasn't selected, they handled everything well"
];

const NEGATIVE_COMMENTS = [
  "DEMO - Never heard back after submitting application",
  "DEMO - Ghosted after initial phone screen, very unprofessional",
  "DEMO - Posted job seemed fake, no real follow-up",
  "DEMO - Waste of time, clearly wasn't a real opportunity", 
  "DEMO - Application disappeared into the void"
];

const NEUTRAL_COMMENTS = [
  "DEMO - Standard process, nothing remarkable either way",
  "DEMO - Took longer than expected but eventually got response",
  "DEMO - Average experience, could have been better communication",
  "DEMO - Process was okay, though could be more transparent"
];

function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate: Date, endDate: Date): Date {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function getRandomBool(probability: number): boolean {
  return Math.random() < (probability / 100);
}

async function seedDiverseData() {
  console.log("🌱 Creating diverse test data...");
  
  try {
    // Create demo users
    console.log("👥 Creating demo users...");
    await db.insert(users).values(DEMO_USERS);
    
    // Create companies
    console.log("🏢 Creating diverse companies...");
    const createdCompanies = [];
    for (const companyData of DIVERSE_COMPANIES) {
      const { responseProfile, ...companyInfo } = companyData;
      const [company] = await db.insert(companies).values(companyInfo).returning();
      createdCompanies.push({ ...company, responseProfile });
    }
    
    // Create diverse experiences for each company
    console.log("📝 Creating diverse candidate experiences...");
    const startDate = new Date('2023-06-01');
    const endDate = new Date();
    
    for (const company of createdCompanies) {
      const profile = company.responseProfile;
      // Create 8-15 experiences per company for good sample size
      const numExperiences = Math.floor(Math.random() * 8) + 8;
      
      let legitimateJobCount = 0;
      let interviewsOffered = 0;
      let jobsOffered = 0;
      
      for (let i = 0; i < numExperiences; i++) {
        const userId = getRandomItem(DEMO_USERS).id;
        const position = getRandomItem(POSITIONS);
        const applicationDate = getRandomDate(startDate, endDate);
        
        // Determine if they got a response based on company profile
        const receivedResponse = getRandomBool(profile.rate);
        
        // Determine if it's a legitimate job
        const isLegitimateJob = getRandomBool(profile.legitimateJobs);
        if (isLegitimateJob) legitimateJobCount++;
        
        // Determine interview and job outcomes
        const gotInterview = receivedResponse && getRandomBool(profile.interviews);
        if (gotInterview) interviewsOffered++;
        
        const gotJobOffer = gotInterview && getRandomBool(profile.hires);
        if (gotJobOffer) jobsOffered++;
        
        // Generate realistic experience data
        let responseTime = null;
        let communicationQuality = null;
        let comments = getRandomItem(NEUTRAL_COMMENTS);
        
        if (receivedResponse) {
          responseTime = getRandomItem(RESPONSE_TIMES);
          
          // Communication quality correlates with response rate
          if (profile.rate >= 80) {
            communicationQuality = Math.random() > 0.3 ? 'excellent' : 'good';
            comments = getRandomItem(POSITIVE_COMMENTS);
          } else if (profile.rate >= 50) {
            communicationQuality = getRandomItem(['good', 'fair', 'fair']);
          } else {
            communicationQuality = Math.random() > 0.5 ? 'fair' : 'poor';
          }
        } else {
          // No response - add negative comment sometimes
          if (Math.random() > 0.4) {
            comments = getRandomItem(NEGATIVE_COMMENTS);
          }
        }
        
        const experienceData = {
          userId,
          companyId: company.id,
          position,
          applicationDate,
          receivedResponse,
          responseTime,
          communicationQuality,
          comments,
          isAnonymous: Math.random() > 0.3, // Most experiences are anonymous
          interviewOffered: gotInterview || null,
          jobOffered: gotJobOffer || null,
          ghostJob: !isLegitimateJob, // false = legitimate job, true = ghost job
          rejectionFeedback: receivedResponse && !gotJobOffer && Math.random() > 0.6 || null,
          interviewStages: gotInterview ? getRandomItem(['phone', 'video', 'technical', 'onsite']) : null
        };
        
        await db.insert(experiences).values(experienceData);
      }
      
      console.log(`✅ ${company.name}: ${numExperiences} experiences (${Math.round((legitimateJobCount/numExperiences)*100)}% legitimate, ${interviewsOffered} interviews, ${jobsOffered} offers)`);
    }
    
    // Generate summary
    const totalCompanies = createdCompanies.length;
    const totalUsers = DEMO_USERS.length;
    const allExperiences = await db.select().from(experiences);
    
    console.log("🎉 Diverse test data created successfully!");
    console.log(`📊 Created: ${totalUsers} users, ${totalCompanies} companies, ${allExperiences.length} experiences`);
    console.log("🎯 Ghost risk distribution:");
    console.log("   • Very Low (0-20%): 3 companies");
    console.log("   • Low (21-40%): 3 companies");  
    console.log("   • Medium (41-60%): 3 companies");
    console.log("   • High (61-80%): 3 companies");
    console.log("   • Very High (81-100%): 3 companies");
    
  } catch (error) {
    console.error("❌ Error creating diverse data:", error);
    throw error;
  }
}

seedDiverseData().then(() => {
  console.log("✅ Database seeding completed!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});