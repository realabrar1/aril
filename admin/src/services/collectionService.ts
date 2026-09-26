import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

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
  products?: Array<{
    id: number;
    name: string;
    sku: string;
    image_url?: string;
    images?: Array<{ image_url: string }>;
  }>;
  created_at?: string;
  updated_at?: string;
}

export const collectionService = {
  async getCollections(): Promise<ApiResponse<Collection[]>> {
    return apiClient<Collection[]>('/admin/collections');
  },

  async getCollection(id: number): Promise<ApiResponse<Collection>> {
    return apiClient<Collection>(`/admin/collections/${id}`);
  },

  async createCollection(data: Partial<Collection> & { product_ids?: number[] }): Promise<ApiResponse<Collection>> {
    return apiClient<Collection>('/admin/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCollection(id: number, data: Partial<Collection> & { product_ids?: number[] }): Promise<ApiResponse<Collection>> {
    return apiClient<Collection>(`/admin/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCollection(id: number): Promise<ApiResponse<null>> {
    return apiClient<null>(`/admin/collections/${id}`, {
      method: 'DELETE',
    });
  },

  async syncProducts(id: number, productIds: number[]): Promise<ApiResponse<Collection>> {
    return apiClient<Collection>(`/admin/collections/${id}/products`, {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    });
  },
};
