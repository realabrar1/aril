import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect, RedirectType } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  Share2,
  Tag,
  BookOpen,
} from 'lucide-react';
import { blogService, PublicBlogPost } from '@/services/blogService';
import { JsonLd } from '@/components/ui/JsonLd';

export const revalidate = 60; // ISR every 60s

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate Dynamic SEO Metadata for Blog Article
 */
export async function generateMetadata({ params }: SingleBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await blogService.getPostBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: 'Article Not Found | ARILHA Blog',
      description: 'The requested blog post could not be found.',
    };
  }

  const post: PublicBlogPost = res.data;
  const seoTitle = post.seo_title || `${post.title} | ARILHA`;
  const metaDesc = post.meta_description || post.excerpt;
  const canonicalUrl = post.canonical_url || `https://arilha.com/blog/${post.slug}`;

  const ogTitle = post.og_title || seoTitle;
  const ogDesc = post.og_description || metaDesc;
  const ogImg = post.og_image || post.featured_image || 'https://arilha.com/logo.png';

  const twTitle = post.twitter_title || ogTitle;
  const twDesc = post.twitter_description || ogDesc;
  const twImg = post.twitter_image || ogImg;

  return {
    title: seoTitle,
    description: metaDesc,
    metadataBase: new URL('https://arilha.com'),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: post.robots_index !== false,
      follow: post.robots_follow !== false,
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: canonicalUrl,
      siteName: 'ARILHA',
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author?.name || 'ARILHA Editorial Team'],
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: post.featured_image_alt || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: twTitle,
      description: twDesc,
      images: [twImg],
    },
  };
}

export default async function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = await params;
  const res = await blogService.getPostBySlug(slug);

  // Handle 301 Redirect if slug was updated in admin
  if (res.is_redirect && res.redirect_url) {
    redirect(res.redirect_url, RedirectType.replace);
  }

  if (!res.success || !res.data) {
    notFound();
  }

  const post: PublicBlogPost = res.data;
  const canonicalUrl = post.canonical_url || `https://arilha.com/blog/${post.slug}`;

  // Structured Data (JSON-LD) for BlogPosting
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image ? [post.featured_image] : ['https://arilha.com/logo.png'],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: post.author?.name || 'ARILHA Editorial Team',
      url: 'https://arilha.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ARILHA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://arilha.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  // Breadcrumbs JSON-LD
  const breadcrumbsData = [
    { name: 'Home', item: 'https://arilha.com' },
    { name: 'Blog', item: 'https://arilha.com/blog' },
    ...(post.category ? [{ name: post.category.name, item: `https://arilha.com/blog?category=${post.category.slug}` }] : []),
    { name: post.title, item: canonicalUrl },
  ];

  return (
    <article className="bg-[#FDFBF7] min-h-screen py-6 sm:py-10 px-4 sm:px-6 font-sans text-neutral-900">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <JsonLd type="BreadcrumbList" breadcrumbs={breadcrumbsData} />
      {post.faqs && post.faqs.length > 0 && (
        <JsonLd
          type="FAQPage"
          faqs={post.faqs.map((f) => ({ q: f.question, a: f.answer }))}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 flex items-center flex-wrap gap-1.5 border-b border-[#EFE6D8] pb-4">
          <Link href="/" className="hover:text-[#B38548] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/blog" className="hover:text-[#B38548] transition-colors">Blog</Link>
          {post.category && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-[#B38548] transition-colors">
                {post.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-800 font-medium truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-6">
          {post.category && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F5EBE0] border border-[#E8DEC8] rounded-full text-xs font-bold text-[#B38548] uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>{post.category.name}</span>
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-neutral-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Author, Date, Reading Time Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#EFE6D8] text-xs text-neutral-600">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B38548] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {post.author?.name ? post.author.name.charAt(0) : 'A'}
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 block">{post.author?.name || 'ARILHA Editorial Team'}</span>
                  <span className="text-[10px] text-neutral-500">Author &amp; Style Specialist</span>
                </div>
              </div>

              <span className="text-neutral-300 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  Published{' '}
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : new Date(post.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </span>
              </div>

              <span className="text-neutral-300 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{post.reading_time || 3} min read</span>
              </div>
            </div>

            {post.updated_at && (
              <span className="text-[11px] text-neutral-400 italic">
                Updated{' '}
                {new Date(post.updated_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <figure className="space-y-2">
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-neutral-100 border border-[#EFE6D8] shadow-xs">
              <Image
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
            {post.featured_image_caption && (
              <figcaption className="text-center text-xs text-neutral-500 italic">
                {post.featured_image_caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Excerpt Lead Paragraph */}
        {post.excerpt && (
          <div className="bg-[#FAF6F0] border-l-4 border-[#B38548] p-5 sm:p-6 rounded-r-2xl text-neutral-800 text-sm sm:text-base leading-relaxed font-serif italic">
            "{post.excerpt}"
          </div>
        )}

        {/* Article Body Content */}
        <section className="bg-white p-6 sm:p-10 rounded-2xl border border-[#EFE6D8] shadow-xs space-y-6">
          <div
            className="blog-article-content text-neutral-800 leading-relaxed space-y-5 text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Inline CSS styling for rich text tags inside blog content */}
          <style>{`
            .blog-article-content h2 {
              font-family: var(--font-serif), Georgia, serif;
              font-size: 1.625rem;
              font-weight: 500;
              color: #171717;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
              padding-bottom: 0.35rem;
              border-bottom: 1px solid #EFE6D8;
            }
            .blog-article-content h3 {
              font-family: var(--font-serif), Georgia, serif;
              font-size: 1.25rem;
              font-weight: 500;
              color: #262626;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
            }
            .blog-article-content p {
              margin-bottom: 1.25rem;
              line-height: 1.75;
              color: #404040;
            }
            .blog-article-content ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin-bottom: 1.25rem;
              space-y: 0.5rem;
            }
            .blog-article-content ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin-bottom: 1.25rem;
              space-y: 0.5rem;
            }
            .blog-article-content li {
              margin-bottom: 0.35rem;
              color: #404040;
            }
            .blog-article-content blockquote {
              border-left: 3px solid #B38548;
              background-color: #FAF6F0;
              padding: 1rem 1.25rem;
              margin: 1.5rem 0;
              font-style: italic;
              border-radius: 0 0.75rem 0.75rem 0;
            }
            .blog-article-content a {
              color: #B38548;
              text-decoration: underline;
              font-weight: 600;
              transition: color 0.2s;
            }
            .blog-article-content a:hover {
              color: #966C32;
            }
            .blog-article-content img {
              max-width: 100%;
              height: auto;
              border-radius: 0.75rem;
              margin: 1.5rem auto;
            }
            .blog-article-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
              font-size: 0.875rem;
            }
            .blog-article-content th, .blog-article-content td {
              border: 1px solid #E8DEC8;
              padding: 0.75rem;
              text-align: left;
            }
            .blog-article-content th {
              background-color: #FAF6F0;
              font-weight: 600;
            }
          `}</style>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-neutral-100 flex items-center flex-wrap gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-2">
                Tags:
              </span>
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1 bg-neutral-100 hover:bg-[#F5EBE0] text-neutral-700 text-xs rounded-full border border-neutral-200 transition-colors"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* FAQ ACCORDION SECTION */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EFE6D8] space-y-6">
            <div className="flex items-center gap-2 text-[#B38548]">
              <HelpCircle className="w-5 h-5" />
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {post.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-[#FAF6F0] rounded-xl p-4 border border-[#E8DEC8] transition-all cursor-pointer"
                >
                  <summary className="font-serif font-medium text-sm sm:text-base text-neutral-900 flex justify-between items-center list-none">
                    <span>{faq.question}</span>
                    <span className="text-[#B38548] font-bold text-lg group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-[#E8DEC8]/60 pt-3">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* RELATED PRODUCTS SECTION */}
        {post.related_products && post.related_products.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#B38548]" />
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-900">
                  Featured Jewellery Mentioned in Article
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-semibold text-[#B38548] hover:underline">
                Explore Store →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {post.related_products.map((prod: any) => {
                const primaryImage = prod.images?.[0]?.image_url || '/placeholder-product.jpg';
                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#EFE6D8] rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <Link href={`/product/${prod.slug}`} className="relative aspect-square bg-neutral-100 block">
                      <Image
                        src={primaryImage}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:text-[#B38548] transition-colors">
                          <Link href={`/product/${prod.slug}`}>{prod.name}</Link>
                        </h3>
                        <p className="text-xs font-bold text-[#B38548] mt-1">
                          ₹{prod.price ? Number(prod.price).toLocaleString('en-IN') : '1,499'}
                        </p>
                      </div>

                      <Link
                        href={`/product/${prod.slug}`}
                        className="w-full py-1.5 bg-[#FAF6F0] hover:bg-[#B38548] hover:text-white border border-[#E8DEC8] text-neutral-800 text-[11px] font-semibold rounded-lg text-center transition-colors block"
                      >
                        View Jewellery
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RELATED BLOG ARTICLES */}
        {post.related_posts && post.related_posts.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-[#EFE6D8]">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-900">
              Recommended Journal Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {post.related_posts.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white border border-[#EFE6D8] rounded-xl p-4 flex gap-4 hover:shadow-md transition-all group"
                >
                  {rel.featured_image && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                      <Image
                        src={rel.featured_image}
                        alt={rel.title}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    {rel.category && (
                      <span className="text-[10px] font-bold text-[#B38548] uppercase tracking-wider">
                        {rel.category.name}
                      </span>
                    )}
                    <h3 className="font-serif text-sm font-medium text-neutral-900 group-hover:text-[#B38548] transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {rel.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ARILHA BRAND PROMO CTA */}
        <section className="bg-gradient-to-r from-[#FAF4EB] to-[#F5EBE0] border border-[#E8DEC8] rounded-2xl p-8 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[#B38548] mx-auto" />
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium">
            Explore Handcrafted Jewellery by ARILHA
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            From anti-tarnish daily wear to statement Kundan sets, discover modern Indian pieces designed for every version of you.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B38548] hover:bg-[#966C32] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Shop All Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </article>
  );
}
