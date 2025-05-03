import { 
  users, type User, type InsertUser, 
  chatSpaces, type ChatSpace, type InsertChatSpace, 
  chatMessages, type ChatMessage, type InsertChatMessage, 
  chatSpaceMemberships, type ChatSpaceMembership, 
  events, type Event, type InsertEvent, 
  eventAttendance, type EventAttendance, 
  products, type Product, type InsertProduct,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  levels, type Level, type InsertLevel,
  activityLogs, type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, desc, sql as sqlQuery } from "drizzle-orm";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // Auth & User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateNewsletterPreference(userId: number, subscribed: boolean): Promise<User>;
  addNewsletterSubscription(email: string): Promise<void>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User>;
  updateSubscriptionTier(userId: number, tier: 'basic' | 'family' | 'premium'): Promise<User>;
  updateActivityScore(userId: number, amount: number): Promise<User | undefined>;
  
  // Chat spaces
  getChatSpaces(userId: number | null): Promise<ChatSpace[]>;
  getChatSpaceById(id: number): Promise<ChatSpace | undefined>;
  createChatSpace(chatSpace: InsertChatSpace): Promise<ChatSpace>;
  hasAccessToChatSpace(userId: number, chatSpaceId: number): Promise<boolean>;
  addChatSpaceMember(chatSpaceId: number, userId: number, isAdmin?: boolean): Promise<ChatSpaceMembership>;
  getChatMessages(chatSpaceId: number): Promise<(ChatMessage & { user: User })[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  addEventAttendee(eventId: number, userId: number): Promise<EventAttendance>;
  isUserAttendingEvent(userId: number, eventId: number): Promise<boolean>;
  getEventAttendees(eventId: number): Promise<User[]>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductInventory(productId: number, amount: number): Promise<Product>;
  
  // Gamification System
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Achievements
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  awardAchievementToUser(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  checkAndAwardAchievements(userId: number): Promise<UserAchievement[]>;
  
  // Levels
  getLevels(): Promise<Level[]>;
  getLevelById(id: number): Promise<Level | undefined>;
  getLevelByPoints(points: number): Promise<Level | undefined>;
  createLevel(level: InsertLevel): Promise<Level>;
  
  // Activity Logs
  addActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getUserActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Sessions
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize the PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true
    });
  }
  
  // This method has been removed as we no longer need to initialize sample data
  // Sample data will be populated through the database migrations

  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sqlQuery`LOWER(${users.username}) = LOWER(${username})`);
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sqlQuery`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    
    // Set default values for missing fields but keep only the fields defined in the schema
    const userData = {
      username: insertUser.username,
      password: insertUser.password, 
      email: insertUser.email,
      displayName: insertUser.displayName,
      subscriptionTier: 'free' as const,
      activityScore: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      avatarUrl: insertUser.avatarUrl || null,
      bio: insertUser.bio || null,
      newsletterSubscription: insertUser.newsletterSubscription || false,
      createdAt: now
    };
    
    // Insert the user and return the created user
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateNewsletterPreference(userId: number, subscribed: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ newsletterSubscription: subscribed })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async addNewsletterSubscription(email: string): Promise<void> {
    // Check if the user exists
    const user = await this.getUserByEmail(email);
    
    if (user) {
      // Update existing user
      await this.updateNewsletterPreference(user.id, true);
    } else {
      // Store email for future use (could create a separate table for this)
      await db.execute(sqlQuery`
        INSERT INTO newsletter_emails (email) 
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING
      `);
    }
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async updateSubscriptionTier(userId: number, tier: 'basic' | 'family' | 'premium'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ subscriptionTier: tier })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async updateActivityScore(userId: number, amount: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        console.warn(`Attempted to update activity score for non-existent user ID: ${userId}`);
        return undefined;
      }
      
      // Calculate new score
      const currentScore = user.activityScore || 0;
      const newScore = currentScore + amount;
      
      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({ activityScore: newScore })
        .where(eq(users.id, userId))
        .returning();
        
      return updatedUser;
    } catch (error) {
      console.error(`Error updating activity score: ${error}`);
      return undefined;
    }
  }
  
  // CHAT SPACE METHODS
  async getChatSpaces(userId: number | null): Promise<ChatSpace[]> {
    if (!userId) {
      // If not authenticated, return only public spaces
      return db
        .select()
        .from(chatSpaces)
        .where(eq(chatSpaces.isPrivate, false));
    }
    
    // Get all spaces the user is a member of
    const membershipChatSpaceIds = await db
      .select({ chatSpaceId: chatSpaceMemberships.chatSpaceId })
      .from(chatSpaceMemberships)
      .where(eq(chatSpaceMemberships.userId, userId));
    
    // Get the IDs as an array
    const membershipIds = membershipChatSpaceIds.map(row => row.chatSpaceId);
    
    if (membershipIds.length === 0) {
      // If user isn't a member of any spaces, just return public spaces
      return db
        .select()
        .from(chatSpaces)
        .where(eq(chatSpaces.isPrivate, false));
    }
    
    // Return public spaces and private spaces the user is a member of
    return db
      .select()
      .from(chatSpaces)
      .where(
        sqlQuery`${chatSpaces.isPrivate} = false OR ${chatSpaces.id} IN (${membershipIds.join(',')})`
      );
  }
  
  async getChatSpaceById(id: number): Promise<ChatSpace | undefined> {
    const [chatSpace] = await db
      .select()
      .from(chatSpaces)
      .where(eq(chatSpaces.id, id));
    return chatSpace;
  }
  
  async createChatSpace(insertChatSpace: InsertChatSpace): Promise<ChatSpace> {
    const now = new Date();
    
    // Set default values
    const chatSpaceData = {
      ...insertChatSpace,
      createdAt: now,
      description: insertChatSpace.description || null,
      isPrivate: insertChatSpace.isPrivate || false
    };
    
    const [chatSpace] = await db
      .insert(chatSpaces)
      .values(chatSpaceData)
      .returning();
      
    // Add creator as a member and admin if user ID is provided
    if (insertChatSpace.createdById) {
      await this.addChatSpaceMember(chatSpace.id, insertChatSpace.createdById, true);
    }
    
    return chatSpace;
  }
  
  async hasAccessToChatSpace(userId: number, chatSpaceId: number): Promise<boolean> {
    const [space] = await db
      .select()
      .from(chatSpaces)
      .where(eq(chatSpaces.id, chatSpaceId));
      
    if (!space) {
      return false;
    }
    
    // Public spaces are accessible to all
    if (!space.isPrivate) {
      return true;
    }
    
    // Check if user is a member of the private space
    const [membership] = await db
      .select()
      .from(chatSpaceMemberships)
      .where(
        and(
          eq(chatSpaceMemberships.chatSpaceId, chatSpaceId),
          eq(chatSpaceMemberships.userId, userId)
        )
      );
      
    return !!membership;
  }
  
  async addChatSpaceMember(chatSpaceId: number, userId: number, isAdmin: boolean = false): Promise<ChatSpaceMembership> {
    // Check if membership already exists
    const [existingMembership] = await db
      .select()
      .from(chatSpaceMemberships)
      .where(
        and(
          eq(chatSpaceMemberships.chatSpaceId, chatSpaceId),
          eq(chatSpaceMemberships.userId, userId)
        )
      );
      
    if (existingMembership) {
      // Update admin status if it's changed
      if (existingMembership.isAdmin !== isAdmin) {
        const [updatedMembership] = await db
          .update(chatSpaceMemberships)
          .set({ isAdmin })
          .where(eq(chatSpaceMemberships.id, existingMembership.id))
          .returning();
          
        return updatedMembership;
      }
      
      return existingMembership;
    }
    
    // Create new membership
    const now = new Date();
    const [membership] = await db
      .insert(chatSpaceMemberships)
      .values({
        chatSpaceId,
        userId,
        isAdmin,
        joinedAt: now
      })
      .returning();
      
    // Increase activity score for joining a chat space
    await this.updateActivityScore(userId, 2);
      
    return membership;
  }
  
  async getChatMessages(chatSpaceId: number): Promise<(ChatMessage & { user: User })[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSpaceId, chatSpaceId))
      .orderBy(chatMessages.createdAt);
    
    // Enrich with user data
    return Promise.all(messages.map(async message => {
      const user = await this.getUser(message.userId);
      if (!user) {
        throw new Error("User not found for message");
      }
      return { ...message, user };
    }));
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const now = new Date();
    
    // Set default values
    const messageData = {
      ...insertMessage,
      createdAt: now,
      type: insertMessage.type || 'text'
    };
    
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    
    // Increase activity score for user
    await this.updateActivityScore(insertMessage.userId, 1);
    
    return message;
  }
  
  // EVENT METHODS
  async getEvents(): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .orderBy(events.startDate);
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const now = new Date();
    
    // Set default values
    const eventData = {
      ...insertEvent,
      createdAt: now,
      description: insertEvent.description || null,
      eventType: insertEvent.eventType || null,
      endDate: insertEvent.endDate || null,
      imageUrl: insertEvent.imageUrl || null,
      location: insertEvent.location || null,
      isVirtual: insertEvent.isVirtual || null,
      maxAttendees: insertEvent.maxAttendees || null
    };
    
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    
    // Try to increase activity score for creator if user exists
    if (insertEvent.createdById) {
      await this.updateActivityScore(insertEvent.createdById, 5);
    }
    
    return event;
  }
  
  async addEventAttendee(eventId: number, userId: number): Promise<EventAttendance> {
    // Check if already attending
    const isAttending = await this.isUserAttendingEvent(userId, eventId);
    if (isAttending) {
      // Find and return the existing attendance record
      const [attendance] = await db
        .select()
        .from(eventAttendance)
        .where(
          and(
            eq(eventAttendance.eventId, eventId),
            eq(eventAttendance.userId, userId)
          )
        );
      return attendance;
    }
    
    // Create new attendance record
    const now = new Date();
    const [attendance] = await db
      .insert(eventAttendance)
      .values({
        eventId,
        userId,
        registeredAt: now
      })
      .returning();
    
    // Increase activity score for attendee
    await this.updateActivityScore(userId, 2);
    
    return attendance;
  }
  
  async isUserAttendingEvent(userId: number, eventId: number): Promise<boolean> {
    const [attendance] = await db
      .select()
      .from(eventAttendance)
      .where(
        and(
          eq(eventAttendance.eventId, eventId),
          eq(eventAttendance.userId, userId)
        )
      );
    
    return !!attendance;
  }
  
  async getEventAttendees(eventId: number): Promise<User[]> {
    const attendances = await db
      .select({
        userId: eventAttendance.userId
      })
      .from(eventAttendance)
      .where(eq(eventAttendance.eventId, eventId));
    
    if (attendances.length === 0) {
      return [];
    }
    
    // Get all user IDs
    const userIds = attendances.map(a => a.userId);
    
    // Fetch all users at once
    return db
      .select()
      .from(users)
      .where(sqlQuery`${users.id} IN (${userIds.join(',')})`);
  }
  
  // PRODUCT METHODS
  async getProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const now = new Date();
    
    // Set default values
    const productData = {
      ...insertProduct,
      createdAt: now,
      description: insertProduct.description || null,
      imageUrl: insertProduct.imageUrl || null,
      inventory: insertProduct.inventory || 0
    };
    
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    
    return product;
  }
  
  async updateProductInventory(productId: number, amount: number): Promise<Product> {
    // Get current product first
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Calculate new inventory
    const currentInventory = product.inventory || 0;
    const newInventory = currentInventory + amount;
    
    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set({ inventory: newInventory })
      .where(eq(products.id, productId))
      .returning();
    
    return updatedProduct;
  }

  // GAMIFICATION SYSTEM METHODS

  // ACHIEVEMENTS
  async getAchievements(): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements);
  }

  async getAchievementById(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  // USER ACHIEVEMENTS
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievementsData = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    // Enrich with achievement data
    return Promise.all(userAchievementsData.map(async userAchievement => {
      const achievement = await this.getAchievementById(userAchievement.achievementId);
      if (!achievement) {
        throw new Error("Achievement not found");
      }
      return { ...userAchievement, achievement };
    }));
  }

  async awardAchievementToUser(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    try {
      // Check if already awarded
      const [existingAward] = await db
        .select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, achievementId)
          )
        );
      
      if (existingAward) {
        return existingAward; // Already awarded
      }
      
      // Get the achievement to award points
      const achievement = await this.getAchievementById(achievementId);
      if (!achievement) {
        console.error(`Achievement not found: ${achievementId}`);
        return undefined;
      }
      
      // Award the achievement
      const now = new Date();
      const [userAchievement] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          earnedAt: now
        })
        .returning();
      
      // Award points
      await this.updateActivityScore(userId, achievement.pointsAwarded);
      
      // Create activity log
      await this.addActivityLog({
        userId,
        activityType: 'achievement_earned',
        pointsEarned: achievement.pointsAwarded,
        description: `Earned achievement: ${achievement.name}`
      });
      
      return userAchievement;
    } catch (error) {
      console.error(`Error awarding achievement: ${error}`);
      return undefined;
    }
  }

  async checkAndAwardAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.warn(`User not found for checking achievements: ${userId}`);
        return [];
      }
      
      const allAchievements = await this.getAchievements();
      const userAchievements = await this.getUserAchievements(userId);
      const userAchievementIds = userAchievements.map(ua => ua.achievementId);
      
      // Check post count achievements
      const postCountAchievements = allAchievements.filter(a => 
        a.type === 'post_count' && !userAchievementIds.includes(a.id)
      );
      
      // Get user's post count
      const userPosts = await db
        .select({ count: sqlQuery<number>`count(*)` })
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId));
      
      const postCount = userPosts[0]?.count || 0;
      
      // Check event attendance achievements
      const eventAttendanceAchievements = allAchievements.filter(a => 
        a.type === 'event_attendance' && !userAchievementIds.includes(a.id)
      );
      
      // Get user's event attendance count
      const userAttendances = await db
        .select({ count: sqlQuery<number>`count(*)` })
        .from(eventAttendance)
        .where(eq(eventAttendance.userId, userId));
      
      const attendanceCount = userAttendances[0]?.count || 0;
      
      // Check profile completion
      const profileCompleteAchievements = allAchievements.filter(a => 
        a.type === 'profile_completion' && !userAchievementIds.includes(a.id)
      );
      
      let profileCompletion = 0;
      if (user.displayName) profileCompletion += 20;
      if (user.email) profileCompletion += 20;
      if (user.avatarUrl) profileCompletion += 20;
      if (user.bio) profileCompletion += 20;
      if (user.newsletterSubscription) profileCompletion += 20;
      
      // Create arrays of achievements to award
      const achievementsToAward: Achievement[] = [
        ...postCountAchievements.filter(a => postCount >= a.requiredValue),
        ...eventAttendanceAchievements.filter(a => attendanceCount >= a.requiredValue),
        ...profileCompleteAchievements.filter(a => profileCompletion >= a.requiredValue)
      ];
      
      // Award all eligible achievements
      const newlyAwardedAchievements: UserAchievement[] = [];
      
      for (const achievement of achievementsToAward) {
        const awarded = await this.awardAchievementToUser(userId, achievement.id);
        if (awarded) {
          newlyAwardedAchievements.push(awarded);
        }
      }
      
      return newlyAwardedAchievements;
    } catch (error) {
      console.error(`Error checking achievements: ${error}`);
      return [];
    }
  }

  // LEVELS
  async getLevels(): Promise<Level[]> {
    return db
      .select()
      .from(levels)
      .orderBy(levels.pointsRequired);
  }

  async getLevelById(id: number): Promise<Level | undefined> {
    const [level] = await db
      .select()
      .from(levels)
      .where(eq(levels.id, id));
    return level;
  }

  async getLevelByPoints(points: number): Promise<Level | undefined> {
    // Get all levels
    const allLevels = await this.getLevels();
    
    // Find the highest level the user qualifies for
    const qualifyingLevels = allLevels.filter(level => points >= level.pointsRequired);
    
    if (qualifyingLevels.length === 0) {
      return undefined; // User doesn't qualify for any level yet
    }
    
    // Return the highest qualifying level
    return qualifyingLevels.reduce((highestLevel, level) => 
      level.pointsRequired > highestLevel.pointsRequired ? level : highestLevel
    , qualifyingLevels[0]);
  }

  async createLevel(insertLevel: InsertLevel): Promise<Level> {
    const [level] = await db
      .insert(levels)
      .values(insertLevel)
      .returning();
    return level;
  }

  // ACTIVITY LOGS
  async addActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const now = new Date();
    
    const [log] = await db
      .insert(activityLogs)
      .values({
        ...insertLog,
        createdAt: now
      })
      .returning();
    
    return log;
  }

  async getUserActivityLogs(userId: number, limit: number = 20): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // LEADERBOARD
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(desc(users.activityScore))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
