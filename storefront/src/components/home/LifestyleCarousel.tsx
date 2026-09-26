'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cmsService, PublicLifestyleSlide } from '@/services/cmsService';

const fallbackSlides: PublicLifestyleSlide[] = [
  {
    id: 1,
    title: 'DAILY WEAR',
    subtitle: 'Anti-tarnish minimalist rings & hoops',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    link_url: '/collections/rings',
    sort_order: 1,
    is_active: 1,
  },
  {
    id: 2,
    title: 'OFFICE WEAR',
    subtitle: 'Sleek chains & subtle elegance',
    image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop',
    link_url: '/collections/chains',
    sort_order: 2,
    is_active: 1,
  },
  {
    id: 3,
    title: 'PARTY WEAR',
    subtitle: 'Statement earrings & glamour edits',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    link_url: '/collections/earrings',
    sort_order: 3,
    is_active: 1,
  },
  {
    id: 4,
    title: 'WEDDING WEAR',
    subtitle: 'Royal Kundan & luxury bridal sets',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    link_url: '/collections/necklaces',
    sort_order: 4,
    is_active: 1,
  },
  {
    id: 5,
    title: 'VACATION WEAR',
    subtitle: 'Waterproof cuffs & boho bracelets',
    image_url: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=800&auto=format&fit=crop',
    link_url: '/collections/bracelets',
    sort_order: 5,
    is_active: 1,
  },
];

interface LifestyleCarouselProps {
  initialSlides?: PublicLifestyleSlide[];
}

export const LifestyleCarousel: React.FC<LifestyleCarouselProps> = ({ initialSlides }) => {
  const router = useRouter();
  const [slides, setSlides] = useState<PublicLifestyleSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : fallbackSlides
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  // Drag & Swipe states
  const [dragOffset, setDragOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);

  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) {
      cmsService
        .getLifestyleSlides()
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const validSlides = res.data.map((s) => ({
              ...s,
              image_url: s.image_url || (s as any).image_display_url || '',
            })).filter((s) => s.image_url !== '');

            if (validSlides.length > 0) {
              setSlides(validSlides.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
            }
          }
        })
        .catch(() => {});
    }
  }, [initialSlides]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = slides.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Auto-scroll effect (changes slides every 3.5 seconds unless paused)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, total, handleNext]);

  // Touch & Mouse Handlers for Bi-Directional Sliding
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(true);
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startXRef.current = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const deltaX = clientX - startXRef.current;
    dragDistanceRef.current = deltaX;
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dist = dragDistanceRef.current;
    setDragOffset(0);

    // Bi-directional sliding logic:
    // Drag left (dist < -35) -> Move to NEXT slide
    // Drag right (dist > 35) -> Move to PREVIOUS slide
    if (dist < -35) {
      handleNext();
    } else if (dist > 35) {
      handlePrev();
    }

    setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  };

  const handleSlideClick = (slide: PublicLifestyleSlide, diff: number) => {
    if (Math.abs(dragDistanceRef.current) > 10) {
      // Was dragging, do not navigate
      return;
    }
    if (diff === 0) {
      if (slide.link_url) {
        router.push(slide.link_url);
      }
    } else {
      // Click side slide to make it center
      const targetIdx = slides.findIndex((s) => s.id === slide.id);
      if (targetIdx !== -1) {
        setActiveIndex(targetIdx);
      }
    }
  };

  if (total === 0) return null;

  return (
    <section className="w-full py-6 sm:py-10 bg-white overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 text-center">
        <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 font-medium tracking-widest uppercase">
          FOR EVERY YOU
        </h2>
        <div className="w-12 h-0.5 bg-[#B38548] mx-auto mt-2"></div>
      </div>

      {/* Carousel Container */}
      <div
        className="relative w-full max-w-[1350px] mx-auto h-[430px] sm:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => {
          handleTouchEnd();
          setIsPaused(false);
        }}
      >
        {/* Prev Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white text-neutral-900 shadow-lg rounded-full flex items-center justify-center transition-all z-30 hover:scale-105 border border-neutral-100 focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-800" />
        </button>

        {/* Next Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white text-neutral-900 shadow-lg rounded-full flex items-center justify-center transition-all z-30 hover:scale-105 border border-neutral-100 focus:outline-none"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-800" />
        </button>

        {/* Slides Track */}
        <div className="relative w-full h-full flex items-center justify-center">
          {slides.map((slide, i) => {
            // Shortest wrapped distance
            let diff = i - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const absDiff = Math.abs(diff);

            // Hide slides too far away (only keep 5 visible: -2, -1, 0, 1, 2)
            if (absDiff > 2) return null;

            // Positioning & sizing parameters (Desktop vs Mobile)
            let translateX = 0;
            let scale = 1;
            let zIndex = 1;
            let opacity = 1;

            if (isMobile) {
              // Mobile offsets
              if (diff === 0) {
                translateX = dragOffset;
                scale = 1.0;
                zIndex = 10;
                opacity = 1;
              } else if (diff === 1) {
                translateX = 175 + dragOffset * 0.7;
                scale = 0.88;
                zIndex = 5;
                opacity = 0.95;
              } else if (diff === -1) {
                translateX = -175 + dragOffset * 0.7;
                scale = 0.88;
                zIndex = 5;
                opacity = 0.95;
              } else if (diff === 2) {
                translateX = 310 + dragOffset * 0.5;
                scale = 0.78;
                zIndex = 2;
                opacity = 0.7;
              } else if (diff === -2) {
                translateX = -310 + dragOffset * 0.5;
                scale = 0.78;
                zIndex = 2;
                opacity = 0.7;
              }
            } else {
              // Desktop offsets (Palmonas overlapping style)
              if (diff === 0) {
                translateX = dragOffset;
                scale = 1.0;
                zIndex = 10;
                opacity = 1;
              } else if (diff === 1) {
                // Right adjacent slide
                translateX = 255 + dragOffset * 0.7;
                scale = 0.92;
                zIndex = 5;
                opacity = 1;
              } else if (diff === -1) {
                // Left adjacent slide
                translateX = -255 + dragOffset * 0.7;
                scale = 0.92;
                zIndex = 5;
                opacity = 1;
              } else if (diff === 2) {
                // Far right slide
                translateX = 430 + dragOffset * 0.5;
                scale = 0.84;
                zIndex = 2;
                opacity = 0.85;
              } else if (diff === -2) {
                // Far left slide
                translateX = -430 + dragOffset * 0.5;
                scale = 0.84;
                zIndex = 2;
                opacity = 0.85;
              }
            }

            return (
              <div
                key={slide.id || i}
                onClick={() => handleSlideClick(slide, diff)}
                className="absolute top-1/2 left-1/2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer"
                style={{
                  width: isMobile ? '290px' : '410px',
                  height: isMobile ? '380px' : '515px',
                  transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  opacity,
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-neutral-100 group">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || 'Lifestyle jewellery collection'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={diff === 0}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                  {/* Text Overlay */}
                  <div className="absolute bottom-6 left-0 right-0 text-center px-4 pointer-events-none z-10">
                    <h3
                      className={`font-serif uppercase tracking-[0.2em] font-medium text-white drop-shadow-md transition-all duration-300 ${
                        diff === 0
                          ? 'text-base sm:text-xl border-b-2 border-white/90 inline-block pb-1'
                          : 'text-xs sm:text-sm text-white/90'
                      }`}
                    >
                      {slide.title}
                    </h3>
                    {slide.subtitle && diff === 0 && (
                      <p className="text-[11px] sm:text-xs text-neutral-200 mt-1 font-light tracking-wide line-clamp-1">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
