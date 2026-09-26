import { apiClient } from './apiClient';

export interface BlogPostCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
}

export interface BlogPostTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogFaqItem {
  id?: number;
  question: string;
  answer: string;
}

export interface PublicBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  featured_image_caption: string | null;
  author_id: number;
  category_id: number;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  is_featured: boolean;
  reading_time: number;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  category?: BlogPostCategory;
  author?: {
    id: number;
    name: string;
  };
  tags?: BlogPostTag[];
  faqs?: BlogFaqItem[];
  related_products?: any[];
  related_posts?: PublicBlogPost[];
}

export interface BlogListResponse {
  featured_post: PublicBlogPost | null;
  posts: PublicBlogPost[];
}

export interface BlogListMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export const blogService = {
  async getPosts(params?: { category?: string; search?: string; page?: number }): Promise<{
    data?: BlogListResponse;
    meta?: BlogListMeta;
    success: boolean;
    message?: string;
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());

    const queryString = query.toString();
    const endpoint = `/blog${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<BlogListResponse>(endpoint, { next: { revalidate: 60 } } as any);
    return response as any;
  },

  async getCategories(): Promise<{ success: boolean; data?: BlogPostCategory[] }> {
    const response = await apiClient<BlogPostCategory[]>('/blog/categories', { next: { revalidate: 300 } } as any);
    return response as any;
  },

  async getPostBySlug(slug: string): Promise<{
    success: boolean;
    data?: PublicBlogPost;
    is_redirect?: boolean;
    redirect_url?: string;
    new_slug?: string;
    message?: string;
  }> {
    const response = await apiClient<PublicBlogPost>(`/blog/${slug}`, { next: { revalidate: 60 } } as any);
    return response as any;
  }
};
