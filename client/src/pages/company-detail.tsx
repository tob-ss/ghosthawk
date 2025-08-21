import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building, MapPin, Globe, Star, TrendingUp, MessageSquare, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";

export default function CompanyDetail() {
  const { id } = useParams();
  
  const { data: company, isLoading, error } = useQuery<{
    id: string;
    name: string;
    type: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
    logoUrl?: string;
    stats: {
      responseRate: number;
      avgResponseTime: number | null;
      totalExperiences: number;
      communicationBreakdown: Record<string, number>;
    };
    experiences: Array<{
      id: string;
      position?: string;
      applicationDate: string;
      receivedResponse: boolean;
      responseTime?: string;
      communicationQuality?: string;
      comments?: string;
      createdAt: string;
    }>;
  }>({
    queryKey: ["/api/companies", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
              <p className="text-gray-600 mb-4">The company you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseRateBg = (rate: number) => {
    if (rate >= 70) return "bg-green-600";
    if (rate >= 30) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getCommunicationQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "fair": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                      {company.type === "recruiter" ? (
                        <User className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                      <div className="flex items-center space-x-4 text-gray-600 mt-2">
                        {company.industry && (
                          <span className="flex items-center">
                            <Badge variant="secondary">{company.industry}</Badge>
                          </span>
                        )}
                        {company.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {company.location}
                          </span>
                        )}
                        <Badge variant={company.type === "recruiter" ? "outline" : "default"}>
                          {company.type === "recruiter" ? "Recruitment Agency" : "Direct Company"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {company.website && (
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
                </div>

                {company.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-600">{company.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Experiences */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                {company.experiences?.length > 0 ? (
                  <div className="space-y-4">
                    {company.experiences.map((experience) => (
                      <div key={experience.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {experience.position && (
                              <h4 className="font-medium text-gray-900">{experience.position}</h4>
                            )}
                            <p className="text-sm text-gray-600">
                              Applied {new Date(experience.applicationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={experience.receivedResponse ? "default" : "destructive"}>
                              {experience.receivedResponse ? "Responded" : "No Response"}
                            </Badge>
                            {experience.responseTime && experience.receivedResponse && (
                              <Badge variant="outline">
                                {experience.responseTime.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {experience.communicationQuality && experience.receivedResponse && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-600">Communication Quality: </span>
                            <span className={`text-sm font-medium ${getCommunicationQualityColor(experience.communicationQuality)}`}>
                              {experience.communicationQuality.charAt(0).toUpperCase() + experience.communicationQuality.slice(1)}
                            </span>
                          </div>
                        )}
                        
                        {experience.comments && (
                          <div>
                            <p className="text-sm text-gray-700 italic">"{experience.comments}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No experiences shared yet</h4>
                    <p className="text-gray-600">Be the first to share your experience with this company.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getResponseRateColor(company.stats.responseRate)}`}>
                    {company.stats.responseRate}%
                  </div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                  <Progress 
                    value={company.stats.responseRate} 
                    className="mt-2"
                    // @ts-ignore
                    style={{"--progress-background": getResponseRateBg(company.stats.responseRate).replace("bg-", "")}}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {company.stats.avgResponseTime ? `${company.stats.avgResponseTime} days` : "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{company.stats.totalExperiences}</div>
                    <div className="text-sm text-gray-600">Total Experiences</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(company.stats.communicationBreakdown).map(([quality, count]) => (
                    <div key={quality} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{quality}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              quality === "excellent" ? "bg-green-500" :
                              quality === "good" ? "bg-blue-500" :
                              quality === "fair" ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ 
                              width: company.stats.totalExperiences > 0 
                                ? `${(count / company.stats.totalExperiences) * 100}%` 
                                : "0%" 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share Your Experience
                </Button>
                <Button variant="outline" className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Save Company
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Similar Companies
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
