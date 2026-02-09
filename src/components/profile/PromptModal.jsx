import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CrossdModal } from '@/components/ui/crossd-modal';
import { CrossdButton } from '@/components/ui/crossd-button';
import { motion } from 'framer-motion';

const PROMPT_QUESTIONS = [
  "About Me: Unusual Skills",
  "Typical Sunday",
  "A Random Fact I love is",
  "My Greatest Strength",
  "My Simple Pleasures",
  "I recently discovered that",
  "Dating me is like",
  "My most irrational fear",
  "This year, I really want to",
  "The Way to win me over is",
  "I go crazy for",
  "A life goal of mine",
];

export default function PromptModal({ isOpen, onClose, onSave }) {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSave = () => {
    if (selectedQuestion && answer.trim()) {
      onSave({ question: selectedQuestion, answer: answer.trim() });
      setSelectedQuestion('');
      setAnswer('');
    }
  };

  const handleClose = () => {
    setSelectedQuestion('');
    setAnswer('');
    onClose();
  };

  return (
    <CrossdModal isOpen={isOpen} onClose={handleClose} showClose>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Profile Prompts</h2>
          <p className="text-white/65 text-sm">Answer prompts to show more of your personality.</p>
        </div>

        <div className="border-2 border-[#E70F72] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Add New Prompt</h3>
          
          <div>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="w-full bg-transparent border border-white/20 text-white rounded-xl p-3 focus:outline-none focus:border-[#E70F72]"
            >
              <option value="" className="bg-[#0B0B0B]">Select a prompt...</option>
              {PROMPT_QUESTIONS.map((q) => (
                <option key={q} value={q} className="bg-[#0B0B0B]">
                  {q}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full bg-transparent border-2 border-[#E70F72] text-white rounded-xl p-3 focus:outline-none min-h-[140px] resize-none placeholder-white/40"
          />

          <div className="flex gap-3">
            <CrossdButton 
              onClick={handleSave}
              disabled={!selectedQuestion || !answer.trim()}
              className="flex-1"
            >
              Save Prompt
            </CrossdButton>
            <CrossdButton 
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </CrossdButton>
          </div>
        </div>
      </motion.div>
    </CrossdModal>
  );
}