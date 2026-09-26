'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { cmsService, PublicTestimonial } from '@/services/cmsService';

const DEFAULT_TESTIMONIALS: PublicTestimonial[] = [
  {
    quote: '"The design, quality, and anti-tarnish finish are incredible. ARILHA is my go-to jewellery brand now!"',
    name: 'Ananya R.',
    verified: 'Verified Buyer',
    rating: 5,
  },
  {
    quote: '"Beautiful Kundan choker set and fast delivery. Loved the piece I ordered for my sister\'s wedding!"',
    name: 'Priya S.',
    verified: 'Verified Buyer',
    rating: 5,
  },
  {
    quote: '"Chic everyday jewellery by Irsa Khan at such accessible prices. Highly recommended!"',
    name: 'Neha K.',
    verified: 'Verified Buyer',
    rating: 5,
  },
];

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(DEFAULT_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await cmsService.getTestimonials();
        if (res.success && res.data && res.data.length > 0) {
          setTestimonials(res.data);
        }
      } catch {
        // Silent fallback to default static testimonials
      }
    };
    loadTestimonials();
  }, []);

  // Auto-slide every 3.5 seconds on mobile devices
  useEffect(() => {
    if (isHovered || testimonials.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, testimonials.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 text-center">
      <div>
        <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase block">
          LOVE FROM OUR CUSTOMERS
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
          WHAT OUR CLIENTS SAY
        </h2>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className="h-px bg-[#C59B58] w-8"></span>
          <span className="text-[#B38548] text-xs">✨</span>
          <span className="h-px bg-[#C59B58] w-8"></span>
        </div>
      </div>

      {/* Desktop Grid View (md and above - 3 Columns) */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-[#FAF6F0] border border-[#EFE6D8] rounded-2xl p-6 text-left space-y-4 shadow-2xs hover:shadow-md transition-all"
          >
            <div className="flex text-amber-400">
              {[...Array(t.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="font-serif italic text-xs text-neutral-700 leading-relaxed">
              {t.quote.startsWith('"') ? t.quote : `"${t.quote}"`}
            </p>
            <div className="border-t border-[#E8DEC8] pt-3 flex items-center justify-between">
              <div>
                <h4 className="font-sans font-bold text-xs text-neutral-900">{t.name}</h4>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t.verified || 'Verified Buyer'}</span>
                </span>
              </div>
              <span className="text-[#B38548] text-xs font-serif font-bold">ARILHA</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Single Row Auto-Slider (< md) */}
      <div
        className="md:hidden relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative min-h-[190px] flex items-center">
          {testimonials.map((t, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                className={`w-full transition-all duration-700 ease-in-out transform ${
                  isActive
                    ? 'opacity-100 translate-x-0 relative z-10'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'
                }`}
              >
                <div className="bg-[#FAF6F0] border border-[#EFE6D8] rounded-2xl p-6 text-left space-y-4 shadow-md">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif italic text-xs text-neutral-700 leading-relaxed min-h-[48px]">
                    {t.quote.startsWith('"') ? t.quote : `"${t.quote}"`}
                  </p>
                  <div className="border-t border-[#E8DEC8] pt-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-neutral-900">{t.name}</h4>
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{t.verified || 'Verified Buyer'}</span>
                      </span>
                    </div>
                    <span className="text-[#B38548] text-xs font-serif font-bold">ARILHA</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Indicator Dots */}
        <div className="flex items-center justify-center space-x-2 pt-4">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex ? 'bg-[#B38548] w-5' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
