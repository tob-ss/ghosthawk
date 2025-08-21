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
    // New fields for full journey tracking
    interviewOffered: "",
    interviewStages: "",
    jobOffered: "",
    ghostJob: "",
    rejectionFeedback: "",
    comments: "",
    isAnonymous: true,
  });

  const [showResponseDetails, setShowResponseDetails] = useState(false);
  const [showInterviewDetails, setShowInterviewDetails] = useState(false);

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
        interviewOffered: "",
        interviewStages: "",
        jobOffered: "",
        ghostJob: "",
        rejectionFeedback: "",
        comments: "",
        isAnonymous: true,
      });
      setShowResponseDetails(false);
      setShowInterviewDetails(false);
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
      applicationDate: formData.applicationDate, // Send as string, schema will transform to Date
      receivedResponse: formData.receivedResponse === "yes",
      responseTime: formData.receivedResponse === "yes" ? formData.responseTime : undefined,
      communicationQuality: formData.receivedResponse === "yes" ? formData.communicationQuality : undefined,
      // New fields - send as strings, backend will transform them
      interviewOffered: formData.interviewOffered || undefined,
      interviewStages: formData.interviewStages || undefined,
      jobOffered: formData.jobOffered || undefined,
      ghostJob: formData.ghostJob || undefined,
      rejectionFeedback: formData.rejectionFeedback || undefined,
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
        communicationQuality: "",
        interviewOffered: "",
        interviewStages: "",
        jobOffered: ""
      }));
      setShowInterviewDetails(false);
    }
  };

  const handleInterviewChange = (value: string) => {
    setFormData(prev => ({ ...prev, interviewOffered: value }));
    setShowInterviewDetails(value === "yes");
    if (value !== "yes") {
      setFormData(prev => ({ 
        ...prev, 
        interviewStages: "",
        jobOffered: ""
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

          {/* Interview Progression Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-3">
              Were you offered an interview?
            </Label>
            <RadioGroup 
              value={formData.interviewOffered} 
              onValueChange={handleInterviewChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="yes" id="interview-yes" />
                <Label htmlFor="interview-yes" className="flex-1 cursor-pointer">
                  Yes, I was interviewed
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no" id="interview-no" />
                <Label htmlFor="interview-no" className="flex-1 cursor-pointer">
                  No interview offered
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="n/a" id="interview-na" />
                <Label htmlFor="interview-na" className="flex-1 cursor-pointer">
                  N/A (no response yet)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {showInterviewDetails && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-3">
                  Interview Stages (select all that apply)
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "phone", label: "Phone screening" },
                    { value: "video", label: "Video interview" },
                    { value: "technical", label: "Technical assessment" },
                    { value: "onsite", label: "On-site interview" },
                    { value: "panel", label: "Panel interview" },
                    { value: "multiple", label: "Multiple rounds" }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${value}`}
                        checked={formData.interviewStages.split(',').filter(s => s.trim()).includes(value)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => {
                            const currentStages = prev.interviewStages.split(',').filter(s => s.trim());
                            if (checked) {
                              return { ...prev, interviewStages: [...currentStages, value].join(',') };
                            } else {
                              return { ...prev, interviewStages: currentStages.filter(s => s !== value).join(',') };
                            }
                          });
                        }}
                      />
                      <Label htmlFor={`stage-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-3">
                  Were you offered the job?
                </Label>
                <RadioGroup 
                  value={formData.jobOffered} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, jobOffered: value }))}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="yes" id="job-yes" />
                    <Label htmlFor="job-yes" className="flex-1 cursor-pointer">
                      Yes, got an offer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="no" id="job-no" />
                    <Label htmlFor="job-no" className="flex-1 cursor-pointer">
                      No, was rejected
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pending" id="job-pending" />
                    <Label htmlFor="job-pending" className="flex-1 cursor-pointer">
                      Still waiting
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Additional tracking fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-3">
                Do you suspect this was a "ghost job" (fake posting)?
              </Label>
              <RadioGroup 
                value={formData.ghostJob} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, ghostJob: value }))}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="yes" id="ghost-yes" />
                  <Label htmlFor="ghost-yes" className="flex-1 cursor-pointer">
                    Yes, likely fake
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="no" id="ghost-no" />
                  <Label htmlFor="ghost-no" className="flex-1 cursor-pointer">
                    No, seemed legitimate
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-3">
                If rejected, did they provide feedback?
              </Label>
              <RadioGroup 
                value={formData.rejectionFeedback} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, rejectionFeedback: value }))}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="yes" id="feedback-yes" />
                  <Label htmlFor="feedback-yes" className="flex-1 cursor-pointer">
                    Yes, provided feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="no" id="feedback-no" />
                  <Label htmlFor="feedback-no" className="flex-1 cursor-pointer">
                    No feedback given
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

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
                  interviewOffered: "",
                  interviewStages: "",
                  jobOffered: "",
                  ghostJob: "",
                  rejectionFeedback: "",
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
