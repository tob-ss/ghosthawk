import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, Shield, Users, Building, Bus, Star, MapPin, Globe, ArrowRight, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect, SimpleSelectContent, SimpleSelectItem, SimpleSelectTrigger, SimpleSelectValue } from "@/components/ui/simple-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import SearchBar from "@/components/search-bar";
import CompanyCard from "@/components/company-card";
import InsightsDashboard from "@/components/insights-dashboard";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    location: "",
    type: "",
    responseRate: "",
  });

  const { isAuthenticated } = useAuth();

  // Get platform stats
  const { data: stats } = useQuery<{
    totalCompanies: number;
    totalExperiences: number;
    avgResponseRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Get featured companies (lowest ghost risk)
  const featuredCompaniesQuery = "limit=6&sortBy=rating";
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
    queryKey: [`/api/companies/search?${featuredCompaniesQuery}`],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, this would navigate to results
      console.log("Searching for:", searchQuery, filters);
    }
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseRateBadge = (rate: number) => {
    if (rate >= 70) return "bg-green-100 text-green-800";
    if (rate >= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getGhostJobRisk = (score: number) => {
    if (score <= 20) return { label: "Very Low Ghost Risk", color: "text-green-600", bg: "bg-green-100 text-green-800" };
    if (score <= 40) return { label: "Low Ghost Risk", color: "text-green-500", bg: "bg-green-100 text-green-700" };
    if (score <= 60) return { label: "Medium Ghost Risk", color: "text-yellow-600", bg: "bg-yellow-100 text-yellow-800" };
    if (score <= 80) return { label: "High Ghost Risk", color: "text-orange-600", bg: "bg-orange-100 text-orange-800" };
    return { label: "Very High Ghost Risk", color: "text-red-600", bg: "bg-red-100 text-red-800" };
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

      {/* Featured Companies */}
      <section id="discover" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Lowest Ghost Risk Companies & Recruiters</h3>
            <p className="text-lg text-gray-600">Discover companies with the best candidate experiences and response rates</p>
          </div>

          {companiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companiesData?.companies && companiesData.companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {companiesData.companies.map((company) => (
                  <Link key={company.id} href={`/company/${company.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{company.name}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {company.type === 'company' ? 'Direct Company' : 'Recruiter'}
                              </Badge>
                              {company.industry && (
                                <Badge variant="secondary">{company.industry}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <TrendingUp className="h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-500">Response Rate</span>
                            </div>
                            <div className={`text-lg font-semibold ${getResponseRateColor(company.responseRate)}`}>
                              {company.responseRate}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-500">Ghost Risk</span>
                            </div>
                            <div className={`text-lg font-semibold ${getGhostJobRisk(company.avgRating).color}`}>
                              {company.avgRating}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {company.totalExperiences} experiences
                          </div>
                          <Badge className={getGhostJobRisk(company.avgRating).bg}>
                            {getGhostJobRisk(company.avgRating).label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              <div className="text-center">
                <Link href="/companies">
                  <Button size="lg" variant="outline" className="inline-flex items-center">
                    View All Companies
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h4>
              <p className="text-gray-600">Be the first to report an experience with a company.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Share Experience CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Share Your Experience</h3>
          <p className="text-xl text-blue-100 mb-8">
            Help other job seekers by sharing your recruitment experiences. Every story matters and builds a stronger community.
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/report">
                  <Button size="lg" variant="secondary" className="inline-flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Report Experience
                  </Button>
                </Link>
                <Link href="/my-experiences">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 inline-flex items-center"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View My Experiences
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => window.location.href = "/api/login"}
                  className="inline-flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Sign Up & Share
                </Button>
                <Link href="/companies">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 inline-flex items-center"
                  >
                    <Building className="h-5 w-5 mr-2" />
                    Browse Companies
                  </Button>
                </Link>
              </>
            )}
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
