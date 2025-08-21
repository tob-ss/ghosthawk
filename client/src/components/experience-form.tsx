import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ExperienceForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "",
    companyIndustry: "",
    position: "",
    applicationDate: "",
    receivedResponse: "",
    responseTime: "",
    communicationQuality: "",
    comments: "",
    isAnonymous: true,
  });

  const [showResponseDetails, setShowResponseDetails] = useState(false);

  const createExperience = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/experiences", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Shared Successfully!",
        description: "Thank you for helping the community with your experience.",
      });
      // Reset form
      setFormData({
        companyName: "",
        companyType: "",
        companyIndustry: "",
        position: "",
        applicationDate: "",
        receivedResponse: "",
        responseTime: "",
        communicationQuality: "",
        comments: "",
        isAnonymous: true,
      });
      setShowResponseDetails(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/companies/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/experiences/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit experience. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName || !formData.companyType || !formData.applicationDate || !formData.receivedResponse) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    // Format the data for submission
    const submissionData = {
      companyName: formData.companyName,
      companyType: formData.companyType as "company" | "recruiter",
      companyIndustry: formData.companyIndustry || undefined,
      position: formData.position || undefined,
      applicationDate: new Date(formData.applicationDate).toISOString(),
      receivedResponse: formData.receivedResponse === "yes",
      responseTime: formData.receivedResponse === "yes" ? formData.responseTime : undefined,
      communicationQuality: formData.receivedResponse === "yes" ? formData.communicationQuality : undefined,
      comments: formData.comments || undefined,
      isAnonymous: formData.isAnonymous,
    };

    createExperience.mutate(submissionData);
  };

  const handleResponseChange = (value: string) => {
    setFormData(prev => ({ ...prev, receivedResponse: value }));
    setShowResponseDetails(value === "yes");
    if (value !== "yes") {
      setFormData(prev => ({ 
        ...prev, 
        responseTime: "", 
        communicationQuality: "" 
      }));
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                Company/Recruiter Name *
              </Label>
              <Input
                id="companyName"
                type="text"
                required
                placeholder="Enter company or recruiter name"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="companyType" className="text-sm font-medium text-gray-700">
                Type *
              </Label>
              <Select 
                value={formData.companyType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyType: value }))}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Direct Company Application</SelectItem>
                  <SelectItem value="recruiter">External Recruiter/Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                Position Applied For
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="Job title"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                Industry
              </Label>
              <Select 
                value={formData.companyIndustry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyIndustry: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="applicationDate" className="text-sm font-medium text-gray-700">
              Application Date *
            </Label>
            <Input
              id="applicationDate"
              type="date"
              required
              value={formData.applicationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, applicationDate: e.target.value }))}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-3">
              Did you receive a response? *
            </Label>
            <RadioGroup 
              value={formData.receivedResponse} 
              onValueChange={handleResponseChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="yes" id="response-yes" />
                <Label htmlFor="response-yes" className="flex-1 cursor-pointer">
                  Yes, they responded
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no" id="response-no" />
                <Label htmlFor="response-no" className="flex-1 cursor-pointer">
                  No response (ghosted)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="pending" id="response-pending" />
                <Label htmlFor="response-pending" className="flex-1 cursor-pointer">
                  Still waiting
                </Label>
              </div>
            </RadioGroup>
          </div>

          {showResponseDetails && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label htmlFor="responseTime" className="text-sm font-medium text-gray-700">
                  Response Time
                </Label>
                <Select 
                  value={formData.responseTime} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responseTime: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same_day">Same day</SelectItem>
                    <SelectItem value="1_3_days">1-3 days</SelectItem>
                    <SelectItem value="1_week">1 week</SelectItem>
                    <SelectItem value="2_weeks">2 weeks</SelectItem>
                    <SelectItem value="1_month">1 month</SelectItem>
                    <SelectItem value="longer">Longer than 1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-3">
                  Communication Quality
                </Label>
                <RadioGroup 
                  value={formData.communicationQuality} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, communicationQuality: value }))}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {[
                    { value: "excellent", label: "Excellent" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "poor", label: "Poor" }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={value} id={`comm-${value}`} className="mb-2" />
                      <Label htmlFor={`comm-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
              Additional Comments
            </Label>
            <Textarea
              id="comments"
              rows={4}
              placeholder="Share any additional details about your experience (optional)"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked as boolean }))}
            />
            <Label htmlFor="anonymous" className="text-sm text-gray-600">
              Submit anonymously (recommended)
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  companyName: "",
                  companyType: "",
                  companyIndustry: "",
                  position: "",
                  applicationDate: "",
                  receivedResponse: "",
                  responseTime: "",
                  communicationQuality: "",
                  comments: "",
                  isAnonymous: true,
                });
                setShowResponseDetails(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createExperience.isPending}
              className="min-w-[140px]"
            >
              {createExperience.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Experience
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
