import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { CookieConsent } from "@/components/ui/cookie-consent";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import EventsPage from "@/pages/events-page";
import LiveEventsPage from "@/pages/live-events-page";
import ShopPage from "@/pages/shop-page";
import ContactPage from "@/pages/contact-page";
import ChatPage from "@/pages/chat-page";
import SubscribePage from "@/pages/subscribe-page";
import ProfilePage from "@/pages/profile-page";
import ProfileEditPage from "@/pages/profile-edit-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/live" component={LiveEventsPage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/contact" component={ContactPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/edit" component={ProfileEditPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <CookieConsent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
