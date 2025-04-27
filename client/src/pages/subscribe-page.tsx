import { useEffect, import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionCard } from "@/components/ui/subscription-card";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { Check, AlertTriangle, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// M-PESA payment form schema
const mpesaPaymentSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?[0-9]+$/, "Phone number must contain only numbers, optionally with a '+' prefix"),
});

// MPesaPaymentForm component for handling the payment
function MPesaPaymentForm({ 
  planType, 
  amount, 
  onSuccess 
}: { 
  planType: string; 
  amount: number;
  onSuccess: (data: any) => void;
}) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  
  // Setup form
  const form = useForm<z.infer<typeof mpesaPaymentSchema>>({
    resolver: zodResolver(mpesaPaymentSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof mpesaPaymentSchema>) => {
    setIsProcessing(true);
    setTransactionStatus('pending');
    
    try {
      const response = await apiRequest("POST", "/api/initiate-mpesa-payment", {
        amount,
        phoneNumber: values.phoneNumber,
        planType,
      });
      
      const data = await response.json();
      
      // In a real implementation, we would poll for the transaction status
      // or use a WebSocket to get real-time updates
      // For now, we'll simulate a successful payment after a delay
      
      toast({
        title: "Payment Initiated",
        description: "Please check your phone and complete the payment",
      });
      
      // Simulate callback after 5 seconds (in a real app this would come from server)
      setTimeout(() => {
        setTransactionStatus('success');
        onSuccess({
          transactionId: data.transactionRef,
          checkoutRequestId: data.checkoutRequestId,
        });
      }, 5000);
      
    } catch (error: any) {
      setTransactionStatus('error');
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate M-PESA payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg flex items-start space-x-4">
        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium mb-1">M-PESA Payment</h3>
          <p className="text-sm text-neutral-dark">
            Enter your phone number to receive a payment prompt on your phone. Follow the instructions to complete the payment.
          </p>
        </div>
      </div>
      
      {transactionStatus === 'pending' ? (
        <div className="text-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="font-medium mb-1">Processing Payment</h3>
          <p className="text-sm text-neutral-dark">
            Please check your phone and complete the payment prompt.
          </p>
        </div>
      ) : transactionStatus === 'success' ? (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="mx-auto mb-4 h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">Payment Successful!</h3>
          <p className="text-sm text-neutral-dark">
            Your subscription has been activated.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>M-PESA Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +254712345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : `Pay KES ${amount.toLocaleString()} via M-PESA`}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default function SubscribePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the current subscription tier
  const currentTier = user?.subscriptionTier || 'free';
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPlan(planId);
  };
  
  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Check for successful subscription
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('subscription') === 'success') {
      toast({
        title: "Subscription Successful!",
        description: "Thank you for subscribing to The Blended Circle!",
      });
      // In a real app, we would also refresh user data to get updated subscription status
    }
  }, [toast]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">Membership Plans</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Choose the right plan for you and your family to access our supportive community and resources.
            </p>
          </div>
        </section>
        
        {/* Subscription Plans Section */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            {!selectedPlan ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Select Your Membership Plan</h2>
                  {user && currentTier !== 'free' && (
                    <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>You are currently on the {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan</span>
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <SubscriptionCard
                    name={SUBSCRIPTION_PLANS.BASIC.name}
                    price={SUBSCRIPTION_PLANS.BASIC.price}
                    description={SUBSCRIPTION_PLANS.BASIC.description}
                    features={SUBSCRIPTION_PLANS.BASIC.features}
                    disabledFeatures={SUBSCRIPTION_PLANS.BASIC.disabledFeatures}
                    isPrimary={currentTier === 'basic'}
                    onClick={() => handleSelectPlan('BASIC')}
                    disabled={isLoading || currentTier === 'basic'}
                  />
                  
                  <SubscriptionCard
                    name={SUBSCRIPTION_PLANS.FAMILY.name}
                    price={SUBSCRIPTION_PLANS.FAMILY.price}
                    description={SUBSCRIPTION_PLANS.FAMILY.description}
                    features={SUBSCRIPTION_PLANS.FAMILY.features}
                    isPopular={SUBSCRIPTION_PLANS.FAMILY.popular}
                    isPrimary={currentTier === 'family' || (!selectedPlan && currentTier !== 'basic' && currentTier !== 'premium')}
                    onClick={() => handleSelectPlan('FAMILY')}
                    disabled={isLoading || currentTier === 'family'}
                  />
                  
                  <SubscriptionCard
                    name={SUBSCRIPTION_PLANS.PREMIUM.name}
                    price={SUBSCRIPTION_PLANS.PREMIUM.price}
                    description={SUBSCRIPTION_PLANS.PREMIUM.description}
                    features={SUBSCRIPTION_PLANS.PREMIUM.features}
                    isPrimary={currentTier === 'premium'}
                    onClick={() => handleSelectPlan('PREMIUM')}
                    disabled={isLoading || currentTier === 'premium'}
                  />
                </div>
              </>
            ) : (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-2">Complete Your Subscription</h2>
                    <p className="text-neutral-dark mb-6">
                      You're subscribing to the{" "}
                      <span className="font-medium">
                        {selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].name : ""} plan
                      </span>
                      .
                    </p>
                    
                    <MPesaPaymentForm 
                      planType={selectedPlan.toLowerCase()} 
                      amount={Number(SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].price.replace('KES ', '').replace(',', ''))}
                      onSuccess={(data) => {
                        // In a real implementation, we would handle subscription completion here
                        // For now, we'll just simulate a successful subscription
                        
                        // Update user subscription tier based on selected plan
                        apiRequest("POST", "/api/update-subscription", {
                          tier: selectedPlan.toLowerCase(),
                          transactionId: data.transactionId
                        })
                          .then(() => {
                            toast({
                              title: "Subscription Updated",
                              description: `Your subscription has been upgraded to ${selectedPlan}`,
                            });
                            
                            // Redirect to home with success query param
                            window.location.href = "/?subscription=success";
                          })
                          .catch(error => {
                            toast({
                              title: "Error",
                              description: error.message || "Failed to update subscription",
                              variant: "destructive",
                            });
                          });
                      }}
                    />
                    
                    <Button 
                      variant="link" 
                      className="mt-4 p-0"
                      onClick={() => {
                        setSelectedPlan(null);
                      }}
                    >
                      Back to plan selection
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
        
        {/* Plan Comparison Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-semibold text-center mb-8">Plan Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-lightest">
                    <th className="p-4 text-left font-medium">Features</th>
                    <th className="p-4 text-center font-medium">Basic<br /><span className="text-sm font-normal text-neutral">{SUBSCRIPTION_PLANS.BASIC.price}/mo</span></th>
                    <th className="p-4 text-center font-medium">Family<br /><span className="text-sm font-normal text-neutral">{SUBSCRIPTION_PLANS.FAMILY.price}/mo</span></th>
                    <th className="p-4 text-center font-medium">Premium<br /><span className="text-sm font-normal text-neutral">{SUBSCRIPTION_PLANS.PREMIUM.price}/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Public Chat Spaces</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Weekly Newsletter</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Private Group Access</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center">Up to 3 groups</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Live Events</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Direct Messaging</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Shop Discount</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center">10%</td>
                    <td className="p-4 text-center">20%</td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Create Private Groups</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-neutral-light">
                    <td className="p-4">Priority Expert Access</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center">—</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">How do I change my subscription plan?</h3>
                  <p className="text-neutral-dark">
                    You can upgrade or downgrade your subscription at any time. Changes take effect at the end of your current billing cycle.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">Can I cancel my subscription?</h3>
                  <p className="text-neutral-dark">
                    Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">Do you offer family discounts?</h3>
                  <p className="text-neutral-dark">
                    Our Family and Premium plans are designed for entire households. Each subscription covers all family members in your household.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">Is my payment information secure?</h3>
                  <p className="text-neutral-dark">
                    Absolutely! We use M-PESA for payment processing, which maintains the highest level of security and protects your transaction information.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
