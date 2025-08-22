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
import { SimpleSelect, SimpleSelectContent, SimpleSelectItem, SimpleSelectTrigger, SimpleSelectValue } from "@/components/ui/simple-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

interface ExperienceFormProps {
  initialCompanyName?: string;
  initialCompanyType?: string;
  initialCompanyIndustry?: string;
}

export default function ExperienceForm({ 
  initialCompanyName = "",
  initialCompanyType = "",
  initialCompanyIndustry = ""
}: ExperienceFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Map values to display labels for pre-filled dropdowns
  const getCompanyTypeDisplay = (value: string) => {
    switch (value) {
      case 'company': return 'Direct Company Application';
      case 'recruiter': return 'External Recruiter/Agency';
      default: return value;
    }
  };

  const getIndustryDisplay = (value: string) => {
    const industryMap: Record<string, string> = {
      'technology': 'Technology',
      'finance': 'Finance', 
      'healthcare': 'Healthcare',
      'marketing': 'Marketing',
      'manufacturing': 'Manufacturing',
      'education': 'Education',
      'retail': 'Retail',
      'consulting': 'Consulting',
      'media': 'Media & Entertainment',
      'nonprofit': 'Non-Profit',
      'government': 'Government',
      'other': 'Other'
    };
    return industryMap[value] || value;
  };

  const [formData, setFormData] = useState({
    companyName: initialCompanyName,
    companyType: initialCompanyType,
    companyIndustry: initialCompanyIndustry,
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
    // Toggle off if same value is clicked
    const newValue = formData.receivedResponse === value ? "" : value;
    setFormData(prev => ({ ...prev, receivedResponse: newValue }));
    setShowResponseDetails(newValue === "yes");
    if (newValue !== "yes") {
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
    // Toggle off if same value is clicked
    const newValue = formData.interviewOffered === value ? "" : value;
    setFormData(prev => ({ ...prev, interviewOffered: newValue }));
    setShowInterviewDetails(newValue === "yes");
    if (newValue !== "yes") {
      setFormData(prev => ({ 
        ...prev, 
        interviewStages: "",
        jobOffered: ""
      }));
    }
  };

  const handleCommunicationChange = (value: string) => {
    // Toggle off if same value is clicked
    const newValue = formData.communicationQuality === value ? "" : value;
    setFormData(prev => ({ ...prev, communicationQuality: newValue }));
  };

  const handleJobOfferChange = (value: string) => {
    // Toggle off if same value is clicked
    const newValue = formData.jobOffered === value ? "" : value;
    setFormData(prev => ({ ...prev, jobOffered: newValue }));
  };

  const handleGhostJobChange = (value: string) => {
    // Toggle off if same value is clicked
    const newValue = formData.ghostJob === value ? "" : value;
    setFormData(prev => ({ ...prev, ghostJob: newValue }));
  };

  const handleRejectionFeedbackChange = (value: string) => {
    // Toggle off if same value is clicked
    const newValue = formData.rejectionFeedback === value ? "" : value;
    setFormData(prev => ({ ...prev, rejectionFeedback: newValue }));
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
              <SimpleSelect 
                value={formData.companyType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyType: value }))}
              >
                <SimpleSelectTrigger className="mt-2">
                  <SimpleSelectValue placeholder="Select type" />
                </SimpleSelectTrigger>
                <SimpleSelectContent>
                  <SimpleSelectItem value="company">Direct Company Application</SimpleSelectItem>
                  <SimpleSelectItem value="recruiter">External Recruiter/Agency</SimpleSelectItem>
                </SimpleSelectContent>
              </SimpleSelect>
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
              <SimpleSelect 
                value={formData.companyIndustry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyIndustry: value }))}
              >
                <SimpleSelectTrigger className="mt-2">
                  <SimpleSelectValue placeholder="Select industry" />
                </SimpleSelectTrigger>
                <SimpleSelectContent>
                  <SimpleSelectItem value="technology">Technology</SimpleSelectItem>
                  <SimpleSelectItem value="finance">Finance</SimpleSelectItem>
                  <SimpleSelectItem value="healthcare">Healthcare</SimpleSelectItem>
                  <SimpleSelectItem value="marketing">Marketing</SimpleSelectItem>
                  <SimpleSelectItem value="manufacturing">Manufacturing</SimpleSelectItem>
                  <SimpleSelectItem value="consulting">Consulting</SimpleSelectItem>
                  <SimpleSelectItem value="education">Education</SimpleSelectItem>
                  <SimpleSelectItem value="retail">Retail</SimpleSelectItem>
                  <SimpleSelectItem value="media">Media & Entertainment</SimpleSelectItem>
                  <SimpleSelectItem value="nonprofit">Non-Profit</SimpleSelectItem>
                  <SimpleSelectItem value="government">Government</SimpleSelectItem>
                  <SimpleSelectItem value="other">Other</SimpleSelectItem>
                </SimpleSelectContent>
              </SimpleSelect>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "yes", label: "Yes, they responded", id: "response-yes" },
                { value: "no", label: "No response (ghosted)", id: "response-no" },
                { value: "pending", label: "Still waiting", id: "response-pending" }
              ].map(({ value, label, id }) => (
                <div 
                  key={value}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.receivedResponse === value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleResponseChange(value)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.receivedResponse === value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.receivedResponse === value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <Label htmlFor={id} className="flex-1 cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {showResponseDetails && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label htmlFor="responseTime" className="text-sm font-medium text-gray-700">
                  Response Time
                </Label>
                <SimpleSelect 
                  value={formData.responseTime} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responseTime: value }))}
                >
                  <SimpleSelectTrigger className="mt-2">
                    <SimpleSelectValue placeholder="Select timeframe" />
                  </SimpleSelectTrigger>
                  <SimpleSelectContent>
                    <SimpleSelectItem value="same_day">Same day</SimpleSelectItem>
                    <SimpleSelectItem value="1_3_days">1-3 days</SimpleSelectItem>
                    <SimpleSelectItem value="1_week">1 week</SimpleSelectItem>
                    <SimpleSelectItem value="2_weeks">2 weeks</SimpleSelectItem>
                    <SimpleSelectItem value="1_month">1 month</SimpleSelectItem>
                    <SimpleSelectItem value="longer">Longer than 1 month</SimpleSelectItem>
                  </SimpleSelectContent>
                </SimpleSelect>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-3">
                  Communication Quality
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "excellent", label: "Excellent" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "poor", label: "Poor" }
                  ].map(({ value, label }) => (
                    <div 
                      key={value} 
                      className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.communicationQuality === value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleCommunicationChange(value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-2 ${
                        formData.communicationQuality === value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.communicationQuality === value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <Label htmlFor={`comm-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interview Progression Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-3">
              Were you offered an interview?
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "yes", label: "Yes, I was interviewed", id: "interview-yes" },
                { value: "no", label: "No interview offered", id: "interview-no" },
                { value: "n/a", label: "N/A (no response yet)", id: "interview-na" }
              ].map(({ value, label, id }) => (
                <div 
                  key={value}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.interviewOffered === value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleInterviewChange(value)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.interviewOffered === value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.interviewOffered === value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <Label htmlFor={id} className="flex-1 cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: "yes", label: "Yes, got an offer", id: "job-yes" },
                    { value: "no", label: "No, was rejected", id: "job-no" },
                    { value: "pending", label: "Still waiting", id: "job-pending" }
                  ].map(({ value, label, id }) => (
                    <div 
                      key={value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.jobOffered === value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleJobOfferChange(value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.jobOffered === value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.jobOffered === value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <Label htmlFor={id} className="flex-1 cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional tracking fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-3">
                Do you suspect this was a "ghost job" (fake posting)?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: "yes", label: "Yes, likely fake", id: "ghost-yes" },
                  { value: "no", label: "No, seemed legitimate", id: "ghost-no" }
                ].map(({ value, label, id }) => (
                  <div 
                    key={value}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.ghostJob === value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleGhostJobChange(value)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.ghostJob === value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.ghostJob === value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Label htmlFor={id} className="flex-1 cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-3">
                If rejected, did they provide feedback?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: "yes", label: "Yes, provided feedback", id: "feedback-yes" },
                  { value: "no", label: "No feedback given", id: "feedback-no" }
                ].map(({ value, label, id }) => (
                  <div 
                    key={value}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.rejectionFeedback === value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleRejectionFeedbackChange(value)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.rejectionFeedback === value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.rejectionFeedback === value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Label htmlFor={id} className="flex-1 cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
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
