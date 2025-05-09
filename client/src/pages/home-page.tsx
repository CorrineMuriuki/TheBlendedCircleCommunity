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
          {/* Floating background images */}
          <div className="absolute inset-0">
            <img 
              src="/assets/DSC08955.jpg"
              alt="Background"
              className="absolute w-64 h-64 object-cover rounded-2xl opacity-20 blur-sm -top-10 -right-10 rotate-12 animate-float-slow"
            />
            <img 
              src="/assets/DSC08955.jpg"
              alt="Background"
              className="absolute w-48 h-48 object-cover rounded-2xl opacity-15 blur-sm -bottom-8 -left-8 -rotate-12 animate-float"
            />
          </div>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#9e7a68] via-[#9e7a68]/95 to-[#9e7a68]/90"></div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl lg:text-5xl font-semibold mb-4 text-white">Welcome to the Blended Circle</h1>
              <p className="text-lg mb-8 font-light text-white">
                The Blended Circle is a bold, beautiful, and safe online community created by 'The' Fashionable Stepmum for navigating life in blended families. Because every family's story matters - Support, Strength, Stability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  asChild
                  variant="default" 
                  className="w-full sm:w-auto bg-white text-[#9e7a68] hover:bg-neutral-100 hover:text-[#7d5f50] font-medium px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 border-white transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
                >
                  <Link href={user ? "/chat" : "/auth"}>
                    {user ? "Join Community Chat" : "Join Our Community"}
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-[#9e7a68] font-medium px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
                >
                  <Link href="/subscribe">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 blur"></div>
                <img 
                  src="/assets/Image1.jpg.jpg" 
                  alt="The Blended Circle Community" 
                  className="rounded-lg shadow-xl max-w-full h-auto relative" 
                />
              </div>
            </div>
          </div>
        </section>
        
       
        
        {/* Community Preview Section */}
        <section className="py-16 md:py-20 bg-neutral-50">

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
                      <div className="text-xl">2025</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-[#9e7a68]">Who We Are</h2>
                <p className="text-lg mb-4 text-gray-700">
                  The Blended Circle is a bold, beautiful, and safe online space created by 'The' Fashionable Stepmum for navigating life in blended families. We know step-parenting is layered. It's love, laughter, learning — but also boundaries, healing, and grace.
                  </p>
                <p className="mb-4 text-gray-700">
                  We exist to hold space for:<br/>
                  Parents-Step-parents, Biological Moms, Co-Parents, Children- Step-children, bio-children, Women Loving Partners with Children and the Bonus Families eco-system
                </p>
                <h3 className="text-xl font-semibold mb-3 text-[#9e7a68]">Our Why</h3>
                <p className="mb-4 text-gray-700">
                  Being part of a blended family isn't about fitting into a mold —Because every family's story matters. Support, Strength, Stability
                </p>
                <p className="mb-6 text-gray-700">
                We're not here to be perfect — we're here to be authentic, radiant, and resilient.
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full sm:w-auto bg-[#9e7a68] text-white hover:bg-[#876258] border-0 font-medium px-6 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 text-base"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-4 text-[#9e7a68]">Community Chat</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
              Get a glimpse of the conversations and connections happening in The Blended Circle.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Community Spaces Navigation */}
              <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-5 md:p-6 h-min order-2 lg:order-1">
                <h3 className="font-medium text-lg mb-4 pb-2 border-b border-neutral-100 text-[#9e7a68] text-center lg:text-left">Community Spaces</h3>
                <ul className="space-y-2 md:space-y-3">
                  {DEFAULT_CHAT_SPACES.map((space, index) => (
                    <li key={index}>
                      <Link href={user ? "/chat" : "/auth"} className={`p-3 md:p-4 flex items-center rounded-md hover:bg-[#9e7a68] hover:bg-opacity-10 hover:text-[#9e7a68] transition-colors ${index === 0 ? 'bg-[#9e7a68] bg-opacity-10 text-[#9e7a68]' : ''}`}>
                        {space.isPrivate && <span className="material-icons mr-2 md:mr-3 text-base md:text-lg">lock</span>}
                        <span className="font-medium">{space.name}</span>
                        {space.isPrivate && (
                          <span className="ml-auto text-xs bg-[#9e7a68] text-white px-2 py-1 rounded-full shadow-sm">
                            {space.memberCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <Button 
                    asChild
                    variant="link" 
                    className="w-full flex items-center justify-center gap-2 text-[#9e7a68] hover:text-[#876258] font-medium p-3 md:p-4"
                  >
                    <Link href={user ? "/chat" : "/auth"}>
                      <span className="material-icons text-base md:text-lg">add_circle</span>
                      <span>Create New Space</span>
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Chat Preview */}
              <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-md flex flex-col order-1 lg:order-2 mb-6 lg:mb-0">
                {/* Chat Header */}
                <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
                  <div className="flex items-center">
                    <span className="material-icons mr-2 md:mr-3 text-xl text-[#9e7a68]">tag</span>
                    <h3 className="font-medium text-lg md:text-xl text-[#9e7a68]">General Discussion</h3>
                  </div>
                  <div className="flex items-center text-sm md:text-base text-gray-500 ml-auto">
                    <span className="material-icons text-base md:text-lg mr-1 md:mr-2">person</span>
                    <span>238 members</span>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-grow p-5 md:p-6 overflow-y-auto space-y-5 md:space-y-6" style={{ maxHeight: "400px" }}>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#9e7a68] bg-opacity-20 flex-shrink-0 flex items-center justify-center text-[#9e7a68] font-medium shadow-sm">
                      SM
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1 md:mb-2">
                        <span className="font-medium text-[#9e7a68] text-base md:text-lg">Sarah M.</span>
                        <span className="text-xs md:text-sm text-gray-500">Today at 10:23 AM</span>
                      </div>
                      <div className="bg-neutral-50 p-4 md:p-5 rounded-lg chat-bubble-left shadow-sm">
                        <p className="text-gray-700 text-base md:text-lg">Hi everyone! I'm new to the community. My husband and I just blended our family with 3 kids from previous marriages. Looking for advice on holiday schedules!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#9e7a68] flex-shrink-0 flex items-center justify-center text-white font-medium shadow-sm">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1 md:mb-2">
                        <span className="font-medium text-[#9e7a68] text-base md:text-lg">James D.</span>
                        <span className="text-xs md:text-sm text-gray-500">Today at 10:30 AM</span>
                        <span className="text-xs md:text-sm px-2 py-0.5 bg-[#9e7a68] bg-opacity-10 text-[#9e7a68] rounded-full">Moderator</span>
                      </div>
                      <div className="bg-neutral-50 p-4 md:p-5 rounded-lg chat-bubble-left shadow-sm">
                        <p className="text-gray-700 text-base md:text-lg">Welcome, Sarah! Holiday scheduling can be tricky. We actually have a great resource in our Files section called "Holiday Planning for Blended Families". It has templates you can use!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#9e7a68] bg-opacity-20 flex-shrink-0 flex items-center justify-center text-[#9e7a68] font-medium shadow-sm">
                      LW
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1 md:mb-2">
                        <span className="font-medium text-[#9e7a68] text-base md:text-lg">Lisa W.</span>
                        <span className="text-xs md:text-sm text-gray-500">Today at 10:45 AM</span>
                      </div>
                      <div className="bg-neutral-50 p-4 md:p-5 rounded-lg chat-bubble-left shadow-sm">
                        <p className="text-gray-700 text-base md:text-lg">@Sarah M. We've been a blended family for 5 years now. The biggest thing that helped us was creating a shared digital calendar that everyone (including co-parents) has access to. Happy to chat more about our system!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-5 md:p-6 border-t border-neutral-100">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder={user ? "Type your message..." : "Sign in to join the conversation"} 
                      disabled={!user}
                      className="w-full px-5 py-4 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e7a68] focus:border-transparent shadow-sm text-base"
                    />
                    {user && (
                      <Button 
                        disabled
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e7a68] hover:text-[#876258]"
                        variant="ghost"
                        size="icon"
                      >
                        <span className="material-icons text-xl">send</span>
                      </Button>
                    )}
                    {!user && (
                      <Button
                        asChild
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#9e7a68] hover:bg-[#876258] text-white text-sm px-4 py-1.5 rounded-full"
                      >
                        <Link href="/auth">Sign In</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-[#9e7a68] bg-opacity-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-6 text-[#9e7a68]">Community Stories</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
              Hear from families who have found support and connection in our community
            </p>
            
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
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-4 text-[#9e7a68]">Join Our Community</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
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
        <section className="py-16 md:py-24 bg-[#9e7a68] relative overflow-hidden">
          {/* Background design elements */}
          <div className="absolute top-0 left-0 w-full h-20 bg-white opacity-5"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white opacity-10 -mb-10 -mr-10"></div>
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
          
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 md:mb-6">Ready to Join The Blended Circle?</h2>
              <p className="text-white text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 px-2">
                Connect with families who understand your journey and find the support you need to thrive together.
              </p>
            </div>
            
            {/* Sign Up Form */}
            <div className="max-w-md mx-auto bg-white rounded-xl p-6 md:p-8 shadow-xl">
              <h3 className="text-xl md:text-2xl font-medium mb-6 text-[#9e7a68]">Create Your Account</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="py-3 px-4 border-neutral-200 focus:border-[#9e7a68] focus:ring-[#9e7a68] text-base" />
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
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="py-3 px-4 border-neutral-200 focus:border-[#9e7a68] focus:ring-[#9e7a68] text-base" />
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
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="py-3 px-4 border-neutral-200 focus:border-[#9e7a68] focus:ring-[#9e7a68] text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-neutral-300 data-[state=checked]:bg-[#9e7a68] data-[state=checked]:border-[#9e7a68]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-600 text-sm">
                            I agree to the <a href="#" className="text-[#9e7a68] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#9e7a68] font-medium hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9e7a68] hover:bg-[#876258] text-white font-medium px-6 py-3.5 mt-4 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                  >
                    Create Account
                  </Button>
                </form>
              </Form>
              <div className="mt-5 text-center text-sm text-gray-600">
                Already have an account? <Link href="/auth" className="text-[#9e7a68] font-medium hover:underline">Sign In</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
