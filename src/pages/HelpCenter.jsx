import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Send, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';

const FAQS = [
  {
    id: 1,
    question: "What is Crossd?",
    answer: "Crossd is a dating app built around real-world moments. Instead of endless swiping, Crossd helps you reconnect with people you may have crossed paths with — or feel genuinely compatible with — in real life. We focus on personality & energy, shared places and vibes, and intentional, meaningful connection. Crossd is about quality sparks, not volume."
  },
  {
    id: 2,
    question: "How is Crossd different from other dating apps?",
    answer: "Most dating apps match based on photos and quick impressions. Crossd looks at personality & communication style, vibe tags and interests, the kinds of places you enjoy, and compatibility energy — not just attraction. You'll see fewer profiles, but the ones you do see are more relevant."
  },
  {
    id: 3,
    question: "Does Crossd track my location?",
    answer: "Yes — but carefully and safely. We never show your exact location, live movement, or specific places and times. Instead, we use abstracted location signals (PlacesDNA) to understand types of places you enjoy — like cafés, parks, live music venues — not where you are right now. Your privacy always comes first."
  },
  {
    id: 4,
    question: "What is PlacesDNA?",
    answer: "PlacesDNA is Crossd's way of understanding where your energy feels most natural. It looks at categories of places you log moments at, the vibe of those environments (calm, social, creative, romantic), and patterns over time — never specific addresses. This helps us match you with people who feel sparks in similar environments."
  },
  {
    id: 5,
    question: "What is the personality quiz?",
    answer: "The personality quiz is a short, optional setup that helps Crossd understand how you think, connect, and communicate. The basic quiz takes ~2 minutes with an optional extended version for deeper accuracy. No answers are \"good\" or \"bad\". Your personality helps us improve compatibility, suggest better matches, and tailor conversation dynamics."
  },
  {
    id: 6,
    question: "What are Spark Swipes?",
    answer: "Spark Swipes are Crossd's compatibility-based matching mode. Instead of endless swiping, Spark Swipes surface profiles based on personality compatibility, shared vibe tags, PlacesDNA overlap, and real-world proximity (abstracted). If no profiles are available, you'll see your own Spark card — showing how you appear to others and how to improve your spark."
  },
  {
    id: 7,
    question: "What does the compatibility percentage mean?",
    answer: "The compatibility percentage reflects overall spark potential, not a guarantee. It's calculated using personality alignment and balance, communication style, shared vibes and interests, and place energy compatibility. High compatibility means easier conversations, better rhythm, and fewer mismatches — but chemistry still matters."
  },
  {
    id: 8,
    question: "What are vibe tags?",
    answer: "Vibe tags help you express how you live and connect, not just what you do. Examples include Night Owl, Thoughtful, Romantic, Creative, Coffee Shops, and Live Music. Some tags you choose, others are inferred or earned over time based on activity."
  },
  {
    id: 9,
    question: "Can I change my personality or vibe tags?",
    answer: "Yes. You can edit vibe tags anytime in your profile and retake or extend the personality quiz if you feel your result doesn't fit. Crossd is designed to evolve with you."
  },
  {
    id: 10,
    question: "What are challenges and rewards?",
    answer: "Challenges are optional ways to explore the app, improve your profile, and unlock badges, features, or boosts. Examples include logging moments, responding to matches, exploring new areas, and building consistent streaks. Some rewards are cosmetic, others improve visibility or insights."
  },
  {
    id: 11,
    question: "What is Crossd+?",
    answer: "Crossd+ is the premium version of Crossd. It unlocks deeper compatibility insights, full personality breakdowns, advanced Spark Swipes, enhanced visibility & glow features, extended chat tools, and exclusive badges and analytics. Crossd is fully usable for free — Crossd+ simply adds depth."
  },
  {
    id: 12,
    question: "Why can't I message someone?",
    answer: "Messaging is only available once there is mutual interest. This ensures no unwanted messages, higher quality conversations, and better safety for everyone. Some features may also be unlocked through challenges or Crossd+."
  },
  {
    id: 13,
    question: "How does Crossd protect users?",
    answer: "Safety is core to Crossd's design. We protect users by hiding precise locations and routines, limiting unsolicited messaging, allowing blocking and reporting, using progressive profile disclosure, and monitoring misuse patterns. You're always in control of what you share."
  },
  {
    id: 14,
    question: "How do I block or report someone?",
    answer: "You can block or report a user directly from their profile, a chat, or the match menu. Reports are reviewed seriously and confidentially."
  },
  {
    id: 15,
    question: "Why am I not seeing many profiles?",
    answer: "Crossd prioritises relevance over volume. You may see fewer profiles because we're waiting for stronger compatibility, there are fewer active users in your area, or your Spark profile can be improved. Completing challenges, adding vibe tags, or logging moments often increases visibility."
  },
  {
    id: 16,
    question: "The app isn't working properly — what should I do?",
    answer: "Try closing and reopening the app, updating to the latest version, and checking your internet connection. If the issue continues, contact support via the Help section."
  },
  {
    id: 17,
    question: "Can I delete my account?",
    answer: "Yes — anytime. Go to Profile → Settings → Account → Delete Account. All personal data is permanently removed."
  },
  {
    id: 18,
    question: "How can I contact support?",
    answer: "You can reach us through the in-app Help section or support email (listed in-app). We aim to respond as quickly as possible."
  },
  {
    id: 19,
    question: "Final note",
    answer: "Crossd works best when you complete your profile honestly, choose vibe tags that feel true, log moments naturally, and stay open, curious, and respectful. You're not here to impress — you're here to connect."
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