import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building, FileText, TrendingUp } from "lucide-react";
import Navigation from "@/components/navigation";
import CompanyCard from "@/components/company-card";
import InsightsDashboard from "@/components/insights-dashboard";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Get user's recent experiences
  const { data: userExperiences, isLoading: experiencesLoading } = useQuery<Array<{
    id: string;
    position?: string;
    applicationDate: string;
    receivedResponse: boolean;
    responseTime?: string;
    communicationQuality?: string;
    comments?: string;
  }>>({
    queryKey: ["/api/experiences/user"],
    enabled: isAuthenticated,
  });

  // Get recommended companies
  const recommendedCompaniesQuery = "limit=4&sortBy=rating";
  const { data: companiesData } = useQuery<{
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
    queryKey: [`/api/companies/search?${recommendedCompaniesQuery}`],
  });

  // Get platform stats
  const { data: stats } = useQuery<{
    totalCompanies: number;
    totalExperiences: number;
    avgResponseRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              </div>
              <div>
                <Card>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Track your applications and discover companies with transparent hiring practices.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Companies Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCompanies || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Your Experiences</p>
                  <p className="text-2xl font-bold text-gray-900">{userExperiences?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.avgResponseRate || 34}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Link href="/report">
                <Button className="w-full h-full min-h-[80px] flex-col">
                  <PlusCircle className="h-6 w-6 mb-2" />
                  Share Experience
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Experiences */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                {experiencesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userExperiences && userExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {userExperiences.slice(0, 5).map((experience) => (
                      <div key={experience.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{experience.position}</h4>
                          <p className="text-sm text-gray-600">
                            Applied {new Date(experience.applicationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={experience.receivedResponse ? "default" : "destructive"}>
                            {experience.receivedResponse ? "Responded" : "No Response"}
                          </Badge>
                          {experience.communicationQuality && (
                            <Badge variant="outline">
                              {experience.communicationQuality}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {userExperiences && userExperiences.length > 5 && (
                      <Link href="/my-experiences">
                        <Button variant="outline" className="w-full">
                          View All Experiences ({userExperiences.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No experiences yet</h4>
                    <p className="text-gray-600 mb-4">Share your first recruitment experience to help the community.</p>
                    <Link href="/report">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Share Experience
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Companies</CardTitle>
              </CardHeader>
              <CardContent>
                {companiesData?.companies && companiesData.companies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companiesData.companies.slice(0, 4).map((company) => (
                      <CompanyCard key={company.id} company={company} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No companies to display yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/report">
                  <Button className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Report New Experience
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Browse Companies
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Insights
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Industry Insights */}
        <div className="mt-8">
          <InsightsDashboard />
        </div>
      </div>
    </div>
  );
}
