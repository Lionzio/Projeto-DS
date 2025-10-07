import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Play, Calendar, Clock, TrendingUp, LogOut } from 'lucide-react';
import { mockInterviewHistory } from '../mock/data';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-slate-900">NEXOCARREIRA</h1>
            <div className="flex items-center space-x-4">
              <span className="text-slate-700">Welcome, {user?.name || 'User'}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to practice?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl">
            Start a new interview simulation or review your previous sessions 
            to track your progress and improve your skills.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/setup')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-3 h-6 w-6" />
            Start New Simulation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {mockInterviewHistory.length}
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Completed interviews
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {Math.round(mockInterviewHistory.reduce((acc, item) => acc + item.score, 0) / mockInterviewHistory.length)}
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Out of 100
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Practice Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {mockInterviewHistory.reduce((acc, item) => acc + item.duration, 0)}m
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Total minutes practiced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interview History */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Recent Interview History
          </h3>
          
          <div className="space-y-4">
            {mockInterviewHistory.map((interview) => (
              <Card key={interview.id} className="border-slate-200 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-slate-900">
                          {interview.jobRole}
                        </h4>
                        <Badge className={getScoreColor(interview.score)}>
                          Score: {interview.score}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">
                        {interview.company}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(interview.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {interview.duration} minutes
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/feedback', { state: { interviewId: interview.id } })}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        View Feedback
                      </Button>
                      <Button 
                        onClick={() => navigate('/setup')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Practice Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {mockInterviewHistory.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <h4 className="text-xl font-semibold text-slate-900 mb-2">
                  No interviews yet
                </h4>
                <p className="text-slate-600 mb-6">
                  Start your first interview simulation to begin tracking your progress.
                </p>
                <Button 
                  onClick={() => navigate('/setup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Your First Interview
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;