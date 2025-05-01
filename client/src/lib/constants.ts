export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    price: "KES 750",
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || "price_basic",
    features: [
      "Access to public chat spaces",
      "Weekly newsletter",
      "Basic resource library"
    ],
    disabledFeatures: [
      "Private group access",
      "Live event participation"
    ],
    description: "Perfect for individuals new to blended families"
  },
  FAMILY: {
    name: "Family",
    price: "KES 1,500",
    priceId: import.meta.env.VITE_STRIPE_FAMILY_PRICE_ID || "price_family",
    features: [
      "All Basic features",
      "Up to 3 private group memberships",
      "Live event access and recordings",
      "Direct messaging with members",
      "10% discount in community shop"
    ],
    description: "Ideal for co-parents and blended families",
    popular: true
  },
  PREMIUM: {
    name: "Premium",
    price: "KES 2,250",
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || "price_premium",
    features: [
      "All Family features",
      "Unlimited private groups",
      "Priority access to experts",
      "Create your own private groups",
      "10% discount in community shop"
    ],
    description: "Complete access for committed families"
  }
};

export const FEATURES = [
  {
    icon: "forum",
    title: "Dedicated Chat Spaces",
    description: "Connect with other families in similar situations through topic-specific chat spaces."
  },
  {
    icon: "event",
    title: "Regular Events",
    description: "Virtual meetups, workshops, and social events designed for blended families."
  },
  {
    icon: "privacy_tip",
    title: "Private Groups",
    description: "Create or join private spaces for more personal conversations and support."
  },
  {
    icon: "smart_display",
    title: "Live Video Sessions",
    description: "Participate in live discussions, Q&As, and expert-led sessions on family topics."
  },
  {
    icon: "shopping_bag",
    title: "Community Shop",
    description: "Access to exclusive merchandise and resources specifically for blended families."
  }
];

export const TESTIMONIALS = [
  {
    initials: "ML",
    name: "Michael L.",
    memberSince: "Member since 2022",
    content: "The resources and support I've found in this community have been life-changing for our family. The step-parenting advice from other members helped me navigate a really challenging transition.",
    rating: 5
  },
  {
    initials: "AK",
    name: "Amanda K.",
    memberSince: "Member since 2021",
    content: "Being able to connect with other moms in blended families has been so valuable. The private groups provide a safe space to discuss challenges that others might not understand.",
    rating: 4.5
  },
  {
    initials: "JT",
    name: "Jason & Tara R.",
    memberSince: "Members since 2022",
    content: "The virtual events have been fantastic for our family. We've attended workshops together that sparked important conversations we might not have had otherwise.",
    rating: 5
  }
];

export const DEFAULT_CHAT_SPACES = [
  {
    id: 1,
    name: "General Discussion",
    description: "A place for all members to discuss general topics",
    isPrivate: false,
    memberCount: 238
  },
  {
    id: 2,
    name: "Step-Parenting Support",
    description: "Support and advice for step-parents",
    isPrivate: false,
    memberCount: 156
  },
  {
    id: 3,
    name: "Co-Parenting Strategies",
    description: "Strategies and tips for effective co-parenting",
    isPrivate: false,
    memberCount: 182
  },
  {
    id: 4,
    name: "Blended Family Success",
    description: "Share your success stories and challenges",
    isPrivate: false,
    memberCount: 124
  }
];

export const NAVIGATION_ITEMS = [
  { name: "Home", path: "/" },
  { name: "Chat", path: "/chat" },
  { name: "Events", path: "/events" },
  { name: "Live", path: "/live" },
  { name: "Shop", path: "/shop" },
  { name: "Contact", path: "/contact" }
];
