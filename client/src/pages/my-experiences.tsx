import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { 
  Building, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Star,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText 
} from "lucide-react";

export default function MyExperiences() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Get user's experiences
  const { data: userExperiences, isLoading: experiencesLoading, error } = useQuery<Array<{
    id: string;
    position?: string;
    applicationDate: string;
    receivedResponse: boolean;
    responseTime?: string;
    communicationQuality?: string;
    comments?: string;
    createdAt: string;
    company: {
      id: string;
      name: string;
      type: string;
      industry?: string;
    };
  }>>({
    queryKey: ["/api/experiences/user"],
    enabled: isAuthenticated,
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

  const getResponseIcon = (received: boolean) => {
    if (received) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getResponseTimeText = (responseTime?: string) => {
    const timeMap: Record<string, string> = {
      'same_day': 'Same day',
      '1_3_days': '1-3 days',
      '1_week': '1 week',
      '2_weeks': '2 weeks',
      '1_month': '1 month',
      'longer': '1+ month'
    };
    return responseTime ? timeMap[responseTime] || responseTime : 'N/A';
  };

  const getCommunicationBadgeColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || experiencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error as Error)) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">My Experiences</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track all your recruitment experiences and help build transparency in the hiring industry
          </p>
          <div className="mt-8">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Add New Experience
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        {userExperiences && userExperiences.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{userExperiences.length}</p>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {userExperiences.filter(exp => exp.receivedResponse).length}
                    </p>
                    <p className="text-sm font-medium text-gray-600">Got Responses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-600 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round((userExperiences.filter(exp => exp.receivedResponse).length / userExperiences.length) * 100)}%
                    </p>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Experiences List */}
        {userExperiences && userExperiences.length > 0 ? (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Experiences</h2>
              <p className="text-gray-600">Detailed view of all your recruitment interactions</p>
            </div>
            {userExperiences.map((experience) => (
              <Card key={experience.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{experience.company.name}</CardTitle>
                        <Badge variant="outline">
                          {experience.company.type === 'company' ? 'Direct Company' : 'Recruiter'}
                        </Badge>
                        {experience.company.industry && (
                          <Badge variant="secondary">{experience.company.industry}</Badge>
                        )}
                      </div>
                      {experience.position && (
                        <p className="text-gray-600 font-medium">{experience.position}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getResponseIcon(experience.receivedResponse)}
                      <span className="text-sm font-medium">
                        {experience.receivedResponse ? 'Responded' : 'No Response'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Applied: {new Date(experience.applicationDate).toLocaleDateString()}</span>
                    </div>
                    
                    {experience.receivedResponse && experience.responseTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Response time: {getResponseTimeText(experience.responseTime)}</span>
                      </div>
                    )}
                    
                    {experience.receivedResponse && experience.communicationQuality && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <Badge className={getCommunicationBadgeColor(experience.communicationQuality)}>
                          {experience.communicationQuality.charAt(0).toUpperCase() + experience.communicationQuality.slice(1)} Communication
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Reported: {new Date(experience.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {experience.comments && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Comments:</strong> {experience.comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent>
              <div className="bg-gray-200 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Experiences Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your recruitment experience history to help yourself and others make informed decisions about employers and recruiters.
              </p>
              <Link href="/report">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Report Your First Experience
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}