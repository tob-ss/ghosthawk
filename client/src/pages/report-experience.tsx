import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect, SimpleSelectContent, SimpleSelectItem, SimpleSelectTrigger, SimpleSelectValue } from "@/components/ui/simple-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import Navigation from "@/components/navigation";
import ExperienceForm from "@/components/experience-form";

export default function ReportExperience() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <Card>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Share Your Experience</h1>
          <p className="text-lg text-gray-600">
            Help other job seekers by sharing your recruitment experience. All submissions are verified and can be anonymous.
          </p>
        </div>

        {/* Information Banner */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Why share your experience?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Help other candidates make informed decisions about where to apply</li>
                  <li>• Create accountability for companies and recruiters</li>
                  <li>• Build a transparent recruitment ecosystem</li>
                  <li>• All data is aggregated and anonymized for privacy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExperienceForm />
      </div>
    </div>
  );
}
