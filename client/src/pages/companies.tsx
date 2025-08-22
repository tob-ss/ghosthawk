import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Building2, Star, TrendingUp, MapPin, Globe, Users, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleSelect, SimpleSelectContent, SimpleSelectItem, SimpleSelectTrigger, SimpleSelectValue } from "@/components/ui/simple-select";
import Navigation from "@/components/navigation";
import { Link } from "wouter";

interface Company {
  id: string;
  name: string;
  type: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  responseRate: number;
  avgResponseTime: number | null;
  totalExperiences: number;
  avgRating: number;
}

interface SearchParams {
  query: string;
  industry: string;
  location: string;
  type: string;
  responseRate: string;
  sortBy: string;
  page: number;
  limit: number;
}

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    industry: "",
    location: "",
    type: "",
    responseRate: "",
    sortBy: "rating",
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Build query string for API call
  const queryString = Object.entries(searchParams)
    .filter(([key, value]) => value !== "" && value !== 0)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const { data: companiesData, isLoading, error } = useQuery<{
    companies: Company[];
    total: number;
  }>({
    queryKey: [`/api/companies/search?${queryString}`],
    refetchOnWindowFocus: false,
  });

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilterChange = (key: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil((companiesData?.total || 0) / searchParams.limit);

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Companies & Recruiters</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Discover companies and recruiters with transparent recruitment practices
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies or recruiters..."
                  value={searchParams.query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <SimpleSelect 
                      value={searchParams.type} 
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SimpleSelectTrigger>
                        <SimpleSelectValue placeholder="All Types" />
                      </SimpleSelectTrigger>
                      <SimpleSelectContent>
                        <SimpleSelectItem value="">All Types</SimpleSelectItem>
                        <SimpleSelectItem value="company">Direct Companies</SimpleSelectItem>
                        <SimpleSelectItem value="recruiter">Recruiters/Agencies</SimpleSelectItem>
                      </SimpleSelectContent>
                    </SimpleSelect>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <SimpleSelect 
                      value={searchParams.industry} 
                      onValueChange={(value) => handleFilterChange('industry', value)}
                    >
                      <SimpleSelectTrigger>
                        <SimpleSelectValue placeholder="All Industries" />
                      </SimpleSelectTrigger>
                      <SimpleSelectContent>
                        <SimpleSelectItem value="">All Industries</SimpleSelectItem>
                        <SimpleSelectItem value="technology">Technology</SimpleSelectItem>
                        <SimpleSelectItem value="finance">Finance</SimpleSelectItem>
                        <SimpleSelectItem value="healthcare">Healthcare</SimpleSelectItem>
                        <SimpleSelectItem value="marketing">Marketing</SimpleSelectItem>
                        <SimpleSelectItem value="manufacturing">Manufacturing</SimpleSelectItem>
                      </SimpleSelectContent>
                    </SimpleSelect>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Rate</label>
                    <SimpleSelect 
                      value={searchParams.responseRate} 
                      onValueChange={(value) => handleFilterChange('responseRate', value)}
                    >
                      <SimpleSelectTrigger>
                        <SimpleSelectValue placeholder="Any Rate" />
                      </SimpleSelectTrigger>
                      <SimpleSelectContent>
                        <SimpleSelectItem value="">Any Rate</SimpleSelectItem>
                        <SimpleSelectItem value="high">Above 70%</SimpleSelectItem>
                        <SimpleSelectItem value="medium">30-70%</SimpleSelectItem>
                        <SimpleSelectItem value="low">Below 30%</SimpleSelectItem>
                      </SimpleSelectContent>
                    </SimpleSelect>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <SimpleSelect 
                      value={searchParams.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SimpleSelectTrigger>
                        <SimpleSelectValue />
                      </SimpleSelectTrigger>
                      <SimpleSelectContent>
                        <SimpleSelectItem value="rating">Lowest Ghost Risk</SimpleSelectItem>
                        <SimpleSelectItem value="response_rate">Response Rate</SimpleSelectItem>
                        <SimpleSelectItem value="recent">Most Recent</SimpleSelectItem>
                      </SimpleSelectContent>
                    </SimpleSelect>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchParams({
                        query: "",
                        industry: "",
                        location: "",
                        type: "",
                        responseRate: "",
                        sortBy: "rating",
                        page: 1,
                        limit: 12,
                      })}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading companies. Please try again.</p>
            </CardContent>
          </Card>
        ) : companiesData && companiesData.companies.length > 0 ? (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {companiesData.total} companies • Page {searchParams.page} of {totalPages}
              </p>
            </div>

            {/* Companies Grid */}
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
                      {company.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {company.description}
                        </p>
                      )}

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
                            <AlertTriangle className="h-4 w-4 text-gray-500" />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={searchParams.page === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchParams({
                  query: "",
                  industry: "",
                  location: "",
                  type: "",
                  responseRate: "",
                  sortBy: "rating",
                  page: 1,
                  limit: 12,
                })}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}