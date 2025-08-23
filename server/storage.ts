import {
  users,
  companies,
  experiences,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Experience,
  type InsertExperience,
  type SearchCompaniesInput,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  searchCompanies(params: SearchCompaniesInput): Promise<{
    companies: (Company & { 
      responseRate: number; 
      avgResponseTime: number | null; 
      totalExperiences: number;
      avgRating: number;
    })[];
    total: number;
  }>;

  // Experience operations
  createExperience(experience: InsertExperience): Promise<Experience>;
  getCompanyExperiences(companyId: string): Promise<Experience[]>;
  getUserExperiences(userId: string): Promise<Array<Experience & { company: Company | null }>>;
  getCompanyStats(companyId: string): Promise<{
    responseRate: number;
    avgResponseTime: number | null;
    totalExperiences: number;
    communicationBreakdown: Record<string, number>;
    ghostRating: number;
    ghostJobReports: number;
    legitimateJobReports: number;
    interviewsOffered: number;
    jobsOffered: number;
    legitimateJobPercentage: number;
    goodInterviewOutcomeRatio: number;
  }>;

  // Insights operations
  getIndustryInsights(): Promise<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number }>;
    topCompanies: { name: string; score: number }[];
    recentTrends: string[];
  }>;

  // Stats operations
  getStats(): Promise<{
    totalCompanies: number;
    totalExperiences: number;
    avgResponseRate: number;
  }>;
  
  getDetailedStats(): Promise<{
    communicationBreakdown: Record<string, number>;
    responseTimeBreakdown: Record<string, number>;
    companyTypeStats: Record<string, { count: number; avgResponseRate: number }>;
    monthlyTrends: { month: string; companies: number; experiences: number; responseRate: number }[];
    interviewStats: {
      interviewOfferRate: number;
      interviewToJobRate: number;
      interviewStagesBreakdown: Record<string, number>;
      industryInterviewRates: Record<string, number>;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(ilike(companies.name, name));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async searchCompanies(params: SearchCompaniesInput): Promise<{
    companies: (Company & { 
      responseRate: number; 
      avgResponseTime: number | null; 
      totalExperiences: number;
      avgRating: number;
    })[];
    total: number;
  }> {
    const { query, industry, location, type, responseRate, sortBy, page, limit } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (query) {
      conditions.push(ilike(companies.name, `%${query}%`));
    }
    if (industry) {
      conditions.push(eq(companies.industry, industry));
    }
    if (location) {
      conditions.push(ilike(companies.location, `%${location}%`));
    }
    if (type) {
      conditions.push(eq(companies.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get companies with stats
    const companiesWithStats = await db
      .select({
        id: companies.id,
        name: companies.name,
        type: companies.type,
        industry: companies.industry,
        location: companies.location,
        description: companies.description,
        website: companies.website,
        logoUrl: companies.logoUrl,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        totalExperiences: sql<number>`cast(count(${experiences.id}) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
        avgResponseTimeHours: sql<number>`avg(case 
          when ${experiences.responseTime} = 'same_day' then 0.5
          when ${experiences.responseTime} = '1_3_days' then 2
          when ${experiences.responseTime} = '1_week' then 7
          when ${experiences.responseTime} = '2_weeks' then 14
          when ${experiences.responseTime} = '1_month' then 30
          when ${experiences.responseTime} = 'longer' then 45
          else null
        end)`,
        communicationScore: sql<number>`avg(case 
          when ${experiences.communicationQuality} = 'excellent' then 5
          when ${experiences.communicationQuality} = 'good' then 4
          when ${experiences.communicationQuality} = 'fair' then 3
          when ${experiences.communicationQuality} = 'poor' then 2
          else 3
        end)`,
        // Ghost job algorithm data
        ghostJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = true then 1 else 0 end) as int)`,
        legitimateJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = false then 1 else 0 end) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
        jobsOffered: sql<number>`cast(sum(case when ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .where(whereClause)
      .groupBy(companies.id)
      .having(sql`count(${experiences.id}) > 0`);

    // Calculate derived metrics
    const companiesWithMetrics = companiesWithStats.map(company => {
      const responseRate = company.totalExperiences > 0 
        ? (company.responseCount / company.totalExperiences) * 100 
        : 0;
      
      // Will filter by response rate after this calculation

      // Calculate ghost job rating using our algorithm
      const legitimateJobPercentage = company.totalExperiences > 0 
        ? (company.legitimateJobReports / company.totalExperiences) * 100 
        : 0;
      
      const goodInterviewOutcomeRatio = company.interviewsOffered > 0
        ? (company.jobsOffered / company.interviewsOffered) * 100
        : 0;

      // Ghost Score = (100 - responseRate) * 0.4 + (100 - legitimateJobPercentage) * 0.4 + (100 - goodInterviewOutcomeRatio) * 0.2
      const ghostScore = Math.round(
        ((100 - responseRate) * 0.4) + 
        ((100 - legitimateJobPercentage) * 0.4) + 
        ((100 - goodInterviewOutcomeRatio) * 0.2)
      );

      // Debug logging for companies with 100% response rate but showing 40% ghost risk
      if (responseRate === 100 && ghostScore >= 40) {
        console.log(`=== DEBUG: ${company.name} (100% response, ${ghostScore}% ghost risk) ===`);
        console.log(`Response Rate: ${responseRate}%`);
        console.log(`Legitimate Job Reports: ${company.legitimateJobReports}/${company.totalExperiences} = ${legitimateJobPercentage}%`);
        console.log(`Interviews Offered: ${company.interviewsOffered}`);
        console.log(`Jobs Offered: ${company.jobsOffered}`);
        console.log(`Good Interview Outcome Ratio: ${goodInterviewOutcomeRatio}%`);
        console.log(`Calculation: ((100 - ${responseRate}) * 0.4) + ((100 - ${legitimateJobPercentage}) * 0.4) + ((100 - ${goodInterviewOutcomeRatio}) * 0.2) = ${ghostScore}`);
        console.log(`Raw communication score: ${company.communicationScore}`);
        console.log(`=== END DEBUG ===`);
      }


      return {
        ...company,
        responseRate: Math.round(responseRate),
        avgResponseTime: company.avgResponseTimeHours ? Math.round(company.avgResponseTimeHours * 10) / 10 : null,
        avgRating: Math.max(0, Math.min(100, ghostScore)), // Clamp between 0-100
      };
    });

    // Apply response rate filtering  
    const filteredCompanies = companiesWithMetrics.filter(company => {
      if (!responseRate) return true;
      if (responseRate === 'high') return company.responseRate >= 70;
      if (responseRate === 'medium') return company.responseRate >= 30 && company.responseRate < 70;
      if (responseRate === 'low') return company.responseRate < 30;
      return true;
    });

    // Sort results
    filteredCompanies.sort((a, b) => {
      switch (sortBy) {
        case 'response_rate':
          return b.responseRate - a.responseRate;
        case 'recent':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        case 'rating':
        default:
          return a.avgRating - b.avgRating; // Lower ghost score is better
      }
    });

    // Total count is handled by filteredCompanies.length

    // Apply pagination after sorting
    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);

    return {
      companies: paginatedCompanies,
      total: filteredCompanies.length, // Total count should be filtered companies, not separate calculation
    };
  }

  // Stats operations
  async getStats(): Promise<{
    totalCompanies: number;
    totalExperiences: number;
    avgResponseRate: number;
  }> {
    const [companiesCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(companies);

    const [experiencesStats] = await db
      .select({
        totalExperiences: sql<number>`cast(count(*) as int)`,
        respondedCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
      })
      .from(experiences);

    const avgResponseRate = experiencesStats.totalExperiences > 0 
      ? Math.round((experiencesStats.respondedCount / experiencesStats.totalExperiences) * 100)
      : 0;

    return {
      totalCompanies: companiesCount.count,
      totalExperiences: experiencesStats.totalExperiences,
      avgResponseRate,
    };
  }

  // Experience operations
  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [newExperience] = await db.insert(experiences).values(experience).returning();
    return newExperience;
  }

  async getCompanyExperiences(companyId: string): Promise<Experience[]> {
    return await db.select().from(experiences).where(eq(experiences.companyId, companyId));
  }

  async getUserExperiences(userId: string): Promise<Array<Experience & { company: Company | null }>> {
    return await db
      .select()
      .from(experiences)
      .leftJoin(companies, eq(experiences.companyId, companies.id))
      .where(eq(experiences.userId, userId))
      .orderBy(experiences.createdAt)
      .then(results => results.map(result => ({
        ...result.experiences,
        company: result.companies
      })));
  }

  async getCompanyStats(companyId: string): Promise<{
    responseRate: number;
    avgResponseTime: number | null;
    totalExperiences: number;
    communicationBreakdown: Record<string, number>;
  }> {
    const [stats] = await db
      .select({
        totalExperiences: sql<number>`cast(count(*) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
        avgResponseTimeHours: sql<number>`avg(case 
          when ${experiences.responseTime} = 'same_day' then 0.5
          when ${experiences.responseTime} = '1_3_days' then 2
          when ${experiences.responseTime} = '1_week' then 7
          when ${experiences.responseTime} = '2_weeks' then 14
          when ${experiences.responseTime} = '1_month' then 30
          when ${experiences.responseTime} = 'longer' then 45
          else null
        end)`,
        excellentCount: sql<number>`cast(sum(case when ${experiences.communicationQuality} = 'excellent' then 1 else 0 end) as int)`,
        goodCount: sql<number>`cast(sum(case when ${experiences.communicationQuality} = 'good' then 1 else 0 end) as int)`,
        fairCount: sql<number>`cast(sum(case when ${experiences.communicationQuality} = 'fair' then 1 else 0 end) as int)`,
        poorCount: sql<number>`cast(sum(case when ${experiences.communicationQuality} = 'poor' then 1 else 0 end) as int)`,
        // Ghost job algorithm data
        ghostJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = true then 1 else 0 end) as int)`,
        legitimateJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = false then 1 else 0 end) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
        jobsOffered: sql<number>`cast(sum(case when ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
      })
      .from(experiences)
      .where(eq(experiences.companyId, companyId));

    const responseRate = stats.totalExperiences > 0 
      ? (stats.responseCount / stats.totalExperiences) * 100 
      : 0;

    // Calculate ghost job metrics
    const legitimateJobPercentage = stats.totalExperiences > 0 
      ? (stats.legitimateJobReports / stats.totalExperiences) * 100 
      : 0;
    
    const goodInterviewOutcomeRatio = stats.interviewsOffered > 0
      ? (stats.jobsOffered / stats.interviewsOffered) * 100
      : 0;

    // Ghost Score = (100 - responseRate) * 0.4 + (100 - legitimateJobPercentage) * 0.4 + (100 - goodInterviewOutcomeRatio) * 0.2
    const ghostRating = Math.round(
      ((100 - responseRate) * 0.4) + 
      ((100 - legitimateJobPercentage) * 0.4) + 
      ((100 - goodInterviewOutcomeRatio) * 0.2)
    );

    return {
      responseRate: Math.round(responseRate),
      avgResponseTime: stats.avgResponseTimeHours ? Math.round(stats.avgResponseTimeHours * 10) / 10 : null,
      totalExperiences: stats.totalExperiences,
      communicationBreakdown: {
        excellent: stats.excellentCount,
        good: stats.goodCount,
        fair: stats.fairCount,
        poor: stats.poorCount,
      },
      ghostRating: Math.max(0, Math.min(100, ghostRating)),
      ghostJobReports: stats.ghostJobReports,
      legitimateJobReports: stats.legitimateJobReports,
      interviewsOffered: stats.interviewsOffered,
      jobsOffered: stats.jobsOffered,
      legitimateJobPercentage: Math.round(legitimateJobPercentage * 10) / 10,
      goodInterviewOutcomeRatio: Math.round(goodInterviewOutcomeRatio * 10) / 10,
    };
  }

  // Insights operations
  async getIndustryInsights(): Promise<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number; ghostRisk: number }>;
    topCompanies: { name: string; score: number; reportCount: number }[];
    recentTrends: string[];
  }> {
    // Get industry stats with ghost risk calculation
    const industryData = await db
      .select({
        industry: companies.industry,
        companyId: companies.id,
        totalExperiences: sql<number>`cast(count(*) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
        legitimateJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = false then 1 else 0 end) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
        jobsOffered: sql<number>`cast(sum(case when ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
        avgResponseTimeHours: sql<number>`avg(case 
          when ${experiences.responseTime} = 'same_day' then 0.5
          when ${experiences.responseTime} = '1_3_days' then 2
          when ${experiences.responseTime} = '1_week' then 7
          when ${experiences.responseTime} = '2_weeks' then 14
          when ${experiences.responseTime} = '1_month' then 30
          when ${experiences.responseTime} = 'longer' then 45
          else null
        end)`,
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .where(sql`${companies.industry} IS NOT NULL`)
      .groupBy(companies.industry, companies.id)
      .having(sql`count(${experiences.id}) > 0`);

    // Calculate ghost risk for each company, then average by industry
    const industryGhostRisks: Record<string, number[]> = {};
    const industryResponseRates: Record<string, number[]> = {};
    const industryResponseTimes: Record<string, number[]> = {};

    industryData.forEach(company => {
      if (company.industry) {
        // Calculate ghost score for this company (same logic as searchCompanies)
        const responseRate = company.totalExperiences > 0 
          ? (company.responseCount / company.totalExperiences) * 100 
          : 0;
        
        const legitimateJobPercentage = company.totalExperiences > 0
          ? (company.legitimateJobReports / company.totalExperiences) * 100
          : 0;

        const goodInterviewOutcomeRatio = company.interviewsOffered > 0
          ? (company.jobsOffered / company.interviewsOffered) * 100
          : 0;

        const ghostScore = Math.round(
          ((100 - responseRate) * 0.4) + 
          ((100 - legitimateJobPercentage) * 0.4) + 
          ((100 - goodInterviewOutcomeRatio) * 0.2)
        );

        // Group by industry
        if (!industryGhostRisks[company.industry]) {
          industryGhostRisks[company.industry] = [];
          industryResponseRates[company.industry] = [];
          industryResponseTimes[company.industry] = [];
        }
        
        industryGhostRisks[company.industry].push(ghostScore);
        industryResponseRates[company.industry].push(responseRate);
        if (company.avgResponseTimeHours) {
          industryResponseTimes[company.industry].push(company.avgResponseTimeHours);
        }
      }
    });

    // Calculate averages by industry
    const industryStats: Record<string, { responseRate: number; avgResponseTime: number; ghostRisk: number }> = {};
    Object.keys(industryGhostRisks).forEach(industry => {
      const ghostRisks = industryGhostRisks[industry];
      const responsRates = industryResponseRates[industry];
      const responseTimes = industryResponseTimes[industry];
      
      industryStats[industry] = {
        ghostRisk: Math.round(ghostRisks.reduce((a, b) => a + b, 0) / ghostRisks.length),
        responseRate: Math.round(responsRates.reduce((a, b) => a + b, 0) / responsRates.length),
        avgResponseTime: responseTimes.length > 0 
          ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10
          : 0,
      };
    });

    // Get most reported companies with ghost risk scores
    const mostReportedCompaniesData = await db
      .select({
        name: companies.name,
        totalExperiences: sql<number>`cast(count(*) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
        legitimateJobReports: sql<number>`cast(sum(case when ${experiences.ghostJob} = false then 1 else 0 end) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
        jobsOffered: sql<number>`cast(sum(case when ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .groupBy(companies.id, companies.name)
      .having(sql`count(*) >= 1`)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const topCompanies = mostReportedCompaniesData.map(company => {
      // Calculate ghost risk score for each company
      const responseRate = company.totalExperiences > 0 
        ? (company.responseCount / company.totalExperiences) * 100 
        : 0;
      
      const legitimateJobPercentage = company.totalExperiences > 0
        ? (company.legitimateJobReports / company.totalExperiences) * 100
        : 0;

      const goodInterviewOutcomeRatio = company.interviewsOffered > 0
        ? (company.jobsOffered / company.interviewsOffered) * 100
        : 0;

      const ghostScore = Math.round(
        ((100 - responseRate) * 0.4) + 
        ((100 - legitimateJobPercentage) * 0.4) + 
        ((100 - goodInterviewOutcomeRatio) * 0.2)
      );

      return {
        name: company.name,
        score: ghostScore,
        reportCount: company.totalExperiences,
      };
    });

    // Mock recent trends for now
    const recentTrends = [
      "Healthcare companies have improved response rates by 12% this quarter",
      "Several recruitment agencies showing increased ghosting patterns", 
      "Best response rates occur on Tuesday-Thursday applications"
    ];

    return {
      industryStats,
      topCompanies,
      recentTrends,
    };
  }

  async getDetailedStats(): Promise<{
    communicationBreakdown: Record<string, number>;
    responseTimeBreakdown: Record<string, number>;
    companyTypeStats: Record<string, { count: number; avgResponseRate: number }>;
    monthlyTrends: { month: string; companies: number; experiences: number; responseRate: number }[];
  }> {
    // Get communication quality breakdown
    const communicationData = await db
      .select({
        quality: experiences.communicationQuality,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(experiences)
      .where(sql`${experiences.communicationQuality} IS NOT NULL`)
      .groupBy(experiences.communicationQuality);

    const communicationBreakdown: Record<string, number> = {};
    communicationData.forEach(item => {
      if (item.quality) {
        communicationBreakdown[item.quality] = item.count;
      }
    });

    // Get response time breakdown
    const responseTimeData = await db
      .select({
        responseTime: experiences.responseTime,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(experiences)
      .where(sql`${experiences.responseTime} IS NOT NULL`)
      .groupBy(experiences.responseTime);

    const responseTimeBreakdown: Record<string, number> = {};
    responseTimeData.forEach(item => {
      if (item.responseTime) {
        responseTimeBreakdown[item.responseTime] = item.count;
      }
    });

    // Get company type statistics
    const companyTypeData = await db
      .select({
        type: companies.type,
        companyCount: sql<number>`cast(count(distinct ${companies.id}) as int)`,
        totalExperiences: sql<number>`cast(count(${experiences.id}) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .groupBy(companies.type);

    const companyTypeStats: Record<string, { count: number; avgResponseRate: number }> = {};
    companyTypeData.forEach(item => {
      const responseRate = item.totalExperiences > 0 
        ? Math.round((item.responseCount / item.totalExperiences) * 100) 
        : 0;
      
      companyTypeStats[item.type] = {
        count: item.companyCount,
        avgResponseRate: responseRate,
      };
    });

    // Generate monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${experiences.createdAt}, 'YYYY-MM')`,
        companies: sql<number>`cast(count(distinct ${experiences.companyId}) as int)`,
        experiences: sql<number>`cast(count(*) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
      })
      .from(experiences)
      .where(sql`${experiences.createdAt} >= ${sixMonthsAgo}`)
      .groupBy(sql`to_char(${experiences.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${experiences.createdAt}, 'YYYY-MM')`);

    const monthlyTrends = monthlyData.map(month => ({
      month: month.month,
      companies: month.companies,
      experiences: month.experiences,
      responseRate: month.experiences > 0 
        ? Math.round((month.responseCount / month.experiences) * 100) 
        : 0,
    }));

    // Calculate interview statistics
    const [interviewStatsData] = await db
      .select({
        totalExperiences: sql<number>`cast(count(*) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
        jobsOffered: sql<number>`cast(sum(case when ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
        interviewsToJobs: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true and ${experiences.jobOffered} = true then 1 else 0 end) as int)`,
      })
      .from(experiences);

    const interviewOfferRate = interviewStatsData.totalExperiences > 0 
      ? Math.round((interviewStatsData.interviewsOffered / interviewStatsData.totalExperiences) * 100)
      : 0;

    const interviewToJobRate = interviewStatsData.interviewsOffered > 0 
      ? Math.round((interviewStatsData.interviewsToJobs / interviewStatsData.interviewsOffered) * 100)
      : 0;

    // Get interview stages breakdown
    const interviewStagesData = await db
      .select({
        stages: experiences.interviewStages,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(experiences)
      .where(sql`${experiences.interviewStages} IS NOT NULL`)
      .groupBy(experiences.interviewStages);

    const interviewStagesBreakdown: Record<string, number> = {};
    interviewStagesData.forEach(item => {
      if (item.stages) {
        // Split comma-separated stages and count each individually
        const stages = item.stages.split(',').map(s => s.trim());
        stages.forEach(stage => {
          interviewStagesBreakdown[stage] = (interviewStagesBreakdown[stage] || 0) + item.count;
        });
      }
    });

    // Get interview rates by industry
    const industryInterviewData = await db
      .select({
        industry: companies.industry,
        totalExperiences: sql<number>`cast(count(${experiences.id}) as int)`,
        interviewsOffered: sql<number>`cast(sum(case when ${experiences.interviewOffered} = true then 1 else 0 end) as int)`,
      })
      .from(experiences)
      .leftJoin(companies, eq(experiences.companyId, companies.id))
      .where(sql`${companies.industry} IS NOT NULL`)
      .groupBy(companies.industry);

    const industryInterviewRates: Record<string, number> = {};
    industryInterviewData.forEach(item => {
      if (item.industry && item.totalExperiences > 0) {
        industryInterviewRates[item.industry] = Math.round((item.interviewsOffered / item.totalExperiences) * 100);
      }
    });

    return {
      communicationBreakdown,
      responseTimeBreakdown,
      companyTypeStats,
      monthlyTrends,
      interviewStats: {
        interviewOfferRate,
        interviewToJobRate,
        interviewStagesBreakdown,
        industryInterviewRates,
      },
    };
  }
}

export const storage = new DatabaseStorage();
