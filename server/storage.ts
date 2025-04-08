import { users, type User, type InsertUser, chatSpaces, type ChatSpace, type InsertChatSpace, chatMessages, type ChatMessage, type InsertChatMessage, chatSpaceMemberships, type ChatSpaceMembership, events, type Event, type InsertEvent, eventAttendance, type EventAttendance, products, type Product, type InsertProduct } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create the memory store factory
const MemoryStore = createMemoryStore(session);

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
  
  // Sessions
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatSpaces: Map<number, ChatSpace>;
  private chatMessages: Map<number, ChatMessage>;
  private chatSpaceMemberships: Map<number, ChatSpaceMembership>;
  private events: Map<number, Event>;
  private eventAttendances: Map<number, EventAttendance>;
  private products: Map<number, Product>;
  private newsletterEmails: Set<string>;
  
  sessionStore: session.Store;
  
  private userIdCounter: number = 1;
  private chatSpaceIdCounter: number = 1;
  private chatMessageIdCounter: number = 1;
  private chatSpaceMembershipIdCounter: number = 1;
  private eventIdCounter: number = 1;
  private eventAttendanceIdCounter: number = 1;
  private productIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.chatSpaces = new Map();
    this.chatMessages = new Map();
    this.chatSpaceMemberships = new Map();
    this.events = new Map();
    this.eventAttendances = new Map();
    this.products = new Map();
    this.newsletterEmails = new Set();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Create sample public chat spaces
    this.createChatSpace({
      name: "General Discussion",
      description: "A place for all members to discuss general topics",
      isPrivate: false,
      createdById: 0
    });
    
    this.createChatSpace({
      name: "Step-Parenting Support",
      description: "Support and advice for step-parents",
      isPrivate: false,
      createdById: 0
    });
    
    this.createChatSpace({
      name: "Co-Parenting Strategies",
      description: "Strategies and tips for effective co-parenting",
      isPrivate: false,
      createdById: 0
    });
    
    this.createChatSpace({
      name: "Blended Family Success",
      description: "Share your success stories and challenges",
      isPrivate: false,
      createdById: 0
    });
    
    // Create sample events
    const now = new Date();
    
    this.createEvent({
      title: "Effective Communication in Blended Families",
      description: "Join family therapist Dr. Angela Martinez as she shares practical communication strategies for blended families.",
      eventType: "workshop",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 19, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 20, 30),
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad",
      location: "Zoom",
      isVirtual: true,
      maxAttendees: 100,
      createdById: 0
    });
    
    this.createEvent({
      title: "Virtual Family Game Night",
      description: "Bring the whole family for a fun evening of virtual games designed to strengthen family bonds across households.",
      eventType: "social",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 18, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 20, 0),
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
      location: "Zoom",
      isVirtual: true,
      maxAttendees: 50,
      createdById: 0
    });
    
    this.createEvent({
      title: "Co-Parenting Success Strategies",
      description: "Expert panel discussion featuring family counselors and successful co-parents sharing their insights.",
      eventType: "live",
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 3, 13, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 3, 14, 30),
      imageUrl: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21",
      location: "Zoom",
      isVirtual: true,
      maxAttendees: 200,
      createdById: 0
    });
    
    // Create sample products
    this.createProduct({
      name: "The Blended Circle T-Shirt",
      description: "Comfortable cotton t-shirt with The Blended Circle logo",
      price: 2499, // $24.99
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      inventory: 100
    });
    
    this.createProduct({
      name: "Blended Family Planner",
      description: "A specialized planner designed for managing blended family schedules",
      price: 3499, // $34.99
      imageUrl: "https://images.unsplash.com/photo-1506784365847-bbad939e9335",
      inventory: 50
    });
    
    this.createProduct({
      name: "Family Communication Cards",
      description: "Card prompts to facilitate meaningful conversations between family members",
      price: 1999, // $19.99
      imageUrl: "https://images.unsplash.com/photo-1596495718165-fb1f85de159c",
      inventory: 75
    });
  }

  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      subscriptionTier: 'free',
      activityScore: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      avatarUrl: insertUser.avatarUrl || null,
      bio: insertUser.bio || null,
      newsletterSubscription: insertUser.newsletterSubscription || false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateNewsletterPreference(userId: number, subscribed: boolean): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.newsletterSubscription = subscribed;
    this.users.set(userId, user);
    
    if (subscribed) {
      this.newsletterEmails.add(user.email);
    }
    
    return user;
  }
  
  async addNewsletterSubscription(email: string): Promise<void> {
    this.newsletterEmails.add(email);
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.stripeCustomerId = customerId;
    this.users.set(userId, user);
    
    return user;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.stripeSubscriptionId = subscriptionId;
    this.users.set(userId, user);
    
    return user;
  }
  
  async updateSubscriptionTier(userId: number, tier: 'basic' | 'family' | 'premium'): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.subscriptionTier = tier;
    this.users.set(userId, user);
    
    return user;
  }
  
  async updateActivityScore(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      console.warn(`Attempted to update activity score for non-existent user ID: ${userId}`);
      return undefined;
    }
    
    // Initialize or increment activityScore
    user.activityScore = (user.activityScore || 0) + amount;
    this.users.set(userId, user);
    
    return user;
  }
  
  // CHAT SPACE METHODS
  async getChatSpaces(userId: number | null): Promise<ChatSpace[]> {
    const spaces = Array.from(this.chatSpaces.values());
    
    if (!userId) {
      // If not authenticated, return only public spaces
      return spaces.filter(space => !space.isPrivate);
    }
    
    // Get all spaces the user is a member of
    const memberships = Array.from(this.chatSpaceMemberships.values())
      .filter(membership => membership.userId === userId)
      .map(membership => membership.chatSpaceId);
    
    // Return public spaces and private spaces the user is a member of
    return spaces.filter(space => !space.isPrivate || memberships.includes(space.id));
  }
  
  async getChatSpaceById(id: number): Promise<ChatSpace | undefined> {
    return this.chatSpaces.get(id);
  }
  
  async createChatSpace(insertChatSpace: InsertChatSpace): Promise<ChatSpace> {
    const id = this.chatSpaceIdCounter++;
    const now = new Date();
    const chatSpace: ChatSpace = {
      ...insertChatSpace,
      id,
      createdAt: now,
      description: insertChatSpace.description || null,
      isPrivate: insertChatSpace.isPrivate || null
    };
    this.chatSpaces.set(id, chatSpace);
    return chatSpace;
  }
  
  async hasAccessToChatSpace(userId: number, chatSpaceId: number): Promise<boolean> {
    const space = await this.getChatSpaceById(chatSpaceId);
    if (!space) {
      return false;
    }
    
    // Public spaces are accessible to all
    if (!space.isPrivate) {
      return true;
    }
    
    // Check if user is a member of the private space
    return Array.from(this.chatSpaceMemberships.values())
      .some(membership => 
        membership.chatSpaceId === chatSpaceId && 
        membership.userId === userId
      );
  }
  
  async addChatSpaceMember(chatSpaceId: number, userId: number, isAdmin: boolean = false): Promise<ChatSpaceMembership> {
    const id = this.chatSpaceMembershipIdCounter++;
    const now = new Date();
    const membership: ChatSpaceMembership = {
      id,
      chatSpaceId,
      userId,
      isAdmin,
      joinedAt: now
    };
    this.chatSpaceMemberships.set(id, membership);
    return membership;
  }
  
  async getChatMessages(chatSpaceId: number): Promise<(ChatMessage & { user: User })[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.chatSpaceId === chatSpaceId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
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
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: now,
      type: insertMessage.type || 'text'
    };
    this.chatMessages.set(id, message);
    
    // Increase activity score for user
    await this.updateActivityScore(insertMessage.userId, 1);
    
    return message;
  }
  
  // EVENT METHODS
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: now,
      description: insertEvent.description || null,
      eventType: insertEvent.eventType || null,
      endDate: insertEvent.endDate || null,
      imageUrl: insertEvent.imageUrl || null,
      location: insertEvent.location || null,
      isVirtual: insertEvent.isVirtual || null,
      maxAttendees: insertEvent.maxAttendees || null
    };
    this.events.set(id, event);
    
    // Try to increase activity score for creator if user exists
    if (insertEvent.createdById) {
      await this.updateActivityScore(insertEvent.createdById, 5);
    }
    
    return event;
  }
  
  async addEventAttendee(eventId: number, userId: number): Promise<EventAttendance> {
    const id = this.eventAttendanceIdCounter++;
    const now = new Date();
    const attendance: EventAttendance = {
      id,
      eventId,
      userId,
      registeredAt: now
    };
    this.eventAttendances.set(id, attendance);
    
    // Increase activity score for attendee
    await this.updateActivityScore(userId, 2);
    
    return attendance;
  }
  
  async isUserAttendingEvent(userId: number, eventId: number): Promise<boolean> {
    return Array.from(this.eventAttendances.values())
      .some(attendance => 
        attendance.eventId === eventId && 
        attendance.userId === userId
      );
  }
  
  async getEventAttendees(eventId: number): Promise<User[]> {
    const attendanceRecords = Array.from(this.eventAttendances.values())
      .filter(attendance => attendance.eventId === eventId);
    
    const attendees = await Promise.all(
      attendanceRecords.map(async attendance => {
        const user = await this.getUser(attendance.userId);
        if (!user) {
          throw new Error("User not found for attendance record");
        }
        return user;
      })
    );
    
    return attendees;
  }
  
  // PRODUCT METHODS
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: now,
      description: insertProduct.description || null,
      imageUrl: insertProduct.imageUrl || null,
      inventory: insertProduct.inventory || 0
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProductInventory(productId: number, amount: number): Promise<Product> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Safely handle inventory which might be null
    product.inventory = (product.inventory || 0) + amount;
    this.products.set(productId, product);
    
    return product;
  }
}

export const storage = new MemStorage();
