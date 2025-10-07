import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Clock, Send, SkipForward } from 'lucide-react';
import { mockQuestions } from '../mock/data';

const LiveInterview = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes default
  const [isTimerActive, setIsTimerActive] = useState(true);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setIsTimerActive(true);
    }
  }, [currentQuestion]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return 'text-green-600';
    if (timeLeft > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: {
          question: currentQuestion.question,
          answer: currentAnswer.trim(),
          timeUsed: currentQuestion.timeLimit - timeLeft
        }
      };
      setAnswers(newAnswers);
      setCurrentAnswer('');
      
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Interview complete
        sessionStorage.setItem('interviewAnswers', JSON.stringify(newAnswers));
        navigate('/feedback');
      }
    }
  };

  const handleNextQuestion = () => {
    handleSubmitAnswer();
  };

  const handleSkipQuestion = () => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        question: currentQuestion.question,
        answer: 'Skipped',
        timeUsed: currentQuestion.timeLimit - timeLeft
      }
    };
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      sessionStorage.setItem('interviewAnswers', JSON.stringify(newAnswers));
      navigate('/feedback');
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900">NEXOCARREIRA Interview</h1>
              <Badge variant="outline" className="text-slate-600">
                Question {currentQuestionIndex + 1} of {mockQuestions.length}
              </Badge>
            </div>
            <div className={`flex items-center space-x-2 font-mono text-lg font-semibold ${getTimerColor()}`}>
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="pb-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Interview Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Question Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <Badge className="mb-4 bg-blue-100 text-blue-800">
                  {currentQuestion.type}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
            </CardContent>
          </Card>

          {/* Answer Input */}
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-3">
                    Your Answer
                  </label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Take your time and provide a thoughtful response..."
                    rows={8}
                    className="text-base leading-relaxed border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Speak naturally and be specific with examples where possible.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim()}
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {currentQuestionIndex < mockQuestions.length - 1 ? 'Next Question' : 'Complete Interview'}
                  </Button>
                  
                  <Button 
                    onClick={handleSkipQuestion}
                    variant="outline"
                    size="lg"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-lg font-semibold rounded-lg"
                  >
                    <SkipForward className="mr-2 h-5 w-5" />
                    Skip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Tips */}
          <Card className="border-slate-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Interview Tips:
              </h3>
              <ul className="space-y-1 text-slate-700">
                <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
                <li>• Be specific and provide concrete examples from your experience</li>
                <li>• It's okay to take a moment to think before answering</li>
                <li>• Focus on your achievements and what you learned</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;