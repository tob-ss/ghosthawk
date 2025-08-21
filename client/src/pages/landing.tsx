import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, Shield, Users, Building, Bus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import SearchBar from "@/components/search-bar";
import CompanyCard from "@/components/company-card";
import InsightsDashboard from "@/components/insights-dashboard";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    location: "",
    type: "",
    responseRate: "",
  });

  // Get platform stats
  const { data: stats } = useQuery<{
    totalCompanies: number;
    totalExperiences: number;
    avgResponseRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Get featured companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery<{
    companies: Array<{
      id: string;
      name: string;
      type: string;
      industry?: string;
      location?: string;
      responseRate: number;
      avgResponseTime: number | null;
      totalExperiences: number;
      avgRating: number;
    }>;
    total: number;
  }>({
    queryKey: ["/api/companies/search", { limit: 6, sortBy: "rating" }],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, this would navigate to results
      console.log("Searching for:", searchQuery, filters);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">Stop Getting Ghosted by Recruiters</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover which companies and recruiters actually respond to candidates. Make informed decisions about where to invest your job search time.
            </p>
            
            <SearchBar onSearch={handleSearch} />

            <div className="mt-8 flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
                <div className="text-blue-200">Companies Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalExperiences || 0}</div>
                <div className="text-blue-200">Experiences Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.avgResponseRate || 34}%</div>
                <div className="text-blue-200">Avg Response Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Job Seekers Trust GhostHawk</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Real data from real candidates to help you make smarter career decisions</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Real Response Rates</h4>
              <p className="text-gray-600">See actual response rates and timelines for companies and recruiters based on candidate experiences.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Stop Wasting Time</h4>
              <p className="text-gray-600">Identify companies with poor candidate experiences before you apply. Focus on opportunities that matter.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-yellow-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Community Driven</h4>
              <p className="text-gray-600">Built by job seekers, for job seekers. Share your experiences to help the entire community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Discovery */}
      <section id="discover" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Discover Companies & Recruiters</h3>
            <p className="text-lg text-gray-600">Research companies before you apply. See real candidate experiences and response rates.</p>
          </div>

          {/* Filter Panel */}
          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input 
                  placeholder="City, State" 
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Rate</label>
                <Select value={filters.responseRate} onValueChange={(value) => setFilters(prev => ({ ...prev, responseRate: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rate</SelectItem>
                    <SelectItem value="high">Above 70%</SelectItem>
                    <SelectItem value="medium">30-70%</SelectItem>
                    <SelectItem value="low">Below 30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <Select defaultValue="rating">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="response_rate">Response Rate</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Featured Companies */}
          {companiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : companiesData?.companies && companiesData.companies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companiesData.companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h4>
              <p className="text-gray-600">Try adjusting your search filters or be the first to report an experience with a company.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Make Better Career Decisions?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who use GhostHawk to research companies and share experiences.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign Up Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Insights Preview */}
      <InsightsDashboard />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">
                <Search className="inline h-5 w-5 text-blue-400 mr-2" />
                GhostHawk
              </h5>
              <p className="text-gray-400 text-sm mb-4">Making recruitment transparent, one experience at a time.</p>
            </div>
            
            <div>
              <h6 className="font-medium mb-4">Platform</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#discover" className="text-gray-400 hover:text-white transition-colors">Discover Companies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Industry Insights</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-medium mb-4">Support</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-medium mb-4">Legal</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; 2024 GhostHawk. All rights reserved. Making recruitment transparent for job seekers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
