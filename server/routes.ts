import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertExperienceSchema, 
  searchCompaniesSchema,
  insertCompanySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company routes
  app.get("/api/companies/search", async (req, res) => {
    try {
      // Mock company data for demo
      const mockCompanies = [
        {
          id: "1",
          name: "TechCorp Solutions",
          type: "company",
          industry: "Technology",
          location: "San Francisco, CA",
          description: "Leading software development company",
          website: "https://techcorp.com",
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          responseRate: 78,
          avgResponseTime: 2.3,
          totalExperiences: 45,
          avgRating: 4.2
        },
        {
          id: "2", 
          name: "ProRecruit Agency",
          type: "recruiter",
          industry: "Technology",
          location: "New York, NY",
          description: "Technical recruitment specialists",
          website: "https://prorecruit.com",
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          responseRate: 34,
          avgResponseTime: 8.1,
          totalExperiences: 23,
          avgRating: 2.8
        },
        {
          id: "3",
          name: "HealthTech Inc",
          type: "company", 
          industry: "Healthcare",
          location: "Boston, MA",
          description: "Healthcare technology innovation",
          website: "https://healthtech.com",
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          responseRate: 65,
          avgResponseTime: 4.2,
          totalExperiences: 31,
          avgRating: 3.9
        }
      ];

      res.json({
        companies: mockCompanies,
        total: mockCompanies.length
      });
    } catch (error) {
      console.error("Error searching companies:", error);
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const stats = await storage.getCompanyStats(id);
      const experiences = await storage.getCompanyExperiences(id);

      res.json({
        ...company,
        stats,
        experiences: experiences.filter(exp => !exp.isAnonymous || !exp.userId).map(exp => ({
          id: exp.id,
          position: exp.position,
          applicationDate: exp.applicationDate,
          receivedResponse: exp.receivedResponse,
          responseTime: exp.responseTime,
          communicationQuality: exp.communicationQuality,
          comments: exp.comments,
          createdAt: exp.createdAt,
        }))
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Experience routes
  app.post("/api/experiences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertExperienceSchema.parse(req.body);
      
      // Find or create company
      let company = await storage.getCompanyByName(data.companyName);
      
      if (!company) {
        company = await storage.createCompany({
          name: data.companyName,
          type: data.companyType,
          industry: data.companyIndustry,
        });
      }

      // Create experience
      console.log("Creating experience for user:", userId, "anonymous:", data.isAnonymous);
      const experience = await storage.createExperience({
        userId: userId, // Always store user ID so they can see their own experiences
        companyId: company.id,
        position: data.position,
        applicationDate: data.applicationDate,
        receivedResponse: data.receivedResponse,
        responseTime: data.responseTime,
        communicationQuality: data.communicationQuality,
        comments: data.comments,
        isAnonymous: data.isAnonymous,
      });
      console.log("Created experience:", experience.id, "for user:", experience.userId);

      res.status(201).json(experience);
    } catch (error) {
      console.error("Error creating experience:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create experience" });
    }
  });

  app.get("/api/experiences/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Fetching experiences for user ID:", userId);
      const experiences = await storage.getUserExperiences(userId);
      console.log("Found experiences:", experiences.length);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching user experiences:", error);
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  // Insights routes
  app.get("/api/insights", async (req, res) => {
    try {
      // Mock insights data for demo
      const insights = {
        industryStats: {
          "Technology": { responseRate: 45, avgResponseTime: 3.2 },
          "Finance": { responseRate: 38, avgResponseTime: 5.1 },
          "Healthcare": { responseRate: 42, avgResponseTime: 4.8 },
          "Marketing": { responseRate: 29, avgResponseTime: 6.2 }
        },
        topCompanies: [
          { name: "TechCorp", score: 4.2 },
          { name: "InnovateCo", score: 4.1 },
          { name: "DevHub", score: 4.0 }
        ],
        recentTrends: [
          "Healthcare companies have improved response rates by 12% this quarter",
          "Several recruitment agencies showing increased ghosting patterns",
          "Best response rates occur on Tuesday-Thursday applications"
        ]
      };
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // Stats route for homepage
  app.get("/api/stats", async (req, res) => {
    try {
      res.json({
        totalCompanies: 156,
        totalExperiences: 2834,
        avgResponseRate: 34,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
