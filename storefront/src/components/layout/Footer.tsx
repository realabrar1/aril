'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { settingService } from '@/services/settingService';
import { apiClient } from '@/services/apiClient';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [storePhone, setStorePhone] = useState('+91 98765 43210');
  const [storeEmail, setStoreEmail] = useState('support@arilha.com');
  const [storeAddress, setStoreAddress] = useState('India');
  const [socials, setSocials] = useState({
    instagram: 'https://www.instagram.com/arilha.co/',
    facebook: 'https://www.facebook.com/profile.php?id=61593964537005',
    whatsapp: '',
    youtube: 'https://www.youtube.com/@arilha_co',
    pinterest: 'https://www.pinterest.com/Arilha_co',
    twitter: 'https://x.com/arilha_co',
  });

  useEffect(() => {
    settingService.getSettings().then((res) => {
      if (res.success && res.data) {
        setLogoUrl(res.data.store_logo || '');
        if (res.data.store_phone) setStorePhone(res.data.store_phone);
        if (res.data.store_email) setStoreEmail(res.data.store_email);
        if (res.data.store_address) setStoreAddress(res.data.store_address);
        setSocials({
          instagram: res.data.social_instagram || 'https://www.instagram.com/arilha.co/',
          facebook: res.data.social_facebook || 'https://www.facebook.com/profile.php?id=61593964537005',
          whatsapp: res.data.social_whatsapp || '',
          youtube: res.data.social_youtube || 'https://www.youtube.com/@arilha_co',
          pinterest: res.data.social_pinterest || 'https://www.pinterest.com/Arilha_co',
          twitter: res.data.social_twitter || 'https://x.com/arilha_co',
        });
      }
    });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    setSubscribeMsg(null);
    try {
      const res = await apiClient<{ coupon_code: string }>('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.success) {
        setSubscribeMsg(res.message || 'Thank you for subscribing! Use code WELCOME10 for 10% off.');
        setEmail('');
      } else {
        setSubscribeMsg(res.message || 'Subscription failed. Please try again.');
      }
    } catch {
      setSubscribeMsg('Thank you for subscribing to the ARILHA newsletter!');
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#FAF6F0] border-t border-[#EFE6D8] text-neutral-800 font-sans">
      
      {/* Top Newsletter Strip */}
      <div className="border-b border-[#EFE6D8] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase block">
              STAY IN TOUCH
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-neutral-900 font-medium">
              Subscribe &amp; get 10% off on your first order!
            </h3>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full md:w-80 px-4 py-3 bg-white border border-[#E8DEC8] rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-5 py-3 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center"
            >
              {subscribing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
        {subscribeMsg && (
          <p className="text-center text-xs font-semibold text-emerald-700 mt-2">
            ✨ {subscribeMsg}
          </p>
        )}
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        
        {/* Brand Summary */}
        <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-4">
          {logoUrl ? (
            <Link href="/" className="inline-block">
              <img
                src={logoUrl}
                alt="ARILHA by Irsa Khan Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
          ) : (
            <Link href="/" className="inline-block group">
              <div className="flex flex-col items-start justify-center">
                <div className="flex items-center space-x-1">
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-neutral-900 group-hover:text-[#B38548] transition-colors relative">
                    AR<span className="relative">I<span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-[#C59B58]">✦</span></span>LHA
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-serif italic text-neutral-500 tracking-wider -mt-1 pl-0.5">
                  by Irsa Khan
                </span>
              </div>
            </Link>
          )}

          <p className="text-neutral-600 leading-relaxed text-[11px]">
            Modern Indian jewellery designed for everyday wear, celebrations and every version of you. ARILHA by Irsa Khan.
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-2 pt-2 flex-wrap gap-y-2">
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#E8DEC8] bg-white flex items-center justify-center text-neutral-700 hover:text-[#B38548] hover:border-[#B38548] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#E8DEC8] bg-white flex items-center justify-center text-neutral-700 hover:text-[#B38548] hover:border-[#B38548] transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.417V8z"/></svg>
              </a>
            )}
            {socials.pinterest && (
              <a href={socials.pinterest} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#E8DEC8] bg-white flex items-center justify-center text-neutral-700 hover:text-[#B38548] hover:border-[#B38548] transition-colors" aria-label="Pinterest">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.02 0 1.513.769 1.513 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/></svg>
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#E8DEC8] bg-white flex items-center justify-center text-neutral-700 hover:text-[#B38548] hover:border-[#B38548] transition-colors" aria-label="X (Twitter)">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {socials.youtube && (
              <a href={socials.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#E8DEC8] bg-white flex items-center justify-center text-neutral-700 hover:text-[#B38548] hover:border-[#B38548] transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* SHOP Column */}
        <div className="space-y-3">
          <h4 className="font-sans font-bold text-[11px] uppercase tracking-wider text-neutral-900">
            SHOP
          </h4>
          <ul className="space-y-2 text-neutral-600 text-[11px]">
            <li><Link href="/shop" className="hover:text-[#B38548] transition-colors">New Arrivals</Link></li>
            <li><Link href="/collections/earrings" className="hover:text-[#B38548] transition-colors">Earrings &amp; Jhumkas</Link></li>
            <li><Link href="/collections/necklaces" className="hover:text-[#B38548] transition-colors">Necklaces &amp; Chains</Link></li>
            <li><Link href="/collections/bracelets" className="hover:text-[#B38548] transition-colors">Bracelets &amp; Bangles</Link></li>
            <li><Link href="/collections/rings" className="hover:text-[#B38548] transition-colors">Rings</Link></li>
            <li><Link href="/collections/diwali" className="hover:text-[#B38548] transition-colors">Kundan &amp; Bridal</Link></li>
          </ul>
        </div>

        {/* HELP Column */}
        <div className="space-y-3">
          <h4 className="font-sans font-bold text-[11px] uppercase tracking-wider text-neutral-900">
            HELP
          </h4>
          <ul className="space-y-2 text-neutral-600 text-[11px]">
            <li><Link href="/account/orders" className="hover:text-[#B38548] transition-colors">Track Order</Link></li>
            <li><Link href="/return-policy" className="hover:text-[#B38548] transition-colors">Returns &amp; Exchanges</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-[#B38548] transition-colors">Shipping Policy</Link></li>
            <li><Link href="/faq" className="hover:text-[#B38548] transition-colors">Jewellery Care &amp; FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-[#B38548] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* ABOUT Column */}
        <div className="space-y-3">
          <h4 className="font-sans font-bold text-[11px] uppercase tracking-wider text-neutral-900">
            ABOUT
          </h4>
          <ul className="space-y-2 text-neutral-600 text-[11px]">
            <li><Link href="/about" className="hover:text-[#B38548] transition-colors">About ARILHA</Link></li>
            <li><Link href="/about#our-story" className="hover:text-[#B38548] transition-colors">Meet Irsa Khan</Link></li>
            <li><Link href="/blog" className="hover:text-[#B38548] transition-colors">Blog</Link></li>
            <li><Link href="/journal" className="hover:text-[#B38548] transition-colors">Jewellery Journal</Link></li>
            <li><Link href="/privacy" className="hover:text-[#B38548] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#B38548] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* CONTACT US Column */}
        <div className="space-y-3">
          <h4 className="font-sans font-bold text-[11px] uppercase tracking-wider text-neutral-900">
            CONTACT US
          </h4>
          <ul className="space-y-2.5 text-neutral-600 text-[11px]">
            <li className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-[#B38548] shrink-0" />
              <span>{storeEmail}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[#B38548] shrink-0" />
              <span>Mon - Sat: 10AM - 7PM</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#B38548] shrink-0" />
              <span>{storeAddress}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar with Payment Icons */}
      <div className="border-t border-[#EFE6D8] py-6 px-4 sm:px-6 bg-[#FAF4EB]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} ARILHA by Irsa Khan. All Rights Reserved.</p>

          {/* Payment Method Badges */}
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-white border border-[#E8DEC8] rounded font-bold text-[10px] text-blue-700">VISA</span>
            <span className="px-2 py-1 bg-white border border-[#E8DEC8] rounded font-bold text-[10px] text-orange-600">Mastercard</span>
            <span className="px-2 py-1 bg-white border border-[#E8DEC8] rounded font-bold text-[10px] text-green-700">RuPay</span>
            <span className="px-2 py-1 bg-white border border-[#E8DEC8] rounded font-bold text-[10px] text-[#B38548]">UPI</span>
            <span className="px-2 py-1 bg-white border border-[#E8DEC8] rounded font-bold text-[10px] text-neutral-800">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
