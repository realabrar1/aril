import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  featured_image_caption?: string;
  author_id: number;
  author?: { id: number; name: string; email?: string };
  category_id?: number;
  category?: { id: number; name: string; slug: string };
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  is_featured: boolean;
  published_at?: string;
  reading_time: number;
  seo_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  canonical_url?: string;
  robots_index: boolean;
  robots_follow: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  tags?: { id: number; name: string; slug: string }[];
  faqs?: { id?: number; question: string; answer: string; sort_order?: number }[];
  related_products?: any[];
  related_posts?: any[];
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  posts_count?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export const blogAdminService = {
  async getPosts(params?: { status?: string; category_id?: number; search?: string; page?: number }): Promise<ApiResponse<BlogPost[]>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());

    return apiClient<BlogPost[]>(`/admin/blog/posts?${query.toString()}`);
  },

  async getPost(id: number): Promise<ApiResponse<BlogPost>> {
    return apiClient<BlogPost>(`/admin/blog/posts/${id}`);
  },

  async createPost(data: Partial<BlogPost> & { tag_ids?: number[]; faqs?: any[]; related_product_ids?: number[]; related_post_ids?: number[] }): Promise<ApiResponse<BlogPost>> {
    return apiClient<BlogPost>('/admin/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePost(id: number, data: Partial<BlogPost> & { tag_ids?: number[]; faqs?: any[]; related_product_ids?: number[]; related_post_ids?: number[] }): Promise<ApiResponse<BlogPost>> {
    return apiClient<BlogPost>(`/admin/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: number): Promise<ApiResponse<void>> {
    return apiClient<void>(`/admin/blog/posts/${id}`, {
      method: 'DELETE',
    });
  },

  async getCategories(): Promise<ApiResponse<BlogCategory[]>> {
    return apiClient<BlogCategory[]>('/admin/blog/categories');
  },

  async createCategory(data: { name: string; slug?: string; description?: string; sort_order?: number }): Promise<ApiResponse<BlogCategory>> {
    return apiClient<BlogCategory>('/admin/blog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: number, data: { name: string; slug?: string; description?: string; sort_order?: number }): Promise<ApiResponse<BlogCategory>> {
    return apiClient<BlogCategory>(`/admin/blog/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return apiClient<void>(`/admin/blog/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getTags(): Promise<ApiResponse<BlogTag[]>> {
    return apiClient<BlogTag[]>('/admin/blog/tags');
  },

  async createTag(data: { name: string; slug?: string }): Promise<ApiResponse<BlogTag>> {
    return apiClient<BlogTag>('/admin/blog/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
