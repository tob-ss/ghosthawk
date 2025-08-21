import { useQuery } from "@tanstack/react-query";
import { TrendingUp, AlertTriangle, Lightbulb, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function InsightsDashboard() {
  const { data: insights, isLoading } = useQuery<{
    industryStats: Record<string, { responseRate: number; avgResponseTime: number }>;
    topCompanies: Array<{ name: string; score: number }>;
    recentTrends: string[];
  }>({
    queryKey: ["/api/insights"],
  });

  if (isLoading) {
    return (
      <section id="insights" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Industry Insights</h3>
            <p className="text-lg text-gray-600">Data-driven insights to help you understand recruitment trends</p>
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
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Industry Insights</h3>
          <p className="text-lg text-gray-600">Data-driven insights to help you understand recruitment trends across industries</p>
        </div>

        {insights && (
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Response Rates by Industry */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Rates by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(insights.industryStats).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(insights.industryStats).map(([industry, stats]) => (
                        <div key={industry} className="flex items-center justify-between">
                          <span className="text-gray-700 capitalize">{industry}</span>
                          <div className="flex items-center space-x-3">
                            <Progress 
                              value={stats.responseRate} 
                              className="w-32 h-3"
                            />
                            <span className={`font-medium ${getResponseRateColor(stats.responseRate)}`}>
                              {stats.responseRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No industry data available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Companies and Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">2.3 days</div>
                      <div className="text-sm text-gray-600">Direct Applications</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">5.1 days</div>
                      <div className="text-sm text-gray-600">External Recruiters</div>
                    </div>
                  </div>
                  
                  {insights.topCompanies?.length > 0 ? (
                    <div>
                      <h5 className="font-medium mb-3">Highest Rated Companies</h5>
                      <div className="space-y-2">
                        {insights.topCompanies.slice(0, 3).map((company, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{company.name}</span>
                            <span className="font-medium text-green-600">{company.score}/5</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No top companies data available yet.</p>
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
