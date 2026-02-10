import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';

const SECTIONS = [
  {
    title: "SUMMARY OF KEY POINTS",
    content: "What personal information do we process? When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.\n\nDo we process any sensitive personal information? Some of the information may be considered 'special' or 'sensitive' in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law.\n\nDo we collect any information from third parties? We do not collect any information from third parties.\n\nHow do we process your information? We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.\n\nIn what situations and with which parties do we share personal information? We may share information in specific situations and with specific third parties.\n\nHow do we keep your information safe? We have adequate organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.\n\nWhat are your rights? Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.\n\nHow do you exercise your rights? The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us."
  },
  {
    title: "1. WHAT INFORMATION DO WE COLLECT?",
    content: "Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:\n\n• names\n• email addresses\n• usernames\n• passwords\n• contact preferences\n• billing addresses\n• debit/credit card numbers\n\nSensitive Information. When necessary, with your consent or as otherwise permitted by applicable law, we process the following categories of sensitive information:\n\n• financial data\n• data about a person's sex life or sexual orientation\n• information revealing race or ethnic origin\n• information revealing political opinions\n• information revealing religious or philosophical beliefs\n\nPayment Data. We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by Stripe. You may find their privacy notice link here: https://stripe.com/gb/privacy.\n\nAll personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.\n\nInformation Automatically Collected. We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.\n\nLog and Usage Data. Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services. This may include your IP address, device information, browser type, and settings and information about your activity in the Services.\n\nLocation Data. We collect location data such as information about your device's location, which can be either precise or imprecise. You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Location setting on your device. However, if you choose to opt out, you may not be able to use certain aspects of the Services.\n\nGoogle API. Our use of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements."
  },
  {
    title: "2. HOW DO WE PROCESS YOUR INFORMATION?",
    content: "We process your personal information for a variety of reasons, depending on how you interact with our Services, including:\n\n• To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.\n\n• To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.\n\n• To respond to user inquiries/offer support to users. We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.\n\n• To enable user-to-user communications. We may process your information if you choose to use any of our offerings that allow for communication with another user.\n\n• To request feedback. We may process your information when necessary to request feedback and to contact you about your use of our Services.\n\n• To send you marketing and promotional communications. We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time.\n\n• To protect our Services. We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.\n\n• To identify usage trends. We may process information about how you use our Services to better understand how they are being used so we can improve them.\n\n• To save or protect an individual's vital interest. We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm."
  },
  {
    title: "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?",
    content: "If you have questions or comments about this notice, you may email us at mlowdencrossd@gmail.com or contact us by post at:\n\nCrossd\n3rd floor, 86-90 Paul Street\nLondon, England EC2A 4NE\nUnited Kingdom"
  },
  {
    title: "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
    content: "Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a data subject access request by contacting us at mlowdencrossd@gmail.com."
  }
];

export default function PrivacyPolicy() {
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
        <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
      </div>

      {/* Last Updated */}
      <p className="text-white/50 text-sm px-1 mb-6">Last updated: June 23, 2025</p>

      {/* Intro */}
      <CrossdCard className="mb-8 border-[#E70F72]/30">
        <p className="text-white/90 text-sm leading-relaxed mb-3">
          This Privacy Notice for Crossd describes how and why we might access, collect, store, use, and/or share your personal information when you use our services, including when you visit our website at crossd.app or use the Crossd mobile app.
        </p>
        <p className="text-white/65 text-sm leading-relaxed mb-3">
          Crossd is a mobile-first social discovery app that helps people reconnect after real-life encounters. Users log shared experiences in physical locations and can explore potential mutual connections based on overlapping paths and shared interests.
        </p>
        <p className="text-white/65 text-sm">
          Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at mlowdencrossd@gmail.com.
        </p>
      </CrossdCard>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section, idx) => (
          <CrossdCard key={idx}>
            <h2 className="text-[#E70F72] font-semibold text-sm mb-3">{section.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </CrossdCard>
        ))}
      </div>

      {/* Footer note */}
      <CrossdCard className="mt-8 bg-white/5 border-white/10">
        <p className="text-white/60 text-xs text-center">
          We are committed to protecting your privacy and ensuring you have a positive experience on our platform.
        </p>
      </CrossdCard>
    </div>
  );
}