'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CollectionFilterControlsProps {
  slug: string;
  productCount: number;
  currentSort: string;
  currentSearch: string;
  currentGender: string;
}

export const CollectionFilterControls: React.FC<CollectionFilterControlsProps> = ({
  slug,
  productCount,
  currentSort,
  currentSearch,
  currentGender,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page to 1 on filter update
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams('search', search);
  };

  return (
    <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D8] space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search items in this collection..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#EFE6D8] rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#B38548] font-medium placeholder:text-neutral-400"
        />
      </form>

      {/* Filter Controls & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs">
        {/* Gender Filter Chips */}
        <div className="flex items-center space-x-1.5">
          {['', 'WOMEN', 'UNISEX'].map((g) => {
            const isActive = currentGender === g;
            return (
              <button
                key={g || 'ALL'}
                type="button"
                onClick={() => updateQueryParams('gender', g)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-[#EFE6D8] hover:bg-neutral-100'
                }`}
              >
                {g || 'ALL'}
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#EFE6D8] shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#B38548]" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-500 hidden sm:inline">
            SORT:
          </span>
          <select
            value={currentSort}
            onChange={(e) => updateQueryParams('sort', e.target.value)}
            className="bg-transparent text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer"
          >
            <option value="newest">Latest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="best_seller">Best Sellers</option>
            <option value="featured">Featured Items</option>
          </select>
        </div>
      </div>
    </div>
  );
};
