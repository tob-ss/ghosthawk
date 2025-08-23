import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  FileText, 
  Clock, 
  MessageSquare,
  Users,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

interface StatsData {
  totalCompanies: number;
  totalExperiences: number;
  avgResponseRate: number;
}

interface DetailedStatsData {
  industryStats: Record<string, { responseRate: number; avgResponseTime: number }>;
  topCompanies: { name: string; score: number }[];
  recentTrends: string[];
  communicationBreakdown: Record<string, number>;
  responseTimeBreakdown: Record<string, number>;
  companyTypeStats: Record<string, { count: number; avgResponseRate: number }>;
  monthlyTrends: { month: string; companies: number; experiences: number; responseRate: number }[];
  interviewStats: {
    interviewOfferRate: number;
    interviewToJobRate: number;
    interviewStagesBreakdown: Record<string, number>;
    industryInterviewRates: Record<string, number>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StatsPage() {
  const { data: basicStats, isLoading: basicLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/insights'],
  });

  const { data: detailedStats } = useQuery<DetailedStatsData>({
    queryKey: ['/api/stats/detailed'],
  });

  const getGhostJobRisk = (score: number) => {
    if (score <= 20) return { label: "Very Low Ghost Risk", color: "bg-green-100 text-green-800" };
    if (score <= 40) return { label: "Low Ghost Risk", color: "bg-green-100 text-green-800" };
    if (score <= 60) return { label: "Medium Ghost Risk", color: "bg-yellow-100 text-yellow-800" };
    if (score <= 80) return { label: "High Ghost Risk", color: "bg-orange-100 text-orange-800" };
    return { label: "Very High Ghost Risk", color: "bg-red-100 text-red-800" };
  };

  if (basicLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const industryData = insights?.industryStats ? 
    Object.entries(insights.industryStats).map(([industry, stats]) => ({
      industry,
      responseRate: (stats as any).responseRate,
      avgResponseTime: (stats as any).avgResponseTime,
      ghostRisk: (stats as any).ghostRisk || 0
    })) : [];

  const communicationData = detailedStats?.communicationBreakdown ? 
    Object.entries(detailedStats.communicationBreakdown).map(([quality, count]) => {
      const qualityColors: Record<string, string> = {
        excellent: '#10B981', // green
        good: '#84CC16',      // light green
        fair: '#F59E0B',      // yellow/orange
        poor: '#EF4444'       // red
      };
      
      return {
        name: quality.charAt(0).toUpperCase() + quality.slice(1),
        value: count,
        color: qualityColors[quality] || '#6B7280'
      };
    }) : [];

  const companyTypeData = detailedStats?.companyTypeStats ?
    Object.entries(detailedStats.companyTypeStats).map(([type, stats]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: stats.count,
      responseRate: stats.avgResponseRate
    })) : [];

  const interviewStagesData = detailedStats?.interviewStats?.interviewStagesBreakdown ?
    Object.entries(detailedStats.interviewStats.interviewStagesBreakdown).map(([stage, count]) => {
      const stageNames: Record<string, string> = {
        phone: 'Phone Interview',
        video: 'Video Interview', 
        technical: 'Technical Interview',
        onsite: 'Onsite Interview',
        panel: 'Panel Interview',
        multiple: 'Multiple Rounds'
      };
      return {
        name: stageNames[stage] || stage,
        value: count
      };
    }) : [];

  const industryInterviewData = detailedStats?.interviewStats?.industryInterviewRates ?
    Object.entries(detailedStats.interviewStats.industryInterviewRates).map(([industry, rate]) => ({
      industry: industry.charAt(0).toUpperCase() + industry.slice(1),
      interviewRate: rate
    })) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Platform Stats</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparency insights to help you make informed application decisions
          </p>
        </div>

        {/* Community Impact */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Community Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{basicStats?.totalExperiences.toLocaleString() || '0'}</p>
                    <p className="text-sm font-medium text-gray-600">Experiences Shared</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{basicStats?.totalCompanies.toLocaleString() || '0'}</p>
                    <p className="text-sm font-medium text-gray-600">Companies Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">Growing</p>
                    <p className="text-sm font-medium text-gray-600">Platform Activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Behavior Trends */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Company Behavior Trends
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">25%</p>
                    <p className="text-sm font-medium text-gray-600">Ghost Job Rate</p>
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
                    <p className="text-2xl font-bold text-gray-900">5.2 days</p>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
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

        {/* Market Insights */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Market Insights
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Industries: Ghost Risk Analysis */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PieChart className="h-5 w-5 mr-2" />
                  Industries: Ghost Risk Analysis
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Ghost risk score by industry (lower is safer)
                </p>
              </CardHeader>
              <CardContent>
                {industryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={industryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="industry" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Ghost Risk Score']}
                      />
                      <Legend />
                      <Bar dataKey="ghostRisk" fill="#EF4444" name="Ghost Risk Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    Building industry insights...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recruiter vs Direct Company Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Recruiters vs Direct Companies
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Performance comparison for better application strategy
                </p>
              </CardHeader>
              <CardContent>
                {companyTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companyTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="responseRate" fill="#0088FE" name="Response Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium">Direct Companies</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-1">75%</p>
                      <p className="text-sm text-gray-600">Response Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium">Recruiters</h3>
                      <p className="text-2xl font-bold text-green-600 mt-1">65%</p>
                      <p className="text-sm text-gray-600">Response Rate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Communication Quality Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Communication Quality Trends
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                How companies communicate during hiring processes
              </p>
            </CardHeader>
            <CardContent>
              {communicationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={communicationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {communicationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Excellent</span>
                    <Badge className="bg-green-100 text-green-800">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Good</span>
                    <Badge className="bg-blue-100 text-blue-800">35%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Fair</span>
                    <Badge className="bg-yellow-100 text-yellow-800">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Poor</span>
                    <Badge className="bg-red-100 text-red-800">15%</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Rates */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2" />
                Interview Rates
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Application to interview conversion rates by industry
              </p>
            </CardHeader>
            <CardContent>
              {industryInterviewData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryInterviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="industry" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Interview Rate']}
                    />
                    <Bar dataKey="interviewRate" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Applications → Interviews</span>
                    <Badge className="bg-blue-100 text-blue-800">{detailedStats?.interviewStats?.interviewOfferRate ?? 15}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Interviews → Job Offers</span>
                    <Badge className="bg-green-100 text-green-800">{detailedStats?.interviewStats?.interviewToJobRate ?? 30}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Overall Success Rate</span>
                    <Badge className="bg-yellow-100 text-yellow-800">4.5%</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Most Reported Companies */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Most Reported Companies
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Companies with the most transparency reports from our community
            </p>
          </CardHeader>
          <CardContent>
            {insights?.topCompanies && insights.topCompanies.length > 0 ? (
              <div className="space-y-4">
                {insights.topCompanies.slice(0, 8).map((company: any, index: number) => (
                  <div key={company.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{company.reportCount} reports</Badge>
                      <Badge className={getGhostJobRisk(company.score).color}>
                        {getGhostJobRisk(company.score).label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 text-sm">
                No company data available yet...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}