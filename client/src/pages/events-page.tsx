import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, SearchIcon, UserIcon } from "lucide-react";
import { Loader2 } from "lucide-react";


// Sample events data
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Effective Communication in Blended Families",
    description: "Join family therapist Dr. Angela Martinez as she shares practical communication strategies for blended families.",
    imageUrl: "/images/stepmum-podcast.jpg",
    startDate: "2024-02-15T14:00:00Z",
    eventType: "workshop",
    attendeeCount: 45,
    attendees: []
  },
  {
    id: 2,
    title: "Virtual Family Game Night",
    description: "Bring the whole family for a fun evening of virtual games designed to strengthen family bonds across households.",
    imageUrl: "/images/stepmum-podcast.jpg",
    startDate: "2024-02-22T18:00:00Z",
    eventType: "social",
    attendeeCount: 28,
    attendees: []
  },
  {
    id: 3,
    title: "Co-Parenting Success Strategies",
    description: "Expert panel discussion featuring family counselors and successful co-parents sharing their insights.",
    imageUrl: "/images/stepmum-podcast.jpg",
    startDate: "2024-03-03T15:00:00Z",
    eventType: "live",
    attendeeCount: 72,
    attendees: []
  }
];
export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchOnWindowFocus: false,
  });
  
  // Attend event mutation
  const attendEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("POST", `/api/events/${eventId}/attend`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully registered for this event.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register for this event. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter events based on search query and tab
  const filteredEvents = events.filter((event: any) => {
    // Filter by search query
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && event.eventType === activeTab;
  });
  
  // Handle RSVP
  const handleRsvp = (eventId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to RSVP for events.",
        variant: "destructive",
      });
      return;
    }
    
    attendEventMutation.mutate(eventId);
  };
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">Upcoming Events</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join our virtual events designed specifically for blended families. Learn, connect, and grow together.
            </p>
          </div>
        </section>
        
        {/* Events List Section */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            
            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-auto flex-grow max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  type="text" 
                  placeholder="Search events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="workshop">Workshops</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="live">Live</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event: any) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    imageUrl={event.imageUrl}
                    startDate={event.startDate}
                    eventType={event.eventType}
                    attendeeCount={event.attendeeCount || 0}
                    onRsvp={handleRsvp}
                    isAttending={user && event.attendees?.includes(user.id)}
                    isLoading={attendEventMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <CalendarIcon className="h-12 w-12 text-primary opacity-70" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No events found</h3>
                  <p className="text-neutral">
                    {searchQuery 
                      ? "No events match your search criteria. Please try a different search term."
                      : "There are currently no upcoming events. Check back soon!"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
        
        {/* Event Hosting CTA */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-primary-light/30 rounded-lg p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-semibold mb-2">Want to Host an Event?</h2>
                <p className="text-neutral-dark mb-4">
                  Share your expertise or facilitate discussions about blended family experiences. 
                  Hosts receive activity points and recognition in our community.
                </p>
                {user ? (
                  <a href="#" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                    Apply to become a host
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <p className="text-sm text-neutral">
                    <a href="/auth" className="text-primary hover:underline">Sign in</a> to apply to become an event host.
                  </p>
                )}
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
