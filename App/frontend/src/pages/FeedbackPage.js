import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Home,
  Award,
  Target,
  MessageSquare,
  Brain
} from 'lucide-react';
import { mockFeedback } from '../mock/data';

const FeedbackPage = () => {
  const navigate = useNavigate();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-slate-900">Interview Feedback</h1>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate('/setup')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Section */}
        <div className="mb-12">
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-r ${getScoreGradient(mockFeedback.overallScore)} p-8 text-white`}>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
                  <p className="text-lg opacity-90">
                    Here's how you performed in your interview simulation
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {mockFeedback.overallScore}
                  </div>
                  <div className="text-xl opacity-90">Overall Score</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Performance Breakdown</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(mockFeedback.metrics).map(([metric, score]) => (
              <Card key={metric} className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 capitalize flex items-center">
                    {metric === 'clarity' && <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />}
                    {metric === 'structure' && <Target className="h-5 w-5 mr-2 text-blue-600" />}
                    {metric === 'content' && <Brain className="h-5 w-5 mr-2 text-blue-600" />}
                    {metric === 'confidence' && <Award className="h-5 w-5 mr-2 text-blue-600" />}
                    {metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Answer Feedback */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Question-by-Question Analysis</h3>
          <div className="space-y-8">
            {mockFeedback.answers.map((answerFeedback, index) => (
              <Card key={answerFeedback.questionId} className="border-slate-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900 mb-2">
                        Question {index + 1}
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-700 leading-relaxed">
                        {answerFeedback.question}
                      </CardDescription>
                    </div>
                    <Badge className={`ml-4 ${getScoreColor(answerFeedback.score)} bg-opacity-10`}>
                      Score: {answerFeedback.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Answer Preview */}
                    <div>
                      <h5 className="font-semibold text-slate-900 mb-2">Your Answer:</h5>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-slate-700 leading-relaxed">
                          {answerFeedback.answer.length > 200 
                            ? `${answerFeedback.answer.substring(0, 200)}...` 
                            : answerFeedback.answer
                          }
                        </p>
                      </div>
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          Strengths
                        </h5>
                        <ul className="space-y-2">
                          {answerFeedback.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-slate-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-3 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                          Areas for Improvement
                        </h5>
                        <ul className="space-y-2">
                          {answerFeedback.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-slate-700">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-12 border-slate-200 bg-blue-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
              Next Steps
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Keep Practicing
                </h4>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  Regular practice helps build confidence and improve your interview skills. 
                  Try different types of questions and roles to expand your experience.
                </p>
                <Button 
                  onClick={() => navigate('/setup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Another Session
                </Button>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Track Your Progress
                </h4>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  Review your interview history on the dashboard to see how you're 
                  improving over time and identify patterns in your responses.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;