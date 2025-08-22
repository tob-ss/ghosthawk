import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CompanyDetail from "@/pages/company-detail";
import CompaniesPage from "@/pages/companies";
import ReportExperience from "@/pages/report-experience";
import MyExperiences from "@/pages/my-experiences";
import StatsPage from "@/pages/stats";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/landing" component={Landing} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/company/:id" component={CompanyDetail} />
          <Route path="/report" component={ReportExperience} />
          <Route path="/my-experiences" component={MyExperiences} />
          <Route path="/stats" component={StatsPage} />
        </>
      ) : isLoading ? (
        <>
          {/* Loading state - show minimal routes */}
          <Route path="/" component={Landing} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/company/:id" component={CompanyDetail} />
          <Route path="/stats" component={StatsPage} />
        </>
      ) : (
        <>
          {/* Unauthenticated routes */}
          <Route path="/" component={Landing} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/company/:id" component={CompanyDetail} />
          <Route path="/stats" component={StatsPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
