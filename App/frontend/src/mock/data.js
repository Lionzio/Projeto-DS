export const mockInterviewHistory = [
  {
    id: '1',
    jobRole: 'Software Engineer',
    company: 'Google',
    date: '2024-01-15',
    score: 85,
    status: 'completed',
    duration: 45
  },
  {
    id: '2',
    jobRole: 'Product Manager',
    company: 'Microsoft',
    date: '2024-01-12',
    score: 78,
    status: 'completed',
    duration: 38
  },
  {
    id: '3',
    jobRole: 'Data Scientist',
    company: 'Amazon',
    date: '2024-01-10',
    score: 92,
    status: 'completed',
    duration: 52
  }
];

export const mockQuestions = [
  {
    id: '1',
    question: "Tell me about yourself and why you're interested in this position.",
    type: 'behavioral',
    timeLimit: 180
  },
  {
    id: '2',
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    type: 'behavioral',
    timeLimit: 240
  },
  {
    id: '3',
    question: "What are your greatest strengths and how do they apply to this role?",
    type: 'behavioral',
    timeLimit: 180
  },
  {
    id: '4',
    question: "Where do you see yourself in 5 years?",
    type: 'career',
    timeLimit: 120
  }
];

export const mockFeedback = {
  overallScore: 85,
  metrics: {
    clarity: 88,
    structure: 82,
    content: 87,
    confidence: 83
  },
  answers: [
    {
      questionId: '1',
      question: "Tell me about yourself and why you're interested in this position.",
      answer: "I'm a recent computer science graduate with a passion for software development. I've completed internships at two tech companies where I gained experience in full-stack development...",
      score: 85,
      strengths: [
        "Clear introduction with relevant background",
        "Good connection between experience and role",
        "Confident delivery"
      ],
      improvements: [
        "Could be more specific about achievements",
        "Add more details about technical skills"
      ]
    },
    {
      questionId: '2',
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      answer: "During my internship, I worked on a project to redesign the user authentication system. The main challenge was migrating existing users without disrupting service...",
      score: 87,
      strengths: [
        "Excellent use of STAR method",
        "Specific technical details",
        "Clear problem-solving approach"
      ],
      improvements: [
        "Could emphasize team collaboration more",
        "Add metrics about the impact"
      ]
    }
  ]
};