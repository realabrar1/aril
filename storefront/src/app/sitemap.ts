import { MetadataRoute } from 'next';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { collectionService } from '@/services/collectionService';
import { blogService } from '@/services/blogService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://arilha.com';

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/women`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  try {
    const [categoriesRes, collectionsRes, productsRes, blogRes] = await Promise.all([
      categoryService.getCategories().catch(() => ({ success: false, data: [] })),
      collectionService.getCollections().catch(() => ({ success: false, data: [] })),
      productService.getProducts({ page: 1 }).catch(() => ({ success: false, data: [] })),
      blogService.getPosts({ page: 1 }).catch(() => ({ success: false, data: { posts: [] } })),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data || [])
      .filter((cat) => Boolean(cat.slug))
      .map((cat) => ({
        url: `${baseUrl}/women/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    const collectionRoutes: MetadataRoute.Sitemap = (collectionsRes.data || [])
      .filter((col) => Boolean(col.slug))
      .map((col) => ({
        url: `${baseUrl}/collections/${col.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    const productRoutes: MetadataRoute.Sitemap = (productsRes.data || [])
      .filter((prod) => Boolean(prod.slug) && prod.status !== 'INACTIVE')
      .map((prod) => ({
        url: `${baseUrl}/product/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));

    // Dynamically include all PUBLISHED blog articles
    const blogData: any = blogRes.data || {};
    const blogPostsList = Array.isArray(blogData.posts) ? [...blogData.posts] : [];
    if (blogData.featured_post) {
      blogPostsList.push(blogData.featured_post);
    }

    const uniquePostsMap = new Map();
    blogPostsList.forEach((post) => {
      if (post.slug && !uniquePostsMap.has(post.slug)) {
        uniquePostsMap.set(post.slug, post);
      }
    });

    const blogRoutes: MetadataRoute.Sitemap = Array.from(uniquePostsMap.values()).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...productRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
