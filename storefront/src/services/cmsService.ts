import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface PublicHeroBanner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  mobile_image_url: string;
  button_text: string;
  button_url: string;
  sort_order: number;
}

export interface PublicPopup {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  coupon_code?: string;
  delay_seconds?: number;
  cta_text?: string;
  cta_url?: string;
}

export interface PublicReel {
  id: number;
  title: string;
  video_url: string;
  poster_url?: string | null;
  product_url: string;
  button_text?: string;
  sort_order: number;
}

export interface PublicLifestyleSlide {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean | number;
}

export interface PublicTestimonial {
  id?: number;
  name: string;
  quote: string;
  verified?: string;
  rating?: number;
  sort_order?: number;
}

export const cmsService = {
  async getHeroBanners(): Promise<ApiResponse<PublicHeroBanner[]>> {
    return apiClient.get<PublicHeroBanner[]>('/cms/hero-banners');
  },

  async getPopup(): Promise<ApiResponse<PublicPopup | null>> {
    return apiClient.get<PublicPopup | null>('/cms/popup');
  },

  async getPromotionalPopup(): Promise<ApiResponse<PublicPopup | null>> {
    return this.getPopup();
  },

  async getAnnouncement(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/cms/announcement');
  },

  async getWatchAndShopReels(): Promise<ApiResponse<PublicReel[]>> {
    return apiClient.get<PublicReel[]>('/cms/watch-and-shop');
  },

  async getLifestyleSlides(): Promise<ApiResponse<PublicLifestyleSlide[]>> {
    return apiClient.get<PublicLifestyleSlide[]>('/cms/lifestyle-slides');
  },

  async getTestimonials(): Promise<ApiResponse<PublicTestimonial[]>> {
    return apiClient.get<PublicTestimonial[]>('/cms/testimonials');
  },

  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return apiClient.get<Record<string, any>>('/settings');
  },
};
