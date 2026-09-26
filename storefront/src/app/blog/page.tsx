import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Search, Tag, Sparkles, BookOpen } from 'lucide-react';
import { blogService, PublicBlogPost, BlogPostCategory } from '@/services/blogService';

export const revalidate = 60; // SSR with ISR every 60s

export const metadata: Metadata = {
  title: 'Blog & Jewellery Journal | ARILHA by Irsa Khan',
  description: 'Explore expert styling guides, gold-plated jewellery care tips, Kundan heritage insights, and modern Indian fashion trends from ARILHA by Irsa Khan.',
  metadataBase: new URL('https://arilha.com'),
  alternates: {
    canonical: 'https://arilha.com/blog',
    types: {
      'application/rss+xml': [
        {
          url: 'https://arilha.com/blog/feed.xml',
          title: 'ARILHA Blog Feed',
        },
      ],
    },
  },
  openGraph: {
    title: 'ARILHA Jewellery Blog & Journal',
    description: 'Expert styling guides, gold-plated jewellery care tips, and Kundan heritage insights from ARILHA by Irsa Khan.',
    url: 'https://arilha.com/blog',
    siteName: 'ARILHA',
    type: 'website',
    images: [
      {
        url: 'https://arilha.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'ARILHA Jewellery Blog',
      },
    ],
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || '';
  const currentSearch = resolvedParams.search || '';
  const currentPage = parseInt(resolvedParams.page || '1', 10);

  // Fetch posts and categories
  const [postsRes, categoriesRes] = await Promise.all([
    blogService.getPosts({
      category: currentCategory,
      search: currentSearch,
      page: currentPage,
    }),
    blogService.getCategories(),
  ]);

  const featuredPost: PublicBlogPost | null = postsRes.data?.featured_post || null;
  const posts: PublicBlogPost[] = postsRes.data?.posts || [];
  const categories: BlogPostCategory[] = categoriesRes.data || [];
  const meta = postsRes.meta || { current_page: 1, last_page: 1, total: 0 };

  // Filter out featured post from general grid if present to avoid duplication
  const gridPosts = featuredPost && !currentSearch && !currentCategory && currentPage === 1
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-8 sm:py-12 px-4 sm:px-6 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        
        {/* Header Banner */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5EBE0] border border-[#E8DEC8] rounded-full text-xs font-semibold text-[#B38548] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ARILHA JOURNAL</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-neutral-900 tracking-tight leading-tight">
            Stories, Styling &amp; Jewellery Care
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
            Discover expert guides on caring for gold-plated jewellery, styling Kundan pieces, understanding Indian heritage craftsmanship, and elevating your everyday wardrobe.
          </p>
        </header>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-y border-[#EFE6D8] py-4">
          {/* Categories Pill List */}
          <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none" aria-label="Blog categories">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !currentCategory
                  ? 'bg-[#B38548] text-white shadow-xs'
                  : 'bg-white border border-[#E8DEC8] text-neutral-700 hover:border-[#B38548] hover:text-[#B38548]'
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-[#B38548] text-white shadow-xs'
                    : 'bg-white border border-[#E8DEC8] text-neutral-700 hover:border-[#B38548] hover:text-[#B38548]'
                }`}
              >
                {cat.name} {cat.posts_count ? `(${cat.posts_count})` : ''}
              </Link>
            ))}
          </nav>

          {/* Search Form */}
          <form method="GET" action="/blog" className="w-full md:w-72 relative shrink-0">
            {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
            <input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8DEC8] rounded-full text-xs focus:outline-hidden focus:border-[#B38548] transition-colors"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* FEATURED POST BANNER (Only on page 1 with no filters) */}
        {featuredPost && !currentSearch && !currentCategory && currentPage === 1 && (
          <section className="bg-white border border-[#EFE6D8] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[400px] bg-neutral-100">
              <Image
                src={featuredPost.featured_image || '/placeholder-blog.jpg'}
                alt={featuredPost.featured_image_alt || featuredPost.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-[#B38548] text-white px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                Featured Article
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  {featuredPost.category && (
                    <span className="font-semibold text-[#B38548] uppercase tracking-wider">
                      {featuredPost.category.name}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {featuredPost.reading_time || 3} min read
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-neutral-900 leading-snug hover:text-[#B38548] transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {featuredPost.published_at
                      ? new Date(featuredPost.published_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently Published'}
                  </span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B38548] hover:text-[#966C32] group transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* LATEST POSTS GRID */}
        {gridPosts.length > 0 ? (
          <section className="space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-900 border-b border-[#EFE6D8] pb-3">
              {currentCategory
                ? `Articles in ${categories.find((c) => c.slug === currentCategory)?.name || currentCategory}`
                : currentSearch
                ? `Search Results for "${currentSearch}"`
                : 'Latest Articles'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-[#EFE6D8] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  <Link href={`/blog/${post.slug}`} className="relative h-52 bg-neutral-100 block overflow-hidden">
                    <Image
                      src={post.featured_image || '/placeholder-blog.jpg'}
                      alt={post.featured_image_alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#B38548] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#E8DEC8]">
                        {post.category.name}
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {post.reading_time || 3} min read
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-medium text-neutral-900 group-hover:text-[#B38548] transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500">
                        By {post.author?.name || 'ARILHA Editorial'}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-[#B38548] group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => {
                  const queryParams = new URLSearchParams();
                  if (currentCategory) queryParams.set('category', currentCategory);
                  if (currentSearch) queryParams.set('search', currentSearch);
                  queryParams.set('page', p.toString());

                  return (
                    <Link
                      key={p}
                      href={`/blog?${queryParams.toString()}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        p === meta.current_page
                          ? 'bg-[#B38548] text-white shadow-xs'
                          : 'bg-white border border-[#E8DEC8] text-neutral-700 hover:border-[#B38548]'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EFE6D8] p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="font-serif text-xl text-neutral-800">No blog articles found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              We couldn't find any articles matching your search or category filter. Try clearing your search or browsing all articles.
            </p>
            <Link
              href="/blog"
              className="inline-block px-5 py-2.5 bg-[#B38548] text-white text-xs font-semibold rounded-lg hover:bg-[#966C32] transition-colors"
            >
              View All Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
