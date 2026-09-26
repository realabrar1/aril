import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  category_name: string;
  image_url?: string | null;
}

export interface ProductReviewItem {
  id: number;
  product_id: number;
  reviewer_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  images?: string[];
}

export interface ProductReviewsData {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  reviews: ProductReviewItem[];
}

export interface ReviewEligibilityData {
  can_review: boolean;
  reason?: string;
  message?: string;
  order_id?: number;
  already_reviewed?: boolean;
}

export const productService = {
  async getProducts(params?: {
    page?: number;
    search?: string;
    category_slug?: string;
    sort?: string;
    min_price?: number;
    max_price?: number;
    gender?: string;
  }): Promise<ApiResponse<Product[]> & { related_products?: Product[] }> {
    let query = `?page=${params?.page || 1}`;
    if (params?.search) query += `&search=${encodeURIComponent(params.search)}`;
    if (params?.category_slug) query += `&category_slug=${encodeURIComponent(params.category_slug)}`;
    if (params?.sort) query += `&sort=${encodeURIComponent(params.sort)}`;
    if (params?.min_price) query += `&min_price=${params.min_price}`;
    if (params?.max_price) query += `&max_price=${params.max_price}`;
    if (params?.gender) query += `&gender=${encodeURIComponent(params.gender)}`;

    return apiClient<Product[]>(`/products${query}`);
  },

  async getSearchSuggestions(query: string): Promise<ApiResponse<SearchSuggestion[]>> {
    if (!query.trim()) return { success: true, data: [] };
    return apiClient<SearchSuggestion[]>(`/products/suggestions?q=${encodeURIComponent(query)}`);
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      return await apiClient<Product>(`/products/${encodeURIComponent(slug)}`);
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Product not found.',
        data: undefined as any,
      };
    }
  },

  async getProductReviews(productId: number, page = 1): Promise<ApiResponse<ProductReviewsData>> {
    return apiClient<ProductReviewsData>(`/products/${productId}/reviews?page=${page}`);
  },

  async checkReviewEligibility(productId: number): Promise<ApiResponse<ReviewEligibilityData>> {
    return apiClient<ReviewEligibilityData>(`/products/${productId}/review-eligibility`);
  },

  async submitProductReview(formData: FormData): Promise<ApiResponse<any>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('femmeera_customer_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

    const res = await fetch(`${API_BASE_URL}/customer/reviews`, {
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
};
