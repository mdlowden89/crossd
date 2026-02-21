import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdProgressRing } from '@/components/ui/crossd-progress-ring';

// Basic 16 questions
const basicQuestions = [
  // E/I Questions (4)
  {
    id: 1,
    question: "At a party, you usually...",
    options: [
      { text: "Talk to many people, including strangers", value: "E" },
      { text: "Stick with people you already know", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 2,
    question: "After socializing, you feel...",
    options: [
      { text: "Energized and want more", value: "E" },
      { text: "Drained and need alone time", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 3,
    question: "You recharge your energy by...",
    options: [
      { text: "Being around others and talking", value: "E" },
      { text: "Spending time alone with your thoughts", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 4,
    question: "In a group, you tend to...",
    options: [
      { text: "Share your thoughts openly", value: "E" },
      { text: "Listen more than you speak", value: "I" }
    ],
    dimension: "EI"
  },
  // S/N Questions (4)
  {
    id: 5,
    question: "You're more interested in...",
    options: [
      { text: "What is real and actual", value: "S" },
      { text: "What is possible and potential", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 6,
    question: "In conversations, you prefer to discuss...",
    options: [
      { text: "Practical matters and concrete details", value: "S" },
      { text: "Ideas, theories, and possibilities", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 7,
    question: "When learning something new, you prefer...",
    options: [
      { text: "Step-by-step instructions and examples", value: "S" },
      { text: "Understanding the big picture first", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 8,
    question: "You trust more...",
    options: [
      { text: "Experience and proven methods", value: "S" },
      { text: "Intuition and new ideas", value: "N" }
    ],
    dimension: "SN"
  },
  // T/F Questions (4)
  {
    id: 9,
    question: "When making decisions, you rely more on...",
    options: [
      { text: "Logic and objective analysis", value: "T" },
      { text: "Feelings and how others will be affected", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 10,
    question: "You'd rather be seen as...",
    options: [
      { text: "Reasonable and fair", value: "T" },
      { text: "Warm and compassionate", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 11,
    question: "In conflicts, you value...",
    options: [
      { text: "Being right and logical", value: "T" },
      { text: "Maintaining harmony and understanding feelings", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 12,
    question: "You're more proud of your...",
    options: [
      { text: "Problem-solving abilities", value: "T" },
      { text: "Empathy and understanding", value: "F" }
    ],
    dimension: "TF"
  },
  // J/P Questions (4)
  {
    id: 13,
    question: "You prefer plans that are...",
    options: [
      { text: "Structured and organized", value: "J" },
      { text: "Flexible and open to change", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 14,
    question: "Your workspace is usually...",
    options: [
      { text: "Neat and organized", value: "J" },
      { text: "Creative and flexible", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 15,
    question: "You feel better when things are...",
    options: [
      { text: "Decided and settled", value: "J" },
      { text: "Open to possibilities", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 16,
    question: "For a vacation, you prefer to...",
    options: [
      { text: "Plan everything in advance", value: "J" },
      { text: "Be spontaneous and go with the flow", value: "P" }
    ],
    dimension: "JP"
  }
];

// Advanced 16 questions for more accuracy
const advancedQuestions = [
  // E/I Advanced
  {
    id: 17,
    question: "You feel most alive when...",
    options: [
      { text: "You're out experiencing the world", value: "E" },
      { text: "You're in your own inner world", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 18,
    question: "When stressed, you prefer to...",
    options: [
      { text: "Talk it out with others", value: "E" },
      { text: "Process it alone", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 19,
    question: "Your ideal weekend includes...",
    options: [
      { text: "Multiple social activities", value: "E" },
      { text: "Quiet time to recharge", value: "I" }
    ],
    dimension: "EI"
  },
  {
    id: 20,
    question: "You make friends...",
    options: [
      { text: "Easily and quickly", value: "E" },
      { text: "Slowly but deeply", value: "I" }
    ],
    dimension: "EI"
  },
  // S/N Advanced
  {
    id: 21,
    question: "You're drawn to...",
    options: [
      { text: "What's proven and reliable", value: "S" },
      { text: "What's innovative and untested", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 22,
    question: "When telling a story, you focus on...",
    options: [
      { text: "Specific details and facts", value: "S" },
      { text: "The overall meaning and metaphors", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 23,
    question: "You're more interested in...",
    options: [
      { text: "Improving what exists", value: "S" },
      { text: "Imagining what could be", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 24,
    question: "You notice more...",
    options: [
      { text: "Concrete details in your environment", value: "S" },
      { text: "Patterns and connections", value: "N" }
    ],
    dimension: "SN"
  },
  // T/F Advanced
  {
    id: 25,
    question: "Criticism affects you...",
    options: [
      { text: "Less - you can be objective", value: "T" },
      { text: "More - you take it personally", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 26,
    question: "You'd rather be...",
    options: [
      { text: "Respected for your competence", value: "T" },
      { text: "Loved for your kindness", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 27,
    question: "In debates, you focus on...",
    options: [
      { text: "The logical arguments", value: "T" },
      { text: "The people's feelings", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 28,
    question: "You make better decisions when you...",
    options: [
      { text: "Remove emotions from the equation", value: "T" },
      { text: "Consider everyone's feelings", value: "F" }
    ],
    dimension: "TF"
  },
  // J/P Advanced
  {
    id: 29,
    question: "You work best...",
    options: [
      { text: "With a clear plan and deadlines", value: "J" },
      { text: "With flexibility and no pressure", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 30,
    question: "Deadlines make you feel...",
    options: [
      { text: "Motivated and focused", value: "J" },
      { text: "Stressed and constrained", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 31,
    question: "You prefer to...",
    options: [
      { text: "Make decisions quickly", value: "J" },
      { text: "Keep your options open", value: "P" }
    ],
    dimension: "JP"
  },
  {
    id: 32,
    question: "Your closet is...",
    options: [
      { text: "Organized by category or color", value: "J" },
      { text: "Organized in your own unique way", value: "P" }
    ],
    dimension: "JP"
  }
];

const mbtiDescriptions = {
  INTJ: "The Architect - Strategic, independent, and driven by logic",
  INTP: "The Logician - Innovative, curious, and analytical",
  ENTJ: "The Commander - Bold, ambitious, and strategic leaders",
  ENTP: "The Debater - Smart, curious, and intellectually bold",
  INFJ: "The Advocate - Idealistic, empathetic, and insightful",
  INFP: "The Mediator - Creative, idealistic, and guided by values",
  ENFJ: "The Protagonist - Charismatic, inspiring, and natural leaders",
  ENFP: "The Campaigner - Enthusiastic, creative, and sociable",
  ISTJ: "The Logistician - Practical, reliable, and fact-minded",
  ISFJ: "The Defender - Dedicated, warm, and protective",
  ESTJ: "The Executive - Organized, dedicated, and honest",
  ESFJ: "The Consul - Caring, social, and always willing to help",
  ISTP: "The Virtuoso - Bold, practical, and experimental",
  ISFP: "The Adventurer - Artistic, spontaneous, and flexible",
  ESTP: "The Entrepreneur - Smart, energetic, and perceptive",
  ESFP: "The Entertainer - Spontaneous, energetic, and fun-loving"
};

export default function MBTIQuiz() {
  const [quizMode, setQuizMode] = useState('basic'); // 'basic' or 'advanced'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [basicAnswers, setBasicAnswers] = useState({});
  const [advancedAnswers, setAdvancedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showInterim, setShowInterim] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = quizMode === 'basic' ? basicQuestions : advancedQuestions;
  const answers = quizMode === 'basic' ? basicAnswers : advancedAnswers;

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    
    if (quizMode === 'basic') {
      setBasicAnswers(newAnswers);
    } else {
      setAdvancedAnswers(newAnswers);
    }

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Finished this set
      if (quizMode === 'basic') {
        calculateResult(newAnswers, 'basic');
        setShowInterim(true);
      } else {
        calculateResult(newAnswers, 'advanced');
      }
    }
  };

  const calculateResult = (finalAnswers, mode) => {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // If advanced mode, combine basic + advanced answers
    const allAnswers = mode === 'advanced' 
      ? { ...basicAnswers, ...finalAnswers }
      : finalAnswers;
    
    Object.values(allAnswers).forEach(answer => {
      counts[answer]++;
    });

    const type = [
      counts.E >= counts.I ? 'E' : 'I',
      counts.S >= counts.N ? 'S' : 'N',
      counts.T >= counts.F ? 'T' : 'F',
      counts.J >= counts.P ? 'J' : 'P'
    ].join('');

    setResult(type);
  };

  const continueToAdvanced = () => {
    setShowInterim(false);
    setQuizMode('advanced');
    setCurrentQuestion(0);
  };

  const finishBasic = () => {
    saveAndContinue();
  };

  const saveAndContinue = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    
    if (profiles.length > 0) {
      await base44.entities.Profile.update(profiles[0].id, {
        mbti_type: result,
        mbti_quiz_results: answers
      });
    }

    window.location.href = createPageUrl('Dashboard');
  };

  const skipQuiz = () => {
    window.location.href = createPageUrl('FirstMoment');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const totalProgress = quizMode === 'basic' 
    ? (currentQuestion + 1) / (basicQuestions.length + advancedQuestions.length) * 100 
    : ((basicQuestions.length + currentQuestion + 1) / (basicQuestions.length + advancedQuestions.length)) * 100;

  // Interim screen after basic quiz
  if (showInterim && result) {
    return (
      <div className="min-h-screen bg-black px-6 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <Sparkles className="w-12 h-12 text-[#E70F72] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Your Basic Type: {mbtiDescriptions[result].split(' - ')[0]}</h1>
            <p className="text-[#E70F72] text-xl font-semibold">{result}</p>
          </div>

          <CrossdCard glow className="mb-8">
            <p className="text-white/80 mb-4">You've completed the standard quiz!</p>
            <p className="text-white/65 text-sm">
              This gives us a good starting point. For a more nuanced profile and even better 
              AI-powered match suggestions, answer the remaining questions.
            </p>
          </CrossdCard>

          <div className="space-y-3 mb-8">
            <CrossdButton onClick={continueToAdvanced} className="w-full" size="lg">
              Continue for More Accuracy
              <ChevronRight className="w-5 h-5 ml-1" />
            </CrossdButton>
            <CrossdButton onClick={finishBasic} variant="secondary" className="w-full">
              Finish Now
            </CrossdButton>
          </div>

          <button 
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="text-white/50 text-sm hover:text-white/80"
          >
            Save & Exit Later
          </button>
        </motion.div>
      </div>
    );
  }

  // Final result screen after full quiz
  if (result && !showInterim) {
    return (
      <div className="min-h-screen bg-black px-6 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <Sparkles className="w-12 h-12 text-[#E70F72] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              {quizMode === 'advanced' ? 'Your Complete Type' : 'Your Vibe Type'}
            </h1>
          </div>

          <CrossdCard glow className="mb-8">
            <div className="text-5xl font-bold text-[#E70F72] mb-4">{result}</div>
            <p className="text-white/80">{mbtiDescriptions[result]}</p>
            {quizMode === 'advanced' && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/65 text-sm">
                  ✨ You've completed the full assessment for maximum accuracy!
                </p>
              </div>
            )}
          </CrossdCard>

          <p className="text-white/65 mb-8">
            This helps us suggest compatible matches based on personality dynamics.
          </p>

          <CrossdButton onClick={saveAndContinue} className="w-full" loading={loading}>
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </CrossdButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <CrossdLogo size="sm" />
          <CrossdButton variant="ghost" size="sm" onClick={skipQuiz}>
            Skip
          </CrossdButton>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/65 text-sm">
              {quizMode === 'basic' ? 'Basic' : 'Advanced'} Quiz - Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-[#E70F72] font-medium">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#E70F72]"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {quizMode === 'advanced' && (
            <p className="text-white/50 text-xs mt-2">✨ Advanced questions for greater accuracy</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'border-[#E70F72] bg-[#E70F72]/10 text-white'
                      : 'border-white/15 text-white/80 hover:border-[#E70F72]/50'
                  }`}
                >
                  {option.text}
                </motion.button>
              ))}
            </div>

            {quizMode === 'basic' && currentQuestion === basicQuestions.length - 1 && answers[questions[currentQuestion].id] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 space-y-2"
              >
                <CrossdButton 
                  className="w-full"
                  onClick={() => {
                    calculateResult(answers, 'basic');
                    setShowInterim(true);
                  }}
                >
                  See Your Results
                  <ChevronRight className="w-5 h-5 ml-1" />
                </CrossdButton>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentQuestion > 0 && (
          <div className="mt-8">
            <CrossdButton variant="ghost" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </CrossdButton>
          </div>
        )}
      </div>
    </div>
  );
}