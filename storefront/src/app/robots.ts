import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart/', '/checkout/', '/search', '/login/', '/register/', '/wishlist/', '/auth/'],
    },
    sitemap: 'https://arilha.com/sitemap.xml',
  };
}
