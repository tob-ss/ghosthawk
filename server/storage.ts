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
  getUserExperiences(userId: string): Promise<Experience[]>;
  getCompanyStats(companyId: string): Promise<{
    responseRate: number;
    avgResponseTime: number | null;
    totalExperiences: number;
    communicationBreakdown: Record<string, number>;
  }>;

  // Insights operations
  getIndustryInsights(): Promise<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number }>;
    topCompanies: { name: string; score: number }[];
    recentTrends: string[];
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
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .where(whereClause)
      .groupBy(companies.id)
      .having(sql`count(${experiences.id}) > 0`)
      .offset(offset)
      .limit(limit);

    // Calculate derived metrics
    const companiesWithMetrics = companiesWithStats.map(company => {
      const responseRate = company.totalExperiences > 0 
        ? (company.responseCount / company.totalExperiences) * 100 
        : 0;
      
      // Will filter by response rate after this calculation

      return {
        ...company,
        responseRate: Math.round(responseRate),
        avgResponseTime: company.avgResponseTimeHours || null,
        avgRating: Math.round((company.communicationScore || 3) * 100) / 100,
      };
    }).filter(company => {
      if (!responseRate) return true;
      if (responseRate === 'high') return company.responseRate >= 70;
      if (responseRate === 'medium') return company.responseRate >= 30 && company.responseRate < 70;
      if (responseRate === 'low') return company.responseRate < 30;
      return true;
    });

    // Sort results
    companiesWithMetrics.sort((a, b) => {
      switch (sortBy) {
        case 'response_rate':
          return b.responseRate - a.responseRate;
        case 'recent':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        case 'rating':
        default:
          return b.avgRating - a.avgRating;
      }
    });

    // Get total count - count distinct companies that have experiences
    const totalCountResult = await db
      .select({ 
        companyId: companies.id,
        experienceCount: sql<number>`cast(count(${experiences.id}) as int)`
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .where(whereClause)
      .groupBy(companies.id)
      .having(sql`count(${experiences.id}) > 0`);
    
    const totalCount = totalCountResult.length;

    return {
      companies: companiesWithMetrics,
      total: totalCount,
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

  async getUserExperiences(userId: string): Promise<Experience[]> {
    return await db.select().from(experiences).where(eq(experiences.userId, userId));
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
      })
      .from(experiences)
      .where(eq(experiences.companyId, companyId));

    const responseRate = stats.totalExperiences > 0 
      ? (stats.responseCount / stats.totalExperiences) * 100 
      : 0;

    return {
      responseRate: Math.round(responseRate),
      avgResponseTime: stats.avgResponseTimeHours || null,
      totalExperiences: stats.totalExperiences,
      communicationBreakdown: {
        excellent: stats.excellentCount,
        good: stats.goodCount,
        fair: stats.fairCount,
        poor: stats.poorCount,
      },
    };
  }

  // Insights operations
  async getIndustryInsights(): Promise<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number }>;
    topCompanies: { name: string; score: number }[];
    recentTrends: string[];
  }> {
    // Get industry stats
    const industryData = await db
      .select({
        industry: companies.industry,
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
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .where(sql`${companies.industry} IS NOT NULL`)
      .groupBy(companies.industry)
      .having(sql`count(${experiences.id}) > 0`);

    const industryStats: Record<string, { responseRate: number; avgResponseTime: number }> = {};
    industryData.forEach(industry => {
      if (industry.industry) {
        industryStats[industry.industry] = {
          responseRate: Math.round((industry.responseCount / industry.totalExperiences) * 100),
          avgResponseTime: Math.round((industry.avgResponseTimeHours || 0) * 10) / 10,
        };
      }
    });

    // Get top companies
    const topCompaniesData = await db
      .select({
        name: companies.name,
        totalExperiences: sql<number>`cast(count(*) as int)`,
        responseCount: sql<number>`cast(sum(case when ${experiences.receivedResponse} then 1 else 0 end) as int)`,
        communicationScore: sql<number>`avg(case 
          when ${experiences.communicationQuality} = 'excellent' then 5
          when ${experiences.communicationQuality} = 'good' then 4
          when ${experiences.communicationQuality} = 'fair' then 3
          when ${experiences.communicationQuality} = 'poor' then 2
          else 3
        end)`,
      })
      .from(companies)
      .leftJoin(experiences, eq(companies.id, experiences.companyId))
      .groupBy(companies.id, companies.name)
      .having(sql`count(*) >= 5`)
      .orderBy(desc(sql`avg(case 
        when ${experiences.communicationQuality} = 'excellent' then 5
        when ${experiences.communicationQuality} = 'good' then 4
        when ${experiences.communicationQuality} = 'fair' then 3
        when ${experiences.communicationQuality} = 'poor' then 2
        else 3
      end)`))
      .limit(5);

    const topCompanies = topCompaniesData.map(company => ({
      name: company.name,
      score: Math.round((company.communicationScore || 3) * 100) / 100,
    }));

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
}

export const storage = new DatabaseStorage();
