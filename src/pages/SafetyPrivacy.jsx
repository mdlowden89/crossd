import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';

const SECTIONS = [
  {
    title: "📍 Location & Privacy",
    items: [
      {
        subtitle: "Does Crossd use my location?",
        content: "Yes — in a protected, abstracted way. Crossd does not show your exact location, live movement, address or routine, or where you are right now. Instead, we use high-level location signals to understand types of places you enjoy (e.g. cafés, parks, live music venues) — not specific venues, times, or paths. This helps create meaningful connections without compromising safety."
      }
    ]
  },
  {
    title: "🧬 What is PlacesDNA — and what it is not",
    items: [
      {
        subtitle: "How PlacesDNA works",
        content: "PlacesDNA helps Crossd understand the energy of places you enjoy. It groups places into categories (calm, social, creative, romantic), looks at patterns over time (not single visits), and never exposes specific locations to other users. PlacesDNA is about compatibility, not tracking."
      }
    ]
  },
  {
    title: "👁 What other users can see",
    items: [
      {
        subtitle: "Visible to other users:",
        content: "Your profile photo and name, personality summary (if enabled), vibe tags you choose to show, and abstract compatibility insights (e.g. \"You share night energy\")."
      },
      {
        subtitle: "Never visible:",
        content: "Exact places you go, times you are active in the real world, your movement or routine, and your personal data."
      }
    ]
  },
  {
    title: "🧠 Personality & Data Use",
    items: [
      {
        subtitle: "How your personality data is used",
        content: "The personality quiz is optional. If you choose to complete it, results are used only to improve matching and communication. No results are shared outside Crossd. You can retake or remove your personality data at any time. We never use personality data for advertising or profiling outside the app."
      }
    ]
  },
  {
    title: "💬 Messaging & Contact",
    items: [
      {
        subtitle: "How messaging works",
        content: "To protect users: messaging is only enabled after mutual interest. No one can message you without consent. You can unmatch, block, or report at any time. There are no unsolicited messages on Crossd."
      }
    ]
  },
  {
    title: "🚫 Blocking & Reporting",
    items: [
      {
        subtitle: "You are always in control",
        content: "You can block a user instantly, report inappropriate behaviour, and remove matches without explanation. Reports are reviewed confidentially and taken seriously. We actively monitor for misuse and patterns of harm."
      }
    ]
  },
  {
    title: "🛡 Progressive Disclosure",
    items: [
      {
        subtitle: "How we protect you",
        content: "Not everything is visible at once. Deeper profile details unlock over time or mutual interest. Sensitive insights are opt-in or premium-only. This reduces pressure, anxiety, and oversharing."
      }
    ]
  },
  {
    title: "🔐 Data Security",
    items: [
      {
        subtitle: "Your data protection",
        content: "Your data is stored securely. We do not sell personal data. We only collect what is needed to run the app. You can delete your account at any time. When you delete your account, your data is permanently removed."
      }
    ]
  },
  {
    title: "🧭 Your Control",
    items: [
      {
        subtitle: "What you can change anytime",
        content: "You can edit or remove vibe tags, retake or delete your personality results, adjust notification settings, control visibility and discovery options, and delete your account. Crossd adapts to you — not the other way around."
      }
    ]
  },
  {
    title: "💭 Trust & Respect",
    items: [
      {
        subtitle: "Our core belief",
        content: "Real connection should feel safe. Privacy should be default, not optional. Curiosity should never come at the cost of security. If something doesn't feel right, you're encouraged to report it."
      }
    ]
  },
  {
    title: "📩 Need help or have concerns?",
    items: [
      {
        subtitle: "We're here to help",
        content: "Visit the Help section in-app or contact support directly from your settings. We're here to help — and we listen."
      }
    ]
  }
];

export default function SafetyPrivacy() {
  return (
    <div className="min-h-screen bg-black px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Safety & Privacy</h1>
      </div>

      {/* Intro */}
      <CrossdCard className="mb-8 border-[#E70F72]/30">
        <p className="text-white/90 leading-relaxed">
          Your safety and privacy are not features — they're foundational to how Crossd works.
        </p>
        <p className="text-white/65 text-sm mt-3">
          Crossd is designed to help people connect without exposing their routines, locations, or personal patterns. Everything we build starts from that principle.
        </p>
      </CrossdCard>

      {/* Sections */}
      <div className="space-y-8">
        {SECTIONS.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-white font-semibold mb-3 text-base">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <CrossdCard key={itemIdx}>
                  {item.subtitle && (
                    <p className="text-[#E70F72] text-sm font-medium mb-2">{item.subtitle}</p>
                  )}
                  <p className="text-white/80 text-sm leading-relaxed">{item.content}</p>
                </CrossdCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Final word */}
      <CrossdCard className="mt-8 bg-gradient-to-br from-[#E70F72]/10 to-transparent border-[#E70F72]/30">
        <p className="text-white font-medium mb-2">Final word</p>
        <p className="text-white/80 text-sm leading-relaxed">
          Crossd exists to help people reconnect in a meaningful way — not to track, expose, or pressure.
        </p>
        <p className="text-white/80 text-sm leading-relaxed mt-3">
          You deserve connection that feels calm, respectful, and safe.
        </p>
      </CrossdCard>
    </div>
  );
}