import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface HeroBanner {
  id?: number;
  title: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  image_display_url?: string;
  mobile_image_display_url?: string;
  button_text?: string;
  button_url?: string;
  sort_order?: number;
  status: 'ACTIVE' | 'DISABLED';
}

export interface PopupItem {
  id?: number;
  title: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  coupon_code?: string;
  status: 'ACTIVE' | 'DISABLED';
}

export interface LifestyleSlide {
  id?: number;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  sort_order?: number;
  status?: 'ACTIVE' | 'DISABLED';
  is_active?: boolean | number;
}

export interface TestimonialItem {
  id?: number;
  name: string;
  quote: string;
  verified?: string;
  rating?: number;
  sort_order?: number;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
  updated_at?: string;
}

export const cmsService = {
  // Banners
  async getBanners(): Promise<ApiResponse<HeroBanner[]>> {
    return apiClient.get<HeroBanner[]>('/admin/banners');
  },

  async createBanner(data: Partial<HeroBanner>): Promise<ApiResponse<HeroBanner>> {
    return apiClient.post<HeroBanner>('/admin/banners', data);
  },

  async updateBanner(id: number, data: Partial<HeroBanner>): Promise<ApiResponse<HeroBanner>> {
    return apiClient.put<HeroBanner>(`/admin/banners/${id}`, data);
  },

  async deleteBanner(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/banners/${id}`);
  },

  // Popups
  async getPopups(): Promise<ApiResponse<PopupItem[]>> {
    return apiClient.get<PopupItem[]>('/admin/popups');
  },

  async createPopup(data: Partial<PopupItem>): Promise<ApiResponse<PopupItem>> {
    return apiClient.post<PopupItem>('/admin/popups', data);
  },

  async updatePopup(id: number, data: Partial<PopupItem>): Promise<ApiResponse<PopupItem>> {
    return apiClient.put<PopupItem>(`/admin/popups/${id}`, data);
  },

  async deletePopup(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/popups/${id}`);
  },

  // Lifestyle / Category Carousel Slides
  async getLifestyleSlides(): Promise<ApiResponse<LifestyleSlide[]>> {
    return apiClient.get<LifestyleSlide[]>('/admin/lifestyle-slides');
  },

  async createLifestyleSlide(data: Partial<LifestyleSlide>): Promise<ApiResponse<LifestyleSlide>> {
    return apiClient.post<LifestyleSlide>('/admin/lifestyle-slides', data);
  },

  async updateLifestyleSlide(id: number, data: Partial<LifestyleSlide>): Promise<ApiResponse<LifestyleSlide>> {
    return apiClient.put<LifestyleSlide>(`/admin/lifestyle-slides/${id}`, data);
  },

  async deleteLifestyleSlide(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/lifestyle-slides/${id}`);
  },

  // Customer Testimonials ("WHAT OUR CLIENTS SAY")
  async getTestimonials(): Promise<ApiResponse<TestimonialItem[]>> {
    return apiClient.get<TestimonialItem[]>('/admin/testimonials');
  },

  async createTestimonial(data: Partial<TestimonialItem>): Promise<ApiResponse<TestimonialItem>> {
    return apiClient.post<TestimonialItem>('/admin/testimonials', data);
  },

  async updateTestimonial(id: number, data: Partial<TestimonialItem>): Promise<ApiResponse<TestimonialItem>> {
    return apiClient.put<TestimonialItem>(`/admin/testimonials/${id}`, data);
  },

  async deleteTestimonial(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/testimonials/${id}`);
  },

  // Store & CMS Settings
  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return apiClient.get<Record<string, any>>('/admin/settings');
  },

  async updateSettings(data: Record<string, any>): Promise<ApiResponse<Record<string, any>>> {
    return apiClient.post<Record<string, any>>('/admin/settings', data);
  },
};
