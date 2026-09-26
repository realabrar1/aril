import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  sort_order: number;
  products_count?: number;
  product_count?: number;
}

export interface CollectionDetailResponse {
  collection: Collection;
  products: Product[];
}

export const collectionService = {
  async getCollections(): Promise<ApiResponse<Collection[]>> {
    return apiClient<Collection[]>('/collections');
  },

  async getCollectionBySlug(
    slug: string,
    params?: {
      search?: string;
      gender?: string;
      min_price?: number;
      max_price?: number;
      sort?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<ApiResponse<CollectionDetailResponse>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.min_price) query.append('min_price', String(params.min_price));
    if (params?.max_price) query.append('max_price', String(params.max_price));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));

    const queryString = query.toString();
    const endpoint = `/collections/${slug}${queryString ? `?${queryString}` : ''}`;
    return apiClient<CollectionDetailResponse>(endpoint);
  },
};
