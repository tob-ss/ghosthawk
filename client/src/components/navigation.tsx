import { Link, useLocation } from "wouter";
import { Search, Menu, X, User, LogOut, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimpleDropdown, SimpleDropdownItem, SimpleDropdownSeparator } from "@/components/ui/simple-dropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Companies", href: "/companies" },
    { name: "Industry Insights", href: "/#insights" },
    { name: "Platform Stats", href: "/stats" },
  ];

  const authenticatedNavigation = [
    { name: "Home", href: "/landing" },
    { name: "Dashboard", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Report Experience", href: "/report" },
    { name: "My Experiences", href: "/my-experiences" },
    { name: "Platform Stats", href: "/stats" },
  ];

  const currentNav = isAuthenticated ? authenticatedNavigation : navigation;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Search className="h-6 w-6 text-blue-600 mr-2" />
                GhostHawk
              </h1>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {currentNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <SimpleDropdown
                trigger={
                  <div className="relative h-8 w-8 rounded-full cursor-pointer hover:bg-gray-100 flex items-center justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                }
                className="w-56"
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && (
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <SimpleDropdownSeparator />
                <SimpleDropdownItem>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </SimpleDropdownItem>
                <SimpleDropdownItem>
                  <Link href="/my-experiences" className="flex items-center w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    My Experiences
                  </Link>
                </SimpleDropdownItem>
                <SimpleDropdownSeparator />
                <SimpleDropdownItem onClick={() => window.location.href = "/api/logout"}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </SimpleDropdownItem>
              </SimpleDropdown>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button 
                  variant="default"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Join Free
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4">
                  {currentNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-base font-medium transition-colors ${
                        location === item.href
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {!isAuthenticated && (
                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          window.location.href = "/api/login";
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          window.location.href = "/api/login";
                        }}
                      >
                        Join Free
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
