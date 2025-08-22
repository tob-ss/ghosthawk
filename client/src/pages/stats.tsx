import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Activity
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
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/insights'],
    queryFn: async () => {
      const response = await fetch('/api/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
  });

  const { data: detailedStats } = useQuery<DetailedStatsData>({
    queryKey: ['/api/stats/detailed'],
    queryFn: async () => {
      const response = await fetch('/api/stats/detailed');
      if (!response.ok) throw new Error('Failed to fetch detailed stats');
      return response.json();
    },
  });

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
      avgResponseTime: (stats as any).avgResponseTime
    })) : [];

  const communicationData = detailedStats?.communicationBreakdown ? 
    Object.entries(detailedStats.communicationBreakdown).map(([quality, count]) => ({
      name: quality.charAt(0).toUpperCase() + quality.slice(1),
      value: count
    })) : [];

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
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive insights into recruitment transparency and industry trends
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats?.totalCompanies.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Tracked across all industries
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats?.totalExperiences.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Candidate reports submitted
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats?.avgResponseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Across all companies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interview Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Interview Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interview Offer Rate</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats?.interviewStats?.interviewOfferRate ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of all applications get interviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interview Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats?.interviewStats?.interviewToJobRate ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of interviews lead to job offers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Industry Response Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Response Rates by Industry
              </CardTitle>
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
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}${name === 'responseRate' ? '%' : ' days'}`,
                        name === 'responseRate' ? 'Response Rate' : 'Avg Response Time'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="responseRate" fill="#0088FE" name="Response Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No industry data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communication Quality Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Communication Quality
              </CardTitle>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Excellent</span>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Good</span>
                    <Badge variant="outline">35%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fair</span>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Poor</span>
                    <Badge variant="outline">15%</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interview Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Interview Stages Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Interview Stages Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interviewStagesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={interviewStagesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {interviewStagesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No interview stage data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Industry Interview Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Interview Rates by Industry
              </CardTitle>
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
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Interview Rate']}
                    />
                    <Bar dataKey="interviewRate" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No industry interview data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Companies */}
        {insights?.topCompanies && insights.topCompanies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top Performing Companies
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on communication quality and response rates
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.topCompanies.map((company: any, index: number) => (
                  <div key={company.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <Badge variant="secondary">{company.score}/5.0</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Trends */}
        {insights?.recentTrends && insights.recentTrends.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.recentTrends.map((trend: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Types Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Companies vs Recruiters
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance comparison between direct employers and recruitment agencies
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
                  <Bar dataKey="count" fill="#0088FE" name="Count" />
                  <Bar dataKey="responseRate" fill="#00C49F" name="Response Rate %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium">Direct Companies</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {basicStats?.totalCompanies || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium">Recruitment Agencies</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {basicStats?.totalCompanies || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}