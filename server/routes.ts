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

  return httpServer;
}
