import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Upload, FileText, Briefcase, Building } from 'lucide-react';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobRole: '',
    company: '',
    jobDescription: '',
    cvFile: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store setup data in sessionStorage for the interview
    sessionStorage.setItem('interviewSetup', JSON.stringify(formData));
    navigate('/interview');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      cvFile: file
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Interview Setup</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Set up your interview simulation
          </h2>
          <p className="text-lg text-slate-600">
            Provide details about the position you're applying for to get the most 
            relevant interview questions and feedback.
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">
              Interview Details
            </CardTitle>
            <CardDescription className="text-slate-600">
              The more specific you are, the better we can tailor your interview experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Role */}
              <div className="space-y-3">
                <Label htmlFor="jobRole" className="text-lg font-semibold text-slate-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                  Job Role
                </Label>
                <Input
                  id="jobRole"
                  name="jobRole"
                  required
                  value={formData.jobRole}
                  onChange={handleChange}
                  className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                />
              </div>

              {/* Company */}
              <div className="space-y-3">
                <Label htmlFor="company" className="text-lg font-semibold text-slate-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Company (Optional)
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Google, Microsoft, Startup"
                />
              </div>

              {/* Job Description */}
              <div className="space-y-3">
                <Label htmlFor="jobDescription" className="text-lg font-semibold text-slate-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  required
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={6}
                  className="text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  placeholder="Paste the job description here. Include key responsibilities, requirements, and qualifications..."
                />
                <p className="text-sm text-slate-500">
                  This helps us generate more relevant interview questions
                </p>
              </div>

              {/* CV Upload */}
              <div className="space-y-3">
                <Label htmlFor="cvFile" className="text-lg font-semibold text-slate-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Upload Your CV (Optional)
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="cvFile"
                    name="cvFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="cvFile" 
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-slate-400" />
                    <span className="text-slate-600 font-medium">
                      {formData.cvFile ? formData.cvFile.name : 'Click to upload your CV'}
                    </span>
                    <span className="text-sm text-slate-500">
                      PDF, DOC, or DOCX up to 10MB
                    </span>
                  </Label>
                </div>
                <p className="text-sm text-slate-500">
                  We'll use your CV to ask more personalized questions about your experience
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Interview Simulation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8 border-slate-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Tips for the best experience:
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li>• Be as specific as possible in the job description</li>
              <li>• Find a quiet environment for your practice session</li>
              <li>• Treat this like a real interview - dress professionally</li>
              <li>• Take your time to think through each answer</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSetup;