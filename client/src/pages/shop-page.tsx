import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, Tags } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function ShopPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [cart, setCart] = useState<any[]>([]);
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    refetchOnWindowFocus: false,
  });
  
  // Get discount percentage based on user's subscription tier
  const getDiscountPercentage = () => {
    if (!user) return 0;
    
    switch (user.subscriptionTier) {
      case 'family':
        return 10;
      case 'premium':
        return 20;
      default:
        return 0;
    }
  };
  
  // Apply discount to price
  const getDiscountedPrice = (price: number) => {
    const discountPercent = getDiscountPercentage();
    if (discountPercent === 0) return price;
    
    return price - (price * (discountPercent / 100));
  };
  
  // Filter and sort products
  const filteredProducts = products
    .filter((product: any) => {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortOrder === "priceAsc") {
        return a.price - b.price;
      } else if (sortOrder === "priceDesc") {
        return b.price - a.price;
      } else if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0; // Default for "featured"
    });
  
  // Add to cart
  const addToCart = (product: any) => {
    setCart([...cart, product]);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
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
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">The Blended Circle Shop</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Resources, merchandise, and tools designed specifically for blended families.
              {user && getDiscountPercentage() > 0 && (
                <span className="font-medium"> Enjoy your {getDiscountPercentage()}% member discount!</span>
              )}
            </p>
          </div>
        </section>
        
        {/* Shop Content */}
        <section className="py-12 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            {/* Filters and search */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Button variant="outline" className="gap-2">
                  <ShoppingCart size={16} />
                  <span>Cart ({cart.length})</span>
                </Button>
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    {cart.length}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Product grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="overflow-hidden flex flex-col">
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                      {getDiscountPercentage() > 0 && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          {getDiscountPercentage()}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4 flex-grow">
                      <h3 className="text-lg font-medium mb-1">{product.name}</h3>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          {getDiscountPercentage() > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">
                                {formatPrice(getDiscountedPrice(product.price))}
                              </span>
                              <span className="text-sm text-neutral line-through">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        
                        {product.inventory > 0 ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <p className="text-neutral-dark text-sm mb-4">{product.description}</p>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => addToCart(product)}
                        disabled={product.inventory <= 0}
                      >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Tags className="h-12 w-12 mx-auto text-neutral-dark mb-4" />
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-neutral max-w-md mx-auto">
                  {searchQuery 
                    ? "We couldn't find any products matching your search. Please try different keywords."
                    : "Our shop is currently being updated. Please check back soon for new products!"}
                </p>
              </Card>
            )}
          </div>
        </section>
        
        {/* Subscription Promotion */}
        {(!user || user.subscriptionTier === 'free' || user.subscriptionTier === 'basic') && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="bg-primary/10 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold mb-2">Upgrade for Member Discounts</h2>
                <p className="text-neutral-dark mb-6 max-w-lg mx-auto">
                  Family tier members receive 10% off and Premium members enjoy 20% off all shop purchases!
                </p>
                <Button asChild>
                  <a href="/subscribe">View Subscription Plans</a>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
