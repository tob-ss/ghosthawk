import { Link } from "wouter";
import { Building, MapPin, Star, ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    type: string;
    industry?: string;
    location?: string;
    responseRate: number;
    avgResponseTime: number | null;
    totalExperiences: number;
    avgRating: number;
  };
  compact?: boolean;
}

export default function CompanyCard({ company, compact = false }: CompanyCardProps) {
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

  const getCommunicationQuality = (rating: number) => {
    if (rating >= 4.5) return { label: "Excellent", color: "text-green-600" };
    if (rating >= 3.5) return { label: "Good", color: "text-blue-600" };
    if (rating >= 2.5) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Poor", color: "text-red-600" };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const communicationQuality = getCommunicationQuality(company.avgRating);

  if (compact) {
    return (
      <Link href={`/company/${company.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                {company.type === "recruiter" ? (
                  <User className="h-4 w-4 text-gray-400" />
                ) : (
                  <Building className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{company.name}</h4>
                <div className="flex items-center text-xs text-gray-600">
                  {company.industry && <span>{company.industry}</span>}
                  {company.location && (
                    <>
                      {company.industry && <span className="mx-1">•</span>}
                      <span className="truncate">{company.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className={`font-semibold ${getResponseRateColor(company.responseRate)}`}>
                {company.responseRate}% response
              </div>
              <div className="flex">{renderStars(company.avgRating)}</div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              {company.type === "recruiter" ? (
                <User className="h-6 w-6 text-gray-400" />
              ) : (
                <Building className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{company.name}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {company.industry && (
                  <Badge variant="secondary" className="text-xs mr-2">
                    {company.industry}
                  </Badge>
                )}
                {company.location && (
                  <span className="flex items-center truncate">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center text-sm mb-1">
              <div className="flex mr-1">{renderStars(company.avgRating)}</div>
              <span className="text-gray-600 ml-1">{company.avgRating}</span>
            </div>
            <Badge variant={company.type === "recruiter" ? "outline" : "default"} className="text-xs">
              {company.type === "recruiter" ? "Agency" : "Company"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg font-semibold ${getResponseRateColor(company.responseRate)}`}>
              {company.responseRate}%
            </div>
            <div className="text-xs text-gray-600">Response Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {company.avgResponseTime ? `${company.avgResponseTime}d` : "N/A"}
            </div>
            <div className="text-xs text-gray-600">Avg Response</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Communication Quality</span>
            <span className={`font-medium ${communicationQuality.color}`}>
              {communicationQuality.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getResponseRateBg(company.avgRating * 20)}`}
              style={{ width: `${(company.avgRating / 5) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{company.totalExperiences}</span> experiences
          </div>
          <Link href={`/company/${company.id}`}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View Details
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
