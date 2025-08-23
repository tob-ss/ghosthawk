import { useQuery } from "@tanstack/react-query";
import { TrendingUp, AlertTriangle, Lightbulb, Building, Clock, Target, FileText, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StatsData {
  totalCompanies: number;
  totalExperiences: number;
  avgResponseRate: number;
}

interface DetailedStatsData {
  responseTimeInsights: {
    totalResponses: number;
    withinWeek: number;
    withinMonth: number;
    longerThanMonth: number;
    averageResponseTime: string;
  };
  interviewStats: {
    interviewOfferRate: number;
    interviewToJobRate: number;
  };
}

export default function InsightsDashboard() {
  const { data: insights, isLoading } = useQuery<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number; ghostRisk: number }>;
    topCompanies: Array<{ name: string; score: number }>;
    recentTrends: string[];
  }>({
    queryKey: ["/api/insights"],
  });

  const { data: basicStats } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  const { data: detailedStats } = useQuery<DetailedStatsData>({
    queryKey: ['/api/stats/detailed'],
  });

  // Calculate dynamic metrics
  const averageGhostRisk = insights?.industryStats ? 
    Math.round(Object.values(insights.industryStats).reduce((sum: number, stats: any) => sum + stats.ghostRisk, 0) / Object.values(insights.industryStats).length) : 0;
  
  const averageResponseRate = insights?.industryStats ?
    Math.round(Object.values(insights.industryStats).reduce((sum: number, stats: any) => sum + stats.responseRate, 0) / Object.values(insights.industryStats).length) : 0;

  if (isLoading) {
    return (
      <section id="insights" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Insights</h3>
            <p className="text-lg text-gray-600">Real-time data and trends from our transparency platform</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 70) return "bg-green-500";
    if (rate >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section id="insights" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Insights</h3>
          <p className="text-lg text-gray-600">Real-time data and trends from our transparency platform</p>
        </div>

        {(insights || basicStats || detailedStats) && (
          <>
            {/* Company Behavior Trends */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Company Behavior Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-600 p-3 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{averageGhostRisk}%</p>
                        <p className="text-sm font-medium text-gray-600">Ghost Job Risk Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{averageResponseRate}%</p>
                        <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-600 p-3 rounded-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{detailedStats?.interviewStats?.interviewOfferRate ?? 0}%</p>
                        <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-600 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{detailedStats?.interviewStats?.interviewToJobRate ?? 0}%</p>
                        <p className="text-sm font-medium text-gray-600">Interview Success</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Response Time Insights */}
            <div className="mb-12">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center text-lg">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Response Time Insights
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 text-center">
                    How quickly companies typically respond to applications
                  </p>
                </CardHeader>
                <CardContent>
                  {detailedStats?.responseTimeInsights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-green-600">
                          {detailedStats.responseTimeInsights.withinWeek}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">respond within 1 week</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-blue-600">
                          {detailedStats.responseTimeInsights.withinMonth}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">respond within 1 month</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-red-600">
                          {detailedStats.responseTimeInsights.longerThanMonth}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">take longer than 1 month</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-lg font-bold text-gray-900">
                          {detailedStats.responseTimeInsights.averageResponseTime}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">average response time</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      Building response time insights...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trends & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trends & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-600">Improvement Alert</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {insights.recentTrends[0] || "Healthcare companies have improved response rates by 12% this quarter"}
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-600">Watch Out</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {insights.recentTrends[1] || "Several recruitment agencies showing increased ghosting patterns"}
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-600">Tip</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {insights.recentTrends[2] || "Best response rates occur on Tuesday-Thursday applications"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
