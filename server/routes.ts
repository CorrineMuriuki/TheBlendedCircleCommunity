import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { initiateSTKPush, processSTKCallback } from "./mpesa";

if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
  console.warn('M-PESA API credentials not provided. Payment functionality will be limited.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  setupWebSocket(httpServer);

  // Chat space routes
  app.get("/api/chat-spaces", async (req, res, next) => {
    try {
      const isAuthenticated = req.isAuthenticated();
      const spaces = await storage.getChatSpaces(isAuthenticated ? req.user.id : null);
      res.json(spaces);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat-spaces/:id", async (req, res, next) => {
    try {
      const spaceId = parseInt(req.params.id);
      if (isNaN(spaceId)) {
        return res.status(400).json({ message: "Invalid chat space ID" });
      }

      const space = await storage.getChatSpaceById(spaceId);
      if (!space) {
        return res.status(404).json({ message: "Chat space not found" });
      }

      // Check if space is private and user has access
      if (space.isPrivate && (!req.isAuthenticated() || !await storage.hasAccessToChatSpace(req.user.id, spaceId))) {
        return res.status(403).json({ message: "You don't have access to this chat space" });
      }

      res.json(space);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chat-spaces", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a chat space" });
    }

    try {
      // Check subscription tier for private spaces
      if (req.body.isPrivate && req.user.subscriptionTier === 'free') {
        return res.status(403).json({ message: "Upgrade your subscription to create private spaces" });
      }

      const chatSpace = await storage.createChatSpace({
        ...req.body,
        createdById: req.user.id,
      });

      // Add creator as admin member
      await storage.addChatSpaceMember(chatSpace.id, req.user.id, true);

      res.status(201).json(chatSpace);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat-spaces/:id/messages", async (req, res, next) => {
    try {
      const spaceId = parseInt(req.params.id);
      if (isNaN(spaceId)) {
        return res.status(400).json({ message: "Invalid chat space ID" });
      }

      const space = await storage.getChatSpaceById(spaceId);
      if (!space) {
        return res.status(404).json({ message: "Chat space not found" });
      }

      // Check if space is private and user has access
      if (space.isPrivate && (!req.isAuthenticated() || !await storage.hasAccessToChatSpace(req.user.id, spaceId))) {
        return res.status(403).json({ message: "You don't have access to this chat space" });
      }

      const messages = await storage.getChatMessages(spaceId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Events routes
  app.get("/api/events", async (req, res, next) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/events/:id", async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:id/attend", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to attend an event" });
    }

    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if user is already attending
      const isAttending = await storage.isUserAttendingEvent(req.user.id, eventId);
      if (isAttending) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }

      // Check subscription tier for certain event types
      if (event.eventType === 'live' && req.user.subscriptionTier === 'basic') {
        return res.status(403).json({ message: "Upgrade your subscription to attend live events" });
      }

      const attendance = await storage.addEventAttendee(eventId, req.user.id);
      res.status(201).json(attendance);
    } catch (error) {
      next(error);
    }
  });

  // Products routes
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // M-PESA Payment routes
  app.post("/api/initiate-mpesa-payment", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to make payments" });
    }

    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      return res.status(503).json({ message: "Payment service is currently unavailable" });
    }

    try {
      const { amount, phoneNumber, planType } = req.body;
      
      if (!amount || !phoneNumber || !planType) {
        return res.status(400).json({ 
          message: "Amount, phone number, and plan type are required" 
        });
      }

      // Update subscription tier based on plan type
      let tier: 'basic' | 'family' | 'premium' = 'basic';
      if (planType === 'family') {
        tier = 'family';
      } else if (planType === 'premium') {
        tier = 'premium';
      }

      // Generate a unique transaction reference
      const transactionRef = `BLND-${Date.now()}-${req.user.id}`;

      // Initiate STK Push
      const response = await initiateSTKPush(
        amount,
        phoneNumber,
        transactionRef,
        `Subscription: ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`
      );

      // Store transaction reference for callback verification
      // In a real application, you would store this in a database
      // along with the user ID, amount, plan type, and checkout request ID
      
      // Return checkout ID to client for tracking
      res.json({
        checkoutRequestId: response.CheckoutRequestID,
        transactionRef,
        message: "Payment initiated. Please complete the payment on your phone."
      });
    } catch (error: any) {
      next(error);
    }
  });

  // M-PESA callback endpoint
  app.post("/api/mpesa/callback", async (req, res) => {
    try {
      const callbackData = req.body;
      const result = processSTKCallback(callbackData);

      if (result.success) {
        // In a real application, you would:
        // 1. Verify the transaction reference from the callback
        // 2. Look up the associated user, amount, and subscription plan
        // 3. Update the user's subscription tier
        // 4. Store the transaction details
        
        // For this implementation, we'll assume a successful callback
        // would trigger an update to the user's subscription
        
        // Note: In a real application, you would need to implement proper
        // validation and verification of the callback data

        // Since this is just a simulation, we'll just respond with a success
        res.status(200).json({ success: true });
      } else {
        console.error("M-PESA payment failed:", result.message);
        res.status(200).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error processing M-PESA callback:", error);
      res.status(200).json({ success: false });
    }
  });
  
  // Subscription management route
  app.post("/api/update-subscription", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to manage subscriptions" });
    }

    try {
      const { tier, transactionId } = req.body;
      
      if (!tier || !transactionId) {
        return res.status(400).json({ message: "Subscription tier and transaction ID are required" });
      }
      
      // In a production system, you would verify the transactionId against M-PESA APIs
      // or your internal transaction records to confirm the payment was actually made
      
      // For demo purposes, we'll just update the tier directly
      await storage.updateSubscriptionTier(req.user.id, tier);
      
      res.json({
        success: true,
        message: `Your subscription has been upgraded to ${tier}`,
        user: {
          ...req.user,
          subscriptionTier: tier
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Gamification System Routes

  // Achievements routes
  app.get("/api/achievements", async (req, res, next) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/achievements/:id", async (req, res, next) => {
    try {
      const achievementId = parseInt(req.params.id);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }

      const achievement = await storage.getAchievementById(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }

      res.json(achievement);
    } catch (error) {
      next(error);
    }
  });

  // User achievements routes
  app.get("/api/user-achievements", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view your achievements" });
    }

    try {
      const userAchievements = await storage.getUserAchievements(req.user.id);
      res.json(userAchievements);
    } catch (error) {
      next(error);
    }
  });

  // Check for new achievements (this could be called after activities like posting, attending events, etc.)
  app.post("/api/check-achievements", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to check achievements" });
    }

    try {
      const newAchievements = await storage.checkAndAwardAchievements(req.user.id);
      
      // Get the user's current level after achievements
      const user = await storage.getUser(req.user.id);
      const currentLevel = user ? await storage.getLevelByPoints(user.activityScore || 0) : null;
      
      res.json({
        newAchievements,
        currentLevel,
        totalAchievements: (await storage.getUserAchievements(req.user.id)).length
      });
    } catch (error) {
      next(error);
    }
  });

  // Levels routes
  app.get("/api/levels", async (req, res, next) => {
    try {
      const levels = await storage.getLevels();
      res.json(levels);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user-level", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view your level" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const activityScore = user.activityScore || 0;
      const level = await storage.getLevelByPoints(activityScore);
      
      // Calculate progress to next level
      const allLevels = await storage.getLevels();
      let nextLevel = null;
      let progressPercent = 100; // Default to 100% if at max level
      
      if (level) {
        // Find the next level
        const nextLevelIndex = allLevels.findIndex(l => l.id === level.id) + 1;
        if (nextLevelIndex < allLevels.length) {
          nextLevel = allLevels[nextLevelIndex];
          
          // Calculate progress percentage
          const pointsForCurrentLevel = level.pointsRequired;
          const pointsForNextLevel = nextLevel.pointsRequired;
          const pointsRange = pointsForNextLevel - pointsForCurrentLevel;
          const userPointsAboveCurrentLevel = activityScore - pointsForCurrentLevel;
          
          progressPercent = Math.min(Math.floor((userPointsAboveCurrentLevel / pointsRange) * 100), 99);
        }
      }
      
      res.json({
        currentLevel: level,
        nextLevel,
        activityScore: user.activityScore,
        progressToNextLevel: progressPercent
      });
    } catch (error) {
      next(error);
    }
  });

  // Activity logs routes
  app.get("/api/activity-logs", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view activity logs" });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const activityLogs = await storage.getUserActivityLogs(req.user.id, limit);
      res.json(activityLogs);
    } catch (error) {
      next(error);
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const leaderboard = await storage.getLeaderboard(limit);
      
      // Remove sensitive info from users
      const sanitizedLeaderboard = leaderboard.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        activityScore: user.activityScore
      }));
      
      res.json(sanitizedLeaderboard);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
