import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { Menu, X, Home } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`bg-white ${isScrolled ? "shadow-md" : ""} fixed w-full top-0 z-50 transition-shadow duration-300`}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.webp" 
              alt="The Blended Circle Logo" 
              className="h-14 w-auto"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {NAVIGATION_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`font-medium ${location === item.path ? 'text-primary' : 'text-neutral-dark hover:text-primary'} transition-colors`}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link href="/chat" className={`font-medium ${location === '/chat' ? 'text-primary' : 'text-neutral-dark hover:text-primary'} transition-colors`}>
                Chat
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-light text-primary-dark">
                        {user.displayName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName || user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/subscribe" className="cursor-pointer">
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="bg-[#9e7a68] hover:bg-[#876258] text-white px-5 py-2 rounded-full transition-colors shadow-sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-neutral-dark focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-light">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            {NAVIGATION_ITEMS.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-medium py-2 ${location === item.path ? 'text-primary' : 'text-neutral-dark hover:text-primary'} transition-colors`}
              >
                {item.name}
              </Link>
            ))}
            
            {user && (
              <Link 
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-medium py-2 ${location === '/chat' ? 'text-primary' : 'text-neutral-dark hover:text-primary'} transition-colors`}
              >
                Chat
              </Link>
            )}
            
            {user ? (
              <>
                <Link 
                  href="/subscribe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium py-2 text-neutral-dark hover:text-primary transition-colors"
                >
                  Subscription
                </Link>
                <Button 
                  onClick={() => {
                    logoutMutation.mutate();
                    setMobileMenuOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                className="bg-[#9e7a68] hover:bg-[#876258] text-white px-5 py-2 rounded-full shadow-sm transition-all duration-300 w-full mt-2"
              >
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
