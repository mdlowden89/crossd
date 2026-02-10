import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';

const SECTIONS = [
  {
    title: "AGREEMENT TO OUR LEGAL TERMS",
    content: "We are Crossd ('Company', 'we', 'us', or 'our'), a company registered in the United Kingdom at 3rd floor, 86-90 Paul Street, London, England EC2A 4NE.\n\nWe operate the website crossd.app (the 'Site'), the mobile application Crossd (the 'App'), as well as any other related products and services that refer or link to these legal terms (the 'Legal Terms') (collectively, the 'Services').\n\nYou can contact us by email at mlowdencrossd@gmail.com or by mail to 3rd floor, 86-90 Paul Street, London, England EC2A 4NE, United Kingdom."
  },
  {
    title: "1. OUR SERVICES",
    content: "The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable."
  },
  {
    title: "2. INTELLECTUAL PROPERTY RIGHTS",
    content: "We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the 'Content'), as well as the trademarks, service marks, and logos contained therein (the 'Marks'). Our Content and Marks are protected by copyright and trademark laws and treaties around the world.\n\nSubject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable licence to access the Services and to download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use."
  },
  {
    title: "3. USER REPRESENTATIONS",
    content: "By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means; (6) you will not use the Services for any illegal or unauthorised purpose; and (7) your use of the Services will not violate any applicable law or regulation."
  },
  {
    title: "4. USER REGISTRATION",
    content: "You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable."
  },
  {
    title: "5. PRODUCTS",
    content: "All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change."
  },
  {
    title: "6. PURCHASES AND PAYMENT",
    content: "We accept the following forms of payment: Visa, Mastercard. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in GBP Pound."
  },
  {
    title: "7. SUBSCRIPTIONS",
    content: "Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order.\n\nYou can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at mlowdencrossd@gmail.com."
  },
  {
    title: "8. REFUNDS POLICY",
    content: "All sales are final and no refund will be issued."
  },
  {
    title: "9. PROHIBITED ACTIVITIES",
    content: "You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us."
  },
  {
    title: "10. USER GENERATED CONTRIBUTIONS",
    content: "The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services."
  },
  {
    title: "11. CONTRIBUTION LICENCE",
    content: "By posting your Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt, and distribute such Contributions for any purpose, commercial, advertising, or otherwise."
  },
  {
    title: "12. MOBILE APPLICATION LICENCE",
    content: "If you access the Services via the App, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application licence."
  },
  {
    title: "13. SERVICES MANAGEMENT",
    content: "We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms; (3) refuse, restrict access to, limit the availability of, or disable any of your Contributions; (4) remove from the Services or otherwise disable files and content that are excessive in size or burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property."
  },
  {
    title: "14. PRIVACY POLICY",
    content: "We care about data privacy and security. Please review our Privacy Policy by visiting your in-app settings. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms."
  },
  {
    title: "15. COPYRIGHT INFRINGEMENTS",
    content: "We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us at mlowdencrossd@gmail.com."
  },
  {
    title: "16. TERM AND TERMINATION",
    content: "These Legal Terms shall remain in full force and effect while you use the Services. WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES, TO ANY PERSON FOR ANY REASON OR FOR NO REASON. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION."
  },
  {
    title: "17. MODIFICATIONS AND INTERRUPTIONS",
    content: "We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services."
  },
  {
    title: "18. GOVERNING LAW",
    content: "These Legal Terms are governed by and interpreted following the laws of the United Kingdom, and the use of the United Nations Convention of Contracts for the International Sales of Goods is expressly excluded."
  },
  {
    title: "19. DISPUTE RESOLUTION",
    content: "To expedite resolution and control the cost of any dispute, the Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days before initiating arbitration.\n\nAny dispute arising from the relationships between the Parties shall be determined by one arbitrator in accordance with the Arbitration and Internal Rules of the European Court of Arbitration."
  },
  {
    title: "20. CORRECTIONS",
    content: "There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice."
  },
  {
    title: "21. DISCLAIMER",
    content: "THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF."
  },
  {
    title: "22. LIMITATIONS OF LIABILITY",
    content: "IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES."
  },
  {
    title: "23. INDEMNIFICATION",
    content: "You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand made by any third party due to or arising out of your use of the Services, breach of these Legal Terms, or violation of any third party's rights."
  },
  {
    title: "24. USER DATA",
    content: "We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data."
  },
  {
    title: "25. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES",
    content: "Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS."
  },
  {
    title: "26. MISCELLANEOUS",
    content: "These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law."
  },
  {
    title: "27. CONTACT US",
    content: "In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:\n\nCrossd\n3rd floor, 86-90 Paul Street\nLondon, England EC2A 4NE\nUnited Kingdom\nmlowdencrossd@gmail.com"
  }
];

export default function TermsOfService() {
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
        <h1 className="text-xl font-bold text-white">Terms of Service</h1>
      </div>

      {/* Last Updated */}
      <p className="text-white/50 text-sm px-1 mb-6">Last updated: February 10, 2026</p>

      {/* Intro */}
      <CrossdCard className="mb-8 border-[#E70F72]/30">
        <p className="text-white/90 text-sm leading-relaxed mb-3">
          These Legal Terms constitute a legally binding agreement made between you and Crossd, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms.
        </p>
        <p className="text-white/65 text-sm">
          IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
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
          By using Crossd, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </CrossdCard>
    </div>
  );
}