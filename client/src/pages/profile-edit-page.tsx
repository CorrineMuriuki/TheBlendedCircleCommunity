import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect, Link, useLocation } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const profileFormSchema = z.object({
  displayName: z.string().nullable().optional(),
  email: z.string().email().min(1, "Email is required"),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  newsletterSubscription: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEditPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
      newsletterSubscription: user?.newsletterSubscription || false,
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Update user profile
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
        variant: "default",
      });
      
      // Check for achievements (profile completion)
      await apiRequest("POST", "/api/check-achievements");
      
      // Navigate back to profile page
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed to other members.
                  </FormDescription>
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
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address is used for account recovery and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the community a bit about yourself..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    A short bio to help other members get to know you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    A URL to an image you'd like to use as your profile picture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newsletterSubscription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Subscribe to Newsletter</FormLabel>
                    <FormDescription>
                      Receive weekly updates about new events, content, and community highlights.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}