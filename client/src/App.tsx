import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import CompanyDetail from "@/pages/company-detail";
import ReportExperience from "@/pages/report-experience";
import MyExperiences from "@/pages/my-experiences";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/company/:id" component={CompanyDetail} />
          
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/company/:id" component={CompanyDetail} />
          <Route path="/report" component={ReportExperience} />
          <Route path="/my-experiences" component={MyExperiences} />
          
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
