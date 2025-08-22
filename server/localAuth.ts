import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple local auth for development
export async function setupAuth(app: Express) {
  app.use(session({
    secret: 'local-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Mock login endpoint - creates a fake user session
  app.get("/api/login", async (req, res) => {
    // Create/upsert the dev user
    await storage.upsertUser({
      id: 'local-dev-user',
      email: 'dev@localhost.com',
      firstName: 'Dev',
      lastName: 'User',
    });

    (req.session as any).user = {
      claims: {
        sub: 'local-dev-user',
        email: 'dev@localhost.com',
        first_name: 'Dev',
        last_name: 'User'
      }
    };
    
    // Check for returnTo parameter and redirect accordingly
    const returnTo = req.query.returnTo as string;
    if (returnTo && returnTo.startsWith('/')) {
      // Only allow relative URLs for security
      res.redirect(returnTo);
    } else {
      res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = session.user;
  next();
};