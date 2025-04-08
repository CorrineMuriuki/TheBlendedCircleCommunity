import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Video, Clock, AlertTriangle, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function LiveEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch live events - filter for "live" event type
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchOnWindowFocus: false,
  });
  
  // Filter and sort events
  const events = allEvents.filter((event: any) => event.eventType === "live");
  
  // Split events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter((event: any) => new Date(event.startDate) > now)
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const pastEvents = events.filter((event: any) => new Date(event.startDate) <= now)
    .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Determine if user has access based on subscription tier
  const hasAccess = user && (user.subscriptionTier === 'family' || user.subscriptionTier === 'premium');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-dark to-primary text-white py-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">Live Video Events</h1>
            <p className="text-lg opacity-90 mb-8">
              Join our interactive live sessions with experts, coaches, and fellow members of the blended family community.
            </p>
            
            {!user ? (
              <Button asChild className="bg-white text-primary-dark hover:bg-neutral-lightest">
                <Link href="/auth">Sign In to Join Live Events</Link>
              </Button>
            ) : !hasAccess ? (
              <Button asChild className="bg-white text-primary-dark hover:bg-neutral-lightest">
                <Link href="/subscribe">Upgrade Your Subscription</Link>
              </Button>
            ) : null}
          </div>
        </section>
        
        {/* Event Tabs Section */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4 max-w-5xl">
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Live Events</TabsTrigger>
                  <TabsTrigger value="past">Past Recordings</TabsTrigger>
                </TabsList>
                
                {user && hasAccess && (
                  <div className="mt-4 sm:mt-0">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <Clock className="w-3 h-3 mr-1" /> Premium Access Enabled
                    </Badge>
                  </div>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming">
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-6">
                        {upcomingEvents.map((event: any) => (
                          <Card key={event.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3 h-48 md:h-auto relative">
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title} 
                                  className="w-full h-full object-cover" 
                                />
                                <Badge className="absolute top-4 right-4 bg-red-500">LIVE</Badge>
                              </div>
                              <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center text-sm text-neutral mb-2">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{formatDate(new Date(event.startDate))}</span>
                                  </div>
                                  <h3 className="text-xl font-medium mb-2">{event.title}</h3>
                                  <p className="text-neutral-dark mb-4">{event.description}</p>
                                  <div className="flex items-center text-sm text-neutral">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>{event.attendeeCount || 0} attending</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                  <div className="flex items-center">
                                    <Video className="text-primary mr-2" />
                                    <span className="text-sm font-medium">
                                      {event.isVirtual ? event.location : "In-person event"}
                                    </span>
                                  </div>
                                  
                                  {!user ? (
                                    <Button asChild variant="default">
                                      <Link href="/auth">Sign In to RSVP</Link>
                                    </Button>
                                  ) : !hasAccess ? (
                                    <Button asChild variant="default">
                                      <Link href="/subscribe">Upgrade to Attend</Link>
                                    </Button>
                                  ) : (
                                    <Button variant="default">
                                      RSVP Now
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-medium mb-2">No Upcoming Live Events</h3>
                          <p className="text-neutral max-w-lg mx-auto">
                            We're currently planning our next series of live events. 
                            Check back soon or subscribe to our newsletter to be notified when new events are scheduled.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    {pastEvents.length > 0 ? (
                      <div className="space-y-6">
                        {pastEvents.map((event: any) => (
                          <Card key={event.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3 h-48 md:h-auto relative">
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title} 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-neutral-darkest bg-opacity-50 flex items-center justify-center">
                                  <Button variant="outline" className="rounded-full text-white border-white hover:bg-white/20">
                                    <Video className="mr-2 h-4 w-4" /> Play Recording
                                  </Button>
                                </div>
                              </div>
                              <CardContent className="p-6 md:w-2/3">
                                <div className="flex items-center text-sm text-neutral mb-2">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{formatDate(new Date(event.startDate))}</span>
                                </div>
                                <h3 className="text-xl font-medium mb-2">{event.title}</h3>
                                <p className="text-neutral-dark mb-4">{event.description}</p>
                                
                                {!user ? (
                                  <div className="mt-4 flex items-center text-sm bg-neutral-100 p-3 rounded-md">
                                    <AlertTriangle className="text-amber-500 mr-2 h-4 w-4" />
                                    <span>Sign in to watch the recording of this event.</span>
                                  </div>
                                ) : !hasAccess ? (
                                  <div className="mt-4 flex items-center text-sm bg-neutral-100 p-3 rounded-md">
                                    <AlertTriangle className="text-amber-500 mr-2 h-4 w-4" />
                                    <span>Upgrade your subscription to watch recordings of past events.</span>
                                  </div>
                                ) : (
                                  <div className="mt-4 flex items-center text-sm bg-green-100 text-green-800 p-3 rounded-md">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>Full access to watch and download this recording.</span>
                                  </div>
                                )}
                              </CardContent>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-medium mb-2">No Past Recordings Yet</h3>
                          <p className="text-neutral max-w-lg mx-auto">
                            We haven't held any live events yet. Join one of our upcoming events to participate in the live discussion!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </section>
        
        {/* Premium Access Info Section */}
        {(!user || !hasAccess) && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="bg-primary/10 rounded-lg p-8">
                <h2 className="text-2xl font-semibold mb-4 text-center">Premium Live Event Access</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <Video className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-2">Live Interactive Sessions</h3>
                    <p className="text-neutral-dark">Participate in Q&A, polls, and discussions during our expert-led sessions.</p>
                  </div>
                  
                  <div>
                    <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-2">Access Recordings</h3>
                    <p className="text-neutral-dark">Watch event recordings anytime. Never miss valuable content.</p>
                  </div>
                  
                  <div>
                    <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-2">Expert Speakers</h3>
                    <p className="text-neutral-dark">Learn from family therapists, lawyers, and successful blended parents.</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href={user ? "/subscribe" : "/auth"}>
                      {user ? "Upgrade Your Subscription" : "Sign Up For Premium Access"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
