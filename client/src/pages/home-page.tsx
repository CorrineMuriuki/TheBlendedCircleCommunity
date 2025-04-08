import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/home/FeatureCard";
import { TestimonialCard } from "@/components/home/TestimonialCard";
import { SubscriptionCard } from "@/components/ui/subscription-card";
import { DEFAULT_CHAT_SPACES, FEATURES, SUBSCRIPTION_PLANS, TESTIMONIALS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Setup signup form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreeTerms: false,
    },
  });
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  function onSubmit(data: SignupFormValues) {
    toast({
      title: "Redirecting to registration",
      description: "Taking you to our registration page to complete your signup",
    });
    
    navigate("/auth");
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-[#9e7a68] text-white py-16 lg:py-24 relative overflow-hidden">
          {/* Background pattern for visual interest */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5" 
                 style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
          </div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl lg:text-5xl font-semibold mb-4 text-white">Welcome to The Blended Circle</h1>
              <p className="text-lg mb-8 font-light text-white">
                An online community dedicated to supporting and connecting blended families through shared experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild
                  variant="default" 
                  className="bg-white text-[#9e7a68] hover:bg-neutral-100 hover:text-[#7d5f50] font-medium px-6 py-3 rounded-full shadow-lg border-2 border-white transition-all duration-300 transform hover:scale-105"
                >
                  <Link href={user ? "/chat" : "/auth"}>
                    {user ? "Join Community Chat" : "Join Our Community"}
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-[#9e7a68] font-medium px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/subscribe">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 blur"></div>
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=500&q=80" 
                  alt="Diverse family gathering" 
                  className="rounded-lg shadow-xl max-w-full h-auto relative" 
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-12">What Makes Our Community Special</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* About Us Section */}
        <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-xl bg-[#9e7a68] opacity-10 blur-md"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1629118163133-5f760cc5724d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=500&q=80" 
                    alt="Diverse family gathering" 
                    className="rounded-lg shadow-lg w-full h-auto relative" 
                  />
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-[#9e7a68] rounded-full flex items-center justify-center text-white font-semibold">
                    <div className="text-center">
                      <div className="text-sm">Est.</div>
                      <div className="text-xl">2021</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-[#9e7a68]">About The Blended Circle</h2>
                <p className="text-lg mb-4 text-gray-700">
                  Founded in 2021, The Blended Circle is dedicated to supporting and connecting blended families through all of life's transitions.
                </p>
                <p className="mb-4 text-gray-700">
                  Our community was created by parents who understand the unique joys and challenges of blending families. We believe that with the right support, resources, and connections, blended families can thrive.
                </p>
                <p className="mb-6 text-gray-700">
                  Our mission is to provide a safe, supportive environment where parents, step-parents, and children in blended families can find community, share experiences, and access valuable resources designed specifically for their needs.
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="bg-[#9e7a68] text-white hover:bg-[#876258] border-0 font-medium px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Community Preview Section */}
        <section className="py-16 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-4">Experience Our Community</h2>
            <p className="text-center text-neutral-dark max-w-2xl mx-auto mb-12">
              Get a glimpse of the conversations and connections happening in The Blended Circle.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Community Spaces Navigation */}
              <div className="lg:w-1/4 bg-white rounded-lg shadow-sm p-4 h-min">
                <h3 className="font-medium text-lg mb-4 pb-2 border-b border-neutral-light">Community Spaces</h3>
                <ul className="space-y-2">
                  {DEFAULT_CHAT_SPACES.map((space, index) => (
                    <li key={index}>
                      <Link href={user ? "/chat" : "/auth"} className={`p-2 flex items-center rounded-md hover:bg-primary-light hover:text-primary-dark transition-colors ${index === 0 ? 'bg-primary bg-opacity-10 text-primary' : ''}`}>
                        <span className="material-icons mr-2 text-sm">{space.isPrivate ? 'lock' : 'tag'}</span>
                        <span>{space.name}</span>
                        {space.isPrivate && (
                          <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                            {space.memberCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-neutral-light">
                  <Button 
                    asChild
                    variant="link" 
                    className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary-dark"
                  >
                    <Link href={user ? "/chat" : "/auth"}>
                      <span className="material-icons text-sm">add_circle</span>
                      <span>Create New Space</span>
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Chat Preview */}
              <div className="lg:w-3/4 bg-white rounded-lg shadow-sm flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-neutral-light flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="material-icons mr-2">tag</span>
                    <h3 className="font-medium">General Discussion</h3>
                  </div>
                  <div className="flex items-center text-sm text-neutral">
                    <span className="material-icons text-sm mr-1">person</span>
                    <span>238 members</span>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4" style={{ maxHeight: "400px" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex-shrink-0 flex items-center justify-center text-primary-dark font-medium">
                      SM
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">Sarah M.</span>
                        <span className="text-xs text-neutral">Today at 10:23 AM</span>
                      </div>
                      <div className="mt-1 bg-neutral-lightest p-3 rounded-lg chat-bubble-left">
                        <p>Hi everyone! I'm new to the community. My husband and I just blended our family with 3 kids from previous marriages. Looking for advice on holiday schedules!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-medium">
                      JD
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">James D.</span>
                        <span className="text-xs text-neutral">Today at 10:30 AM</span>
                        <span className="text-xs px-2 py-0.5 bg-primary-light text-primary-dark rounded-full">Moderator</span>
                      </div>
                      <div className="mt-1 bg-neutral-lightest p-3 rounded-lg chat-bubble-left">
                        <p>Welcome, Sarah! Holiday scheduling can be tricky. We actually have a great resource in our Files section called "Holiday Planning for Blended Families". It has templates you can use!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex-shrink-0 flex items-center justify-center text-primary-dark font-medium">
                      LW
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">Lisa W.</span>
                        <span className="text-xs text-neutral">Today at 10:45 AM</span>
                      </div>
                      <div className="mt-1 bg-neutral-lightest p-3 rounded-lg chat-bubble-left">
                        <p>@Sarah M. We've been a blended family for 5 years now. The biggest thing that helped us was creating a shared digital calendar that everyone (including co-parents) has access to. Happy to chat more about our system!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-neutral-light">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder={user ? "Type your message..." : "Sign in to join the conversation"} 
                      disabled={!user}
                      className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {user && (
                      <Button 
                        disabled
                        className="absolute right-2 top-2 text-primary hover:text-primary-dark"
                        variant="ghost"
                        size="icon"
                      >
                        <span className="material-icons">send</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-primary bg-opacity-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-12">Community Stories</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  initials={testimonial.initials}
                  name={testimonial.name}
                  memberSince={testimonial.memberSince}
                  content={testimonial.content}
                  rating={testimonial.rating}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Membership Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-4">Join Our Community</h2>
            <p className="text-center text-neutral-dark max-w-2xl mx-auto mb-12">
              Select the membership plan that works best for you and your family.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <SubscriptionCard
                name={SUBSCRIPTION_PLANS.BASIC.name}
                price={SUBSCRIPTION_PLANS.BASIC.price}
                description={SUBSCRIPTION_PLANS.BASIC.description}
                features={SUBSCRIPTION_PLANS.BASIC.features}
                disabledFeatures={SUBSCRIPTION_PLANS.BASIC.disabledFeatures}
                onClick={() => navigate("/subscribe")}
              />
              
              <SubscriptionCard
                name={SUBSCRIPTION_PLANS.FAMILY.name}
                price={SUBSCRIPTION_PLANS.FAMILY.price}
                description={SUBSCRIPTION_PLANS.FAMILY.description}
                features={SUBSCRIPTION_PLANS.FAMILY.features}
                isPopular={SUBSCRIPTION_PLANS.FAMILY.popular}
                isPrimary={true}
                onClick={() => navigate("/subscribe")}
              />
              
              <SubscriptionCard
                name={SUBSCRIPTION_PLANS.PREMIUM.name}
                price={SUBSCRIPTION_PLANS.PREMIUM.price}
                description={SUBSCRIPTION_PLANS.PREMIUM.description}
                features={SUBSCRIPTION_PLANS.PREMIUM.features}
                onClick={() => navigate("/subscribe")}
              />
            </div>
          </div>
        </section>
        
        {/* Signup CTA */}
        <section className="py-20 bg-[#9e7a68] relative overflow-hidden">
          {/* Background design elements */}
          <div className="absolute top-0 left-0 w-full h-20 bg-white opacity-5"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white opacity-10 -mb-10 -mr-10"></div>
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="mb-12">
              <h2 className="text-2xl lg:text-4xl font-semibold text-white mb-4">Ready to Join The Blended Circle?</h2>
              <p className="text-white text-lg max-w-2xl mx-auto mb-8">
                Connect with families who understand your journey and find the support you need to thrive together.
              </p>
            </div>
            
            {/* Sign Up Form */}
            <div className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-xl">
              <h3 className="text-xl font-medium mb-4">Create Your Account</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9e7a68] hover:bg-[#876258] text-white font-medium px-6 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    Create Account
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm text-neutral-dark">
                Already have an account? <Link href="/auth" className="text-primary hover:underline">Sign In</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
