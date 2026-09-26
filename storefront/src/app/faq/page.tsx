import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, HelpCircle, CreditCard, Truck, RotateCcw, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "FAQ | ARILHA",
  description: "Find answers to common questions about ARILHA jewellery, orders, payments, shipping, care, and returns.",
  alternates: {
    canonical: 'https://arilha.com/faq',
  },
};

const faqs = [
  {
    category: "About ARILHA & Products",
    icon: Sparkles,
    items: [
      {
        q: "What is ARILHA?",
        a: "ARILHA is a modern Indian jewellery brand created with the belief that jewellery should not be saved only for special occasions — it should be part of your everyday moments.",
      },
      {
        q: "Who created ARILHA?",
        a: "Irsa Khan is the creator and face behind ARILHA. With her experience as a creator and influencer, Irsa brings her personal sense of fashion, styling, and self-expression into every collection.",
      },
      {
        q: "What type of jewellery does ARILHA sell?",
        a: "ARILHA offers a curated range of modern Indian and everyday jewellery including:\n• Gold-plated jewellery & Anti-tarnish pieces\n• Kundan & Bridal jewellery sets\n• Jhumkas, Hoop & Drop Earrings\n• Necklaces, Chokers & Layered Chains\n• Bracelets, Bangles & Stacking Rings",
      },
      {
        q: "Is ARILHA jewellery anti-tarnish?",
        a: "Selected pieces in our everyday collections are specifically documented and treated with high-grade anti-tarnish coatings to ensure long-lasting shine for daily wear. Please refer to individual product detail pages for specific anti-tarnish specifications.",
      },
      {
        q: "Is ARILHA jewellery water-resistant?",
        a: "Certain stainless-steel and anti-tarnish items offer water resistance for everyday splash contact. However, to preserve the luster of gold-plating and gemstones, we recommend avoiding prolonged immersion in water.",
      },
      {
        q: "What is gold-plated jewellery?",
        a: "Gold-plated jewellery features a base metal (such as brass or sterling silver) finished with a fine layer of gold plating for a rich, luxurious look at an accessible price point.",
      },
      {
        q: "How should I care for my jewellery?",
        a: "JEWELLERY CARE TIPS:\n• Store pieces in a dry place.\n• Avoid direct contact with perfumes, lotions, and harsh chemicals.\n• Keep jewellery away from chlorine and cleaning products.\n• Wipe gently with a soft, dry cloth after use.\n• Store pieces separately in individual pouches to reduce scratches and tangling.",
      },
    ],
  },
  {
    category: "Orders & Payments",
    icon: CreditCard,
    items: [
      {
        q: "How can I place an order?",
        a: "Browse our jewellery catalog, select your preferred items, add them to your cart, and proceed to checkout. Enter your delivery information and complete the payment using one of our secure payment options.",
      },
      {
        q: "What payment methods are available?",
        a: "ARILHA supports multiple secure payment methods:\n• UPI & Wallets (Google Pay, PhonePe, Paytm)\n• Debit & Credit Cards (Visa, Mastercard, RuPay)\n• Cash on Delivery (COD) for eligible pincodes across India.",
      },
      {
        q: "How can I track my order?",
        a: "After placing an order, log in to your ARILHA account and visit 'My Orders' to view real-time dispatch updates and live courier tracking information.",
      },
    ],
  },
  {
    category: "Shipping & Returns",
    icon: RotateCcw,
    items: [
      {
        q: "How long does delivery take?",
        a: "Orders are dispatched within 24–48 hours. Standard delivery across India takes 3–5 business days, while express shipping options deliver in 1–2 business days.",
      },
      {
        q: "What is the return policy?",
        a: "We accept returns on eligible items within 7 days of delivery. Items must be unused, undamaged, and in their original ARILHA packaging. Please refer to our Return Policy page for step-by-step instructions.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-3 border-b border-[#EFE6D8] pb-8">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase">
            HELP CENTER & SUPPORT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Find answers to common questions about ARILHA jewellery, care instructions, shipping, payments, and returns.
          </p>
        </div>

        {/* Category Blocks */}
        <div className="space-y-8">
          {faqs.map((group, gIdx) => {
            const Icon = group.icon;
            return (
              <div key={gIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE6D8] shadow-xs space-y-6">
                <div className="flex items-center space-x-3 border-b border-[#F5EFE6] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF4EB] text-[#B38548] flex items-center justify-center border border-[#EFE5D5]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-xl font-medium text-neutral-900">
                    {group.category}
                  </h2>
                </div>

                <div className="space-y-6 divide-y divide-[#F5EFE6]">
                  {group.items.map((faq, iIdx) => (
                    <div key={iIdx} className={iIdx > 0 ? "pt-5 space-y-2" : "space-y-2"}>
                      <h3 className="text-sm font-bold text-neutral-900 flex items-start space-x-2">
                        <span className="text-[#B38548] font-mono">Q.</span>
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed pl-6 whitespace-pre-line">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#FAF4EB] p-8 rounded-3xl border border-[#EFE6D8] text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-neutral-900">
            Still Have Questions?
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
            Can't find the answer you're looking for? Our customer support team is always here to assist you.
          </p>
          <div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
