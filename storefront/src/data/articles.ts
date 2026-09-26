export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      text: string;
    }[];
    conclusion: string;
  };
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'statement-jewellery-guide-1',
    slug: 'how-to-style-statement-jewellery-for-everyday-wear',
    title: 'How to Style Statement Jewellery for Everyday Wear - ARILHA Guide',
    excerpt: 'Discover effortless ways to style gold-plated earrings, jhumkas, and layered chains with everyday outfits for modern elegance.',
    category: 'Jewellery Styling',
    readTime: '5 min read',
    datePublished: '2026-09-01',
    authorName: 'ARILHA Editorial Team',
    image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'At ARILHA, we believe jewellery should not live inside a jewellery box. It should be worn, styled, gifted, loved, and made part of your everyday moments.',
      sections: [
        {
          heading: '1. Everyday Outfits: Minimalist Hoops & Layered Chains',
          text: 'Pair anti-tarnish gold hoops or a subtle pendant chain with crisp white shirts or casual tops. The key is minimal effort with maximum polish.',
        },
        {
          heading: '2. Celebrations & Occasions: Handcrafted Jhumkas & Kundan Sets',
          text: 'For festive gatherings, sangeet functions, and family dinners, elevate traditional drapes with handcrafted Kundan chokers or pearl drop jhumkas.',
        },
        {
          heading: '3. Stacking & Layering: Cuffs & Ring Sets',
          text: 'Mix textured bangles with sleek cuff bracelets or stack delicate rose gold rings to create a personalized signature look.',
        },
      ],
      conclusion: 'Wearing jewellery your way is the essence of ARILHA by Irsa Khan.',
    },
  },
  {
    id: 'anti-tarnish-care-2',
    slug: 'understanding-gold-plated-and-anti-tarnish-jewellery-care',
    title: 'Gold-Plated & Anti-Tarnish Jewellery Care Guide',
    excerpt: 'Learn practical tips to keep your gold-plated and anti-tarnish jewellery looking radiant and scratch-free for years.',
    category: 'Jewellery Care',
    readTime: '4 min read',
    datePublished: '2026-09-03',
    authorName: 'ARILHA Editorial Team',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'Proper care ensures that your favorite ARILHA jewellery retains its original luster and finish.',
      sections: [
        {
          heading: '1. Store Pieces Separately',
          text: 'Store individual earrings, chains, and rings in separate dry pouches or lined compartments to avoid tangling and surface friction.',
        },
        {
          heading: '2. Apply Perfumes Before Wearing Jewellery',
          text: 'Always apply perfumes, hairsprays, and lotions before putting on your jewellery. Avoid direct contact with harsh chemical cleansers.',
        },
        {
          heading: '3. Gentle Wipe After Daily Use',
          text: 'After a long day, wipe your jewellery gently with a soft, dry cotton or microfiber cloth to remove skin oils before storing.',
        },
      ],
      conclusion: 'Simple daily habits keep your gold-plated pieces shining brightly.',
    },
  },
  {
    id: 'kundan-vs-everyday-3',
    slug: 'traditional-kundan-vs-modern-everyday-jewellery',
    title: 'Traditional Kundan vs Modern Everyday Jewellery: Styling Guide by Irsa Khan',
    excerpt: 'Explore how to balance heritage Kundan craftsmanship with contemporary everyday jewellery essentials for a versatile wardrobe.',
    category: 'Brand Story',
    readTime: '6 min read',
    datePublished: '2026-09-05',
    authorName: 'Irsa Khan',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'ARILHA brings together Indian-inspired beauty, contemporary fashion, and jewellery designed to be worn beyond special occasions.',
      sections: [
        {
          heading: '1. The Grace of Kundan & Heritage Pieces',
          text: 'Kundan chokers and intricate bridal sets bring regal Indian artistry into wedding celebrations and grand festive moments.',
        },
        {
          heading: '2. The Freedom of Anti-Tarnish Everyday Wear',
          text: 'Sleek geometric earrings and durable gold-plated chains move effortlessly between work, coffee meetings, and evening gatherings.',
        },
        {
          heading: '3. Styled by Irsa Khan',
          text: 'Created by Irsa and made for you — blend a subtle Kundan pendant with a modern blazer for a striking fusion aesthetic.',
        },
      ],
      conclusion: 'Discover your style, express your confidence, and embrace every version of you with ARILHA.',
    },
  },
];
