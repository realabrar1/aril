import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Truck,
  ArrowRight,
  Heart,
  ChevronLeft,
  Gem,
  CheckCircle2,
  Smile
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ARILHA | ARILHA by Irsa Khan',
  description:
    'Discover the story behind ARILHA by Irsa Khan — modern Indian jewellery designed to be a part of everyday life.',
  alternates: {
    canonical: 'https://arilha.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-neutral-800 font-sans selection:bg-[#B38548] selection:text-white">
      {/* 1. TOP HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#EFE6D8] bg-[#F7F2EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 z-10">
              <Link
                href="/"
                className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1.5 transition-colors uppercase tracking-wider mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>

              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase block">
                  OUR BRAND STORY
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-neutral-900 leading-none">
                  ARILHA
                </h1>
              </div>

              <p className="font-serif italic text-lg sm:text-2xl text-[#8C6430] leading-snug max-w-xl">
                &ldquo;Modern Indian jewellery designed to be a part of every day life.&rdquo;
              </p>

              <div className="w-16 h-0.5 bg-[#B38548] pt-0.5" />

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg font-light">
                Founded by creator Irsa Khan, ARILHA blends heritage craftsmanship with contemporary, lightweight edits. Created for women who celebrate their individuality every single day.
              </p>
            </div>

            {/* Right Hero Image Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-[#EFE6D8]">
                <Image
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop"
                  alt="ARILHA Luxury Jewellery Model Editorial"
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white font-serif italic text-xs sm:text-sm tracking-wide bg-neutral-900/60 backdrop-blur-xs px-4 py-1.5 rounded-full border border-white/20">
                  ARILHA Signature Editorial Edit
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 py-12 sm:py-20">

        {/* 2. JEWELLERY MADE FOR REAL LIFE (2-Column Asymmetric Section) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">

          {/* Left Arched Product Photography */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-4/5 w-full rounded-t-[100px] sm:rounded-t-[120px] rounded-b-3xl overflow-hidden shadow-lg border border-[#EBE3D7] bg-[#F4EEE5]">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
                alt="Handcrafted Gold & Pearl Jewellery"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Right Brand Ethos */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 order-1 lg:order-2">
            <div className="w-12 h-12 rounded-full bg-[#F4EEE5] text-[#B38548] flex items-center justify-center border border-[#E7DEC8] shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-medium tracking-tight">
              Jewellery Made For Real Life
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              <p>
                At ARILHA, we create jewellery that feels as special as your everyday moments. Our designs are inspired by modern Indian women — confident, graceful and always on the go.
              </p>
              <p>
                From timeless classics to contemporary styles, each piece is crafted with care, blending tradition with today&apos;s trends. Because jewellery isn&apos;t just an accessory, it&apos;s a part of your story.
              </p>
            </div>

            <div className="pt-2 border-t border-[#EFE6D8]">
              <p className="font-serif italic text-lg sm:text-xl text-[#B38548] font-medium">
                ARILHA is about wearing jewellery your way.
              </p>
            </div>
          </div>

        </section>

        {/* 3. MEET IRSA KHAN (FOUNDER & CREATOR CARD) */}
        <section className="bg-[#F5EFE6] rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E8DEC8] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Founder Portrait */}
            <div className="lg:col-span-4">
              <div className="relative aspect-3/4 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#E4D7C2] bg-neutral-200">
                <Image
                  src="/images/irsa.webp"
                  alt="Irsa Khan - Founder & Creator of ARILHA"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Founder Bio & Quote */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#B38548] uppercase block">
                  FOUNDER &amp; CREATOR
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-medium tracking-tight mt-1">
                  Meet Irsa Khan
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
                <p className="font-medium text-[#8C6430] text-sm">
                  The creator behind ARILHA.
                </p>
                <p>
                  Irsa Khan is the creative and face behind ARILHA. With her experience as a fashion creator and style influencer, Irsa brings her personal sense of fashion, styling and self-expression directly into every product line.
                </p>
                <p>
                  ARILHA brings together tradition, modernity, contemporary fashion and anti-tarnish jewellery designed to be worn far beyond special occasions.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DEC8]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-xl text-neutral-900 font-bold">
                    Created by Irsa. Made for you.
                  </h4>
                  <span className="text-xs font-serif italic text-[#B38548] block">
                    ARILHA by Irsa Khan
                  </span>
                </div>

                <Link
                  href="/collections/irsa-favourite"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#B38548] hover:bg-[#966C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <span>Explore Irsa&apos;s Picks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* 4. OUR MISSION (DARK LUXURY CONTRAST STRIP) */}
        <section id="our-mission" className="relative rounded-3xl overflow-hidden bg-[#595246] text-white shadow-xl scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">

            {/* Mission Text */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-4 sm:space-y-6">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#D8B47E] uppercase block">
                OUR MISSION
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
                To make beautiful jewellery a part of everyday life.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                At ARILHA, our mission is to bring you jewellery that feels effortless, expressive and accessible. We believe every woman deserves pieces that make her feel special — every single day.
              </p>
            </div>

            {/* Mission Photography */}
            <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full min-h-[300px]">
              <Image
                src="https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1200&auto=format&fit=crop"
                alt="ARILHA Anti-tarnish Gold Jewellery Mission"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#595246] via-transparent to-transparent hidden lg:block" />
            </div>

          </div>
        </section>

        {/* 5. WHAT GUIDES US (CORE VALUES 4 CARDS) */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#B38548] uppercase block">
              OUR CORE VALUES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-medium tracking-tight">
              What Guides Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {/* Card 1 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EFE6D8] hover:border-[#B38548] hover:shadow-md transition-all text-center space-y-3 group">
              <div className="w-12 h-12 rounded-full bg-[#F4EEE5] group-hover:bg-[#B38548] group-hover:text-white text-[#B38548] flex items-center justify-center mx-auto transition-colors border border-[#E7DEC8]">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-neutral-900">
                Quality Craftsmanship
              </h3>
              <p className="text-xs text-neutral-500 leading-snug font-light">
                Finely crafted, with attention to every detail.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EFE6D8] hover:border-[#B38548] hover:shadow-md transition-all text-center space-y-3 group">
              <div className="w-12 h-12 rounded-full bg-[#F4EEE5] group-hover:bg-[#B38548] group-hover:text-white text-[#B38548] flex items-center justify-center mx-auto transition-colors border border-[#E7DEC8]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-neutral-900">
                Modern Designs
              </h3>
              <p className="text-xs text-neutral-500 leading-snug font-light">
                Trendy yet timeless for today&apos;s woman.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EFE6D8] hover:border-[#B38548] hover:shadow-md transition-all text-center space-y-3 group">
              <div className="w-12 h-12 rounded-full bg-[#F4EEE5] group-hover:bg-[#B38548] group-hover:text-white text-[#B38548] flex items-center justify-center mx-auto transition-colors border border-[#E7DEC8]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-neutral-900">
                Secure Payments
              </h3>
              <p className="text-xs text-neutral-500 leading-snug font-light">
                Shop with confidence, always.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EFE6D8] hover:border-[#B38548] hover:shadow-md transition-all text-center space-y-3 group">
              <div className="w-12 h-12 rounded-full bg-[#F4EEE5] group-hover:bg-[#B38548] group-hover:text-white text-[#B38548] flex items-center justify-center mx-auto transition-colors border border-[#E7DEC8]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-neutral-900">
                Reliable Delivery
              </h3>
              <p className="text-xs text-neutral-500 leading-snug font-light">
                Your jewellery, right on time.
              </p>
            </div>

          </div>
        </section>

        {/* 6. OUR PROMISE & CTA BANNER */}
        <section className="bg-[#F5EFE6] rounded-3xl p-8 sm:p-12 border border-[#E8DEC8] text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#B38548] uppercase block">
              OUR PROMISE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
              More than just jewellery.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light pt-2">
              We promise to bring you pieces that make you feel confident, beautiful and uniquely you — because you deserve nothing less.
            </p>
          </div>

          <p className="font-serif italic text-2xl sm:text-3xl text-[#B38548]">
            Stay beautiful. Stay Arilha.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-neutral-900 hover:bg-[#B38548] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-105"
            >
              <span>EXPLORE ALL COLLECTIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
