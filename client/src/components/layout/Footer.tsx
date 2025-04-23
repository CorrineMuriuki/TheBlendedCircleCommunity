import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Facebook, Instagram, Twitter, Send } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logo from "../images/logo.jpg";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const { toast } = useToast();
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: NewsletterFormValues) {
    try {
      await apiRequest("POST", "/api/newsletter-subscribe", data);
      toast({
        title: "Successfully subscribed",
        description: "You've been added to our newsletter list.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <footer className="bg-[#333333] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-semibold">The Blended Circle</span>
            </div>
            <p className="text-[#e5e0db] mb-4">
              An online community dedicated to supporting blended families through shared experiences and resources.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-[#e5e0db] hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/events" className="text-[#e5e0db] hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/live" className="text-[#e5e0db] hover:text-white transition-colors">Live Video</Link></li>
              <li><Link href="/shop" className="text-[#e5e0db] hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/contact" className="text-[#e5e0db] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link href="/auth" className="text-[#e5e0db] hover:text-white transition-colors">Join Now</Link></li>
              <li><Link href="/subscribe" className="text-[#e5e0db] hover:text-white transition-colors">Membership Plans</Link></li>
              <li><a href="#" className="text-[#e5e0db] hover:text-white transition-colors">Guidelines</a></li>
              <li><a href="#" className="text-[#e5e0db] hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-[#e5e0db] hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Newsletter</h4>
            <p className="text-[#e5e0db] mb-4">Stay updated with our weekly newsletter.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          className="px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-[#4a4a4a] border-0 text-white"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white rounded-r-lg transition-colors"
                  disabled={form.formState.isSubmitting}
                >
                  <Send size={20} />
                </Button>
              </form>
            </Form>
          </div>
        </div>
        
        <div className="border-t border-[#4a4a4a] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#e5e0db] text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} The Blended Circle. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm text-[#e5e0db]">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
