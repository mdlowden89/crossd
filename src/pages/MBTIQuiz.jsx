import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdProgressRing } from '@/components/ui/crossd-progress-ring';

const questions = [
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
    question: "You prefer plans that are...",
    options: [
      { text: "Flexible and open to change", value: "P" },
      { text: "Structured and organized", value: "J" }
    ],
    dimension: "JP"
  },
  {
    id: 3,
    question: "When making decisions, you rely more on...",
    options: [
      { text: "Logic and objective analysis", value: "T" },
      { text: "Feelings and how others will be affected", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 4,
    question: "You're more interested in...",
    options: [
      { text: "What is real and actual", value: "S" },
      { text: "What is possible and potential", value: "N" }
    ],
    dimension: "SN"
  },
  {
    id: 5,
    question: "After socializing, you feel...",
    options: [
      { text: "Energized and want more", value: "E" },
      { text: "Drained and need alone time", value: "I" }
    ],
    dimension: "EI"
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
    question: "You'd rather be seen as...",
    options: [
      { text: "Reasonable and fair", value: "T" },
      { text: "Warm and compassionate", value: "F" }
    ],
    dimension: "TF"
  },
  {
    id: 8,
    question: "Your workspace is usually...",
    options: [
      { text: "Neat and organized", value: "J" },
      { text: "Creative and flexible", value: "P" }
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.values(finalAnswers).forEach(answer => {
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

    window.location.href = createPageUrl('FirstMoment');
  };

  const skipQuiz = () => {
    window.location.href = createPageUrl('FirstMoment');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (result) {
    return (
      <div className="min-h-screen bg-black px-6 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <Sparkles className="w-12 h-12 text-[#E70F72] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Your Vibe Type</h1>
          </div>

          <CrossdCard glow className="mb-8">
            <div className="text-5xl font-bold text-[#E70F72] mb-4">{result}</div>
            <p className="text-white/80">{mbtiDescriptions[result]}</p>
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
            <span className="text-white/65 text-sm">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-[#E70F72] font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#E70F72]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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