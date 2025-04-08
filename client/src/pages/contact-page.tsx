import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, MessageSquare, Send } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would send the data to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">Contact Us</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              We're here to help with any questions or suggestions you might have about The Blended Circle community.
            </p>
          </div>
        </section>
        
        {/* Contact Form and Info Section */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="md:col-span-1">
                <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <Mail className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-neutral-dark">support@blendedcircle.com</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-neutral-dark">(555) 123-4567</p>
                        <p className="text-xs text-neutral">Monday to Friday, 9am to 5pm EST</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-neutral-dark">
                          123 Blended Family Lane<br />
                          Supportville, CA 94105<br />
                          United States
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Community Support</h3>
                        <p className="text-neutral-dark">
                          Already a member? Visit our Help section in the community or message a moderator directly.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
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
                                  <Input type="email" placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="How can we help you?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please provide details about your question or request..." 
                                  className="min-h-[150px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto gap-2" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">What is The Blended Circle?</h3>
                  <p className="text-neutral-dark">
                    The Blended Circle is an online community platform dedicated to supporting blended families through shared experiences, resources, and connection.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">How do I join the community?</h3>
                  <p className="text-neutral-dark">
                    You can join by creating an account on our website. We offer different subscription tiers to access various features of the community.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">Can I cancel my subscription at any time?</h3>
                  <p className="text-neutral-dark">
                    Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">How do I participate in live events?</h3>
                  <p className="text-neutral-dark">
                    Live events are available to Family and Premium tier members. You can view upcoming events on the Events page and RSVP to receive a link to join.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">Is my information kept private?</h3>
                  <p className="text-neutral-dark">
                    Yes, we take privacy seriously. Your personal information is never shared with third parties, and you can control your privacy settings within your account.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <a href="#">View All FAQs</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
