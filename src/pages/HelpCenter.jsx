import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';

const FAQS = [
  {
    id: 1,
    question: "How does Crossing work?",
    answer: "Crossing detects when you and another user are at the same location at the same time. When you both log moments in the same area, the app notifies you that you've crossed paths. You can then decide if you'd like to connect!"
  },
  {
    id: 2,
    question: "How do I verify my identity?",
    answer: "Go to Settings > Verification and upload a selfie. The app will compare your selfie with your profile photo to confirm your identity. This helps keep the community safe and builds trust."
  },
  {
    id: 3,
    question: "What is Glow Mode?",
    answer: "Glow Mode is a premium feature that boosts your visibility in the discovery feed for 24 hours. Your profile appears more frequently to potential matches, and you'll see stats on how many people viewed your profile during the boost."
  },
  {
    id: 4,
    question: "How do I block or report someone?",
    answer: "You can block a user from their profile or chat by tapping the block icon. To report inappropriate behavior, use the report button on their profile. Reports are reviewed by our safety team."
  },
  {
    id: 5,
    question: "What is Crossd Plus?",
    answer: "Crossd Plus is a premium subscription that unlocks features like unlimited likes, advanced filters, seeing who liked you, and more. You can subscribe monthly or yearly."
  },
  {
    id: 6,
    question: "How do moments work?",
    answer: "Log a moment when you're at a venue or location. You can add a note or mood tags to describe what you're doing. Your moments are visible to other users nearby, and they help power the Crossing feature."
  },
  {
    id: 7,
    question: "Is my location data private?",
    answer: "Yes. You control your location privacy with the privacy level setting on each moment (Venue, Approximate, or Hidden). Other users only see the information you've chosen to share."
  },
  {
    id: 8,
    question: "How can I delete my account?",
    answer: "Go to Settings and scroll to the bottom. Tap 'Delete Account' to permanently remove your profile and all associated data. This action cannot be undone."
  }
];

export default function HelpCenter() {
  const [expandedId, setExpandedId] = useState(null);
  const [contactForm, setContactForm] = useState({ email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = async () => {
    if (!contactForm.email || !contactForm.subject || !contactForm.message) return;

    setContactLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@crossd.app',
        subject: `Support Request: ${contactForm.subject}`,
        body: `From: ${contactForm.email}\n\n${contactForm.message}`
      });
      setContactSuccess(true);
      setContactForm({ email: '', subject: '', message: '' });
      setTimeout(() => setContactSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Help Center</h1>
      </div>

      {/* FAQs */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-4 px-1">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <button
              key={faq.id}
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full text-left"
            >
              <CrossdCard className="hover:border-[#E70F72]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 pt-1">
                    <p className="text-white font-medium">{faq.question}</p>
                    {expandedId === faq.id && (
                      <p className="text-white/65 text-sm mt-3">{faq.answer}</p>
                    )}
                  </div>
                  <div className="text-[#E70F72] flex-shrink-0 pt-1">
                    {expandedId === faq.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CrossdCard>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-4 px-1">Still Need Help?</h2>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Your email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl p-3 text-white placeholder:text-white/40"
          />
          <input
            type="text"
            placeholder="Subject"
            value={contactForm.subject}
            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
            className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl p-3 text-white placeholder:text-white/40"
          />
          <textarea
            placeholder="How can we help?"
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl p-3 text-white placeholder:text-white/40 resize-none h-24"
          />
          
          {contactSuccess && (
            <p className="text-[#E70F72] text-sm">Thanks for reaching out! We'll be in touch soon.</p>
          )}
          
          <CrossdButton
            onClick={handleContactSubmit}
            disabled={!contactForm.email || !contactForm.subject || !contactForm.message || contactLoading}
            className="w-full"
          >
            <Send className="w-4 h-4" />
            Send Message
          </CrossdButton>
        </div>
      </div>
    </div>
  );
}