import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatSpace } from "@/components/community/ChatSpace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Lock, Plus, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

const createChatSpaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type CreateChatSpaceValues = z.infer<typeof createChatSpaceSchema>;

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatSpaceId, setSelectedChatSpaceId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Query for fetching chat spaces
  const { data: chatSpaces = [], isLoading } = useQuery({
    queryKey: ["/api/chat-spaces"],
    refetchOnWindowFocus: false,
  });
  
  // Create chat space mutation
  const createChatSpaceMutation = useMutation({
    mutationFn: async (data: CreateChatSpaceValues) => {
      const res = await apiRequest("POST", "/api/chat-spaces", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Chat space created successfully",
        variant: "default",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-spaces"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chat space",
        variant: "destructive",
      });
    },
  });
  
  // Setup form
  const form = useForm<CreateChatSpaceValues>({
    resolver: zodResolver(createChatSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });
  
  // Filter chat spaces based on search query
  const filteredChatSpaces = chatSpaces.filter((space: any) => {
    return space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (space.description && space.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  
  // Set the first chat space as selected if none is selected
  useEffect(() => {
    if (filteredChatSpaces.length > 0 && !selectedChatSpaceId) {
      setSelectedChatSpaceId(filteredChatSpaces[0].id);
    }
  }, [filteredChatSpaces, selectedChatSpaceId]);
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Handle form submission
  function onSubmit(data: CreateChatSpaceValues) {
    createChatSpaceMutation.mutate(data);
  }
  
  // Get selected chat space
  const selectedChatSpace = selectedChatSpaceId 
    ? filteredChatSpaces.find((space: any) => space.id === selectedChatSpaceId) 
    : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">Community Chat Spaces</h1>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Chat Spaces List */}
            <div className="lg:w-1/4 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg">Chat Spaces</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus size={16} />
                      <span>New</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Chat Space</DialogTitle>
                      <DialogDescription>
                        Create a new space for discussions on specific topics. Private spaces are only available to Family and Premium members.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Co-Parenting Support" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Briefly describe this chat space" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPrivate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={user?.subscriptionTier === 'free' || user?.subscriptionTier === 'basic'}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Make this a private space
                                </FormLabel>
                                {(user?.subscriptionTier === 'free' || user?.subscriptionTier === 'basic') && (
                                  <p className="text-xs text-muted-foreground">
                                    Upgrade to Family or Premium to create private spaces.
                                  </p>
                                )}
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={createChatSpaceMutation.isPending}
                          >
                            {createChatSpaceMutation.isPending ? "Creating..." : "Create Space"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  type="text" 
                  placeholder="Search spaces..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : filteredChatSpaces.length > 0 ? (
                <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]">
                  {filteredChatSpaces.map((space: any) => (
                    <li key={space.id}>
                      <Button
                        variant="ghost"
                        className={`w-full p-2 flex items-center justify-between rounded-md hover:bg-primary-light hover:text-primary-dark transition-colors text-left ${
                          selectedChatSpaceId === space.id ? 'bg-primary bg-opacity-10 text-primary' : ''
                        }`}
                        onClick={() => setSelectedChatSpaceId(space.id)}
                      >
                        <div className="flex items-center">
                          {space.isPrivate && <Lock className="mr-2 h-4 w-4 flex-shrink-0" />}
                          
                          <span className="truncate">{space.name}</span>
                        </div>
                        {space.memberCount && (
                          <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {space.memberCount}
                          </span>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-2">
                    <Tag className="h-8 w-8 text-neutral" />
                  </div>
                  <p className="text-neutral-dark">No chat spaces found</p>
                  <p className="text-sm text-neutral">
                    {searchQuery ? "Try a different search term" : "Create a new chat space to get started"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Main Chat Area */}
            <div className="lg:w-3/4 bg-white rounded-lg shadow-sm flex flex-col h-[calc(100vh-200px)]">
              {selectedChatSpace ? (
                <ChatSpace
                  id={selectedChatSpace.id}
                  name={selectedChatSpace.name}
                  isPrivate={selectedChatSpace.isPrivate}
                  memberCount={selectedChatSpace.memberCount || 0}
                  currentUser={user}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                      <MessageSquare className="h-12 w-12 text-neutral" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Select a Chat Space</h3>
                    <p className="text-neutral-dark">
                      Choose a chat space from the sidebar or create a new one to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
