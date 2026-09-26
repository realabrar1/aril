'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Truck,
  Gift,
  ShieldCheck,
  X
} from 'lucide-react';
import { Category, User } from '@/types';
import { categoryService } from '@/services/categoryService';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { settingService } from '@/services/settingService';
import { productService, SearchSuggestion } from '@/services/productService';
import { MobileNavDrawer } from './MobileNavDrawer';
import { CartDrawer } from './CartDrawer';

const mobileAnnouncements = [
  { icon: Gift, text: 'Free Gift on Orders Above ₹889' },
  { icon: Truck, text: 'Fast Shipping' },
  { icon: ShieldCheck, text: '100% Genuine | Anti-Tarnish Jewellery' },
];

export const Header: React.FC = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [mobileAnnouncementIndex, setMobileAnnouncementIndex] = useState(0);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMobileAnnouncementIndex((prev) => (prev + 1) % mobileAnnouncements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });

    settingService.getSettings().then((res) => {
      if (res.success && res.data) {
        setLogoUrl(res.data.store_logo || '');
        setFacebookUrl(res.data.social_facebook || '');
      }
    });

    const updateAuthUser = () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();
      if (storedUser || token) {
        setUser(storedUser || ({ id: 0, name: 'Account', email: '' } as any));
      } else {
        setUser(null);
      }
    };

    updateAuthUser();
    updateCounts();

    window.addEventListener('storage', updateCounts);
    window.addEventListener('storage', updateAuthUser);
    window.addEventListener('arilha-cart-updated', updateCounts);
    window.addEventListener('arilha-auth-updated', updateAuthUser);
    window.addEventListener('femmeera-cart-updated', updateCounts);
    window.addEventListener('femmeera-auth-updated', updateAuthUser);
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('storage', updateAuthUser);
      window.removeEventListener('arilha-cart-updated', updateCounts);
      window.removeEventListener('arilha-auth-updated', updateAuthUser);
      window.removeEventListener('femmeera-cart-updated', updateCounts);
      window.removeEventListener('femmeera-auth-updated', updateAuthUser);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productService.getSearchSuggestions(searchQuery);
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch (err) {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateCounts = async () => {
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCartCount(res.data.item_count);
      }
    } catch { }
    setWishlistCount(wishlistService.getWishlist().length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/product/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const womenCategory = categories.find((c) => c.slug === 'women') || categories[0];
  const subCategories = categories.filter((c) => c.parent_id === womenCategory?.id);

  const CurrentMobileIcon = mobileAnnouncements[mobileAnnouncementIndex].icon;

  return (
    <>
      {/* Top Announcement Utility Bar */}
      {isAnnouncementVisible && (
        <div className="bg-[#FAF7F2] border-b border-[#EFEAE1] py-2 text-[11px] text-[#4A453E] font-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

            {/* Mobile Auto-Rotating Announcement */}
            <div className="flex md:hidden items-center space-x-1.5 transition-all duration-300 ease-in-out">
              <CurrentMobileIcon className="w-3.5 h-3.5 text-[#5C5449] shrink-0" />
              <span>{mobileAnnouncements[mobileAnnouncementIndex].text}</span>
            </div>

            {/* Desktop Left: Shipping Info */}
            <div className="hidden md:flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-[#5C5449]" />
              <span>Fast Shipping</span>
            </div>

            {/* Desktop Center: Free Gift Offer */}
            <div className="hidden md:flex items-center space-x-1.5">
              <Gift className="w-3.5 h-3.5 text-[#5C5449]" />
              <span>Free Gift on Orders Above ₹889</span>
            </div>

            {/* Right: Guarantee, Social Links & Dismiss Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5C5449]" />
                <span>100% Genuine | Anti-Tarnish Jewellery</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-[#DED6C7] text-[#6B6357]">
                <span>Follow Us</span>
                <span>|</span>
                <a href="https://www.instagram.com/arilha.co/" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href={facebookUrl || 'https://www.facebook.com/profile.php?id=61593964537005'} target="_blank" rel="noreferrer" className="hover:text-black transition-colors" aria-label="Facebook">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.417V8z" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@arilha_co" target="_blank" rel="noreferrer" className="hover:text-black transition-colors" aria-label="Youtube">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
              <button
                onClick={() => setIsAnnouncementVisible(false)}
                className="p-0.5 text-[#6B6357] hover:text-black transition-colors ml-2"
                title="Close Announcement Bar"
                aria-label="Close Announcement Bar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Brand & Utility Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFEAE1] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4 sm:gap-8">

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 text-neutral-800 hover:bg-[#FAF7F2] rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* ARILHA Brand Logo Graphic or Uploaded Image Logo */}
          <Link href="/" className="flex items-center shrink-0 py-1">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="ARILHA Logo"
                className="h-9 sm:h-11 w-auto object-contain max-w-[180px]"
              />
            ) : (
              <div className="flex flex-col items-start justify-center group">
                <div className="flex items-center space-x-1">
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-neutral-900 group-hover:text-[#B38548] transition-colors relative">
                    AR<span className="relative">I<span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-[#C59B58]">✦</span></span>LHA
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-serif italic text-neutral-500 tracking-wider -mt-1 pl-0.5">
                  by Irsa Khan
                </span>
              </div>
            )}
          </Link>

          {/* Center Search Input Field (Visible on Desktop & Tablet) */}
          <div className="hidden sm:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for jewellery, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-11 py-2.5 bg-[#F5F3ED] border border-transparent rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#C59B58] transition-all"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black transition-colors"
                aria-label="Submit Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions Box */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#EFEAE1] shadow-2xl rounded-2xl p-3 z-50 max-h-80 overflow-y-auto space-y-1">
                {isSearching ? (
                  <p className="text-[11px] text-neutral-400 p-2 text-center font-bold">Searching products...</p>
                ) : suggestions.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                      Matching Products ({suggestions.length})
                    </span>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.slug)}
                        className="w-full text-left p-2 hover:bg-[#FAF7F2] rounded-xl flex items-center space-x-3 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400 font-bold">ARI</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#B38548] transition-colors">{item.name}</h4>
                          <span className="text-[10px] text-neutral-400 block truncate">{item.category_name}</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-900">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2 mt-1 text-center text-xs font-bold text-[#B38548] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center space-y-1">
                    <p className="text-xs text-neutral-500 font-medium">No direct matches for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Utilities (Icon + Text Label Below) */}
          <div className="flex items-center space-x-4 sm:space-x-6">

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 text-neutral-800 hover:bg-[#FAF7F2] rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Link */}
            {(() => {
              const isLoggedIn = isMounted && (!!user || !!authService.getStoredToken());
              return (
                <Link
                  href={isLoggedIn ? '/account' : '/login'}
                  className="flex flex-col items-center group text-neutral-800 hover:text-[#B38548] transition-colors"
                  title={isLoggedIn ? `Account (${user?.name || 'Logged In'})` : 'Sign In / Register'}
                >
                  <div className="relative p-0.5">
                    <UserIcon className="w-5 h-5 stroke-[1.5]" />
                    {isLoggedIn && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium mt-0.5 text-neutral-800 group-hover:text-[#B38548]">Account</span>
                </Link>
              );
            })()}

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="flex flex-col items-center group text-neutral-800 hover:text-[#B38548] transition-colors"
            >
              <div className="relative p-0.5">
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 bg-[#B38548] text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-0.5 text-neutral-800 group-hover:text-[#B38548]">Wishlist</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex flex-col items-center group text-neutral-800 hover:text-[#B38548] transition-colors"
            >
              <div className="relative p-0.5">
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 bg-neutral-900 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-[11px] font-medium mt-0.5 text-neutral-800 group-hover:text-[#B38548]">Cart</span>
            </button>

          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {isSearchOpen && (
          <div className="sm:hidden px-4 pb-3 border-t border-[#EFEAE1] pt-2 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for jewellery, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-[#F5F3ED] rounded-full text-xs text-neutral-800 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={subCategories}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onCartUpdate={updateCounts}
      />
    </>
  );
};
