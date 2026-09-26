import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface ReviewImageItem {
  id: number;
  review_id: number;
  image_url: string;
}

export interface ReviewItem {
  id: number;
  product_id: number;
  product_name?: string;
  product_slug?: string;
  user_id?: number | null;
  reviewer_name?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  images?: ReviewImageItem[];
}

export const reviewService = {
  async getReviews(page = 1, status = '', search = ''): Promise<ApiResponse<ReviewItem[]>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const queryStr = params.toString();
    return apiClient.get<ReviewItem[]>(`/admin/reviews${queryStr ? `?${queryStr}` : ''}`);
  },

  async getReview(id: number): Promise<ApiResponse<ReviewItem>> {
    return apiClient.get<ReviewItem>(`/admin/reviews/${id}`);
  },

  async createReview(formData: FormData): Promise<ApiResponse<ReviewItem>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('femmeera_admin_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

    const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    return data;
  },

  async updateReview(id: number, data: Partial<ReviewItem>): Promise<ApiResponse<ReviewItem>> {
    return apiClient.put<ReviewItem>(`/admin/reviews/${id}`, data);
  },

  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/reviews/${id}/status`, { status });
  },

  async deleteReview(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/reviews/${id}`);
  },
};
