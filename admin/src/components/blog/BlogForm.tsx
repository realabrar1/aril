'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Globe,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Info,
  Link as LinkIcon,
  HelpCircle,
  Sparkles,
  FileText,
  Search,
  Tag as TagIcon,
  FolderTree,
  Share2,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { blogAdminService, BlogPost, BlogCategory, BlogTag } from '@/services/blogAdminService';
import { mediaService } from '@/services/mediaService';
import { productService } from '@/services/productService';

interface BlogFormProps {
  initialData?: Partial<BlogPost>;
  isEditing?: boolean;
}

export const BlogForm: React.FC<BlogFormProps> = ({ initialData, isEditing = false }) => {
  const router = useRouter();

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [postsList, setPostsList] = useState<BlogPost[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featured_image: initialData?.featured_image || '',
    featured_image_alt: initialData?.featured_image_alt || '',
    featured_image_caption: initialData?.featured_image_caption || '',
    category_id: initialData?.category_id || undefined,
    status: initialData?.status || 'DRAFT',
    is_featured: initialData?.is_featured || false,
    published_at: initialData?.published_at ? initialData.published_at.substring(0, 16) : '',
    seo_title: initialData?.seo_title || '',
    meta_description: initialData?.meta_description || '',
    focus_keyword: initialData?.focus_keyword || '',
    secondary_keywords: initialData?.secondary_keywords || [],
    canonical_url: initialData?.canonical_url || '',
    robots_index: initialData?.robots_index ?? true,
    robots_follow: initialData?.robots_follow ?? true,
    og_title: initialData?.og_title || '',
    og_description: initialData?.og_description || '',
    og_image: initialData?.og_image || '',
    twitter_title: initialData?.twitter_title || '',
    twitter_description: initialData?.twitter_description || '',
    twitter_image: initialData?.twitter_image || '',
  });

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialData?.tags?.map((t) => t.id) || []
  );

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialData?.faqs?.map((f) => ({ question: f.question, answer: f.answer })) || []
  );

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    initialData?.related_products?.map((p) => p.id) || []
  );

  const [selectedRelatedPostIds, setSelectedRelatedPostIds] = useState<number[]>(
    initialData?.related_posts?.map((p) => p.id) || []
  );

  const [secondaryKeywordInput, setSecondaryKeywordInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    try {
      const [catRes, tagRes, prodRes, postRes] = await Promise.all([
        blogAdminService.getCategories(),
        blogAdminService.getTags(),
        productService.getProducts(1),
        blogAdminService.getPosts({ status: 'PUBLISHED' }),
      ]);

      if (catRes.success) setCategories(catRes.data || []);
      if (tagRes.success) setTags(tagRes.data || []);
      if (prodRes.success) setProductsList(prodRes.data || []);
      if (postRes.success) setPostsList((postRes.data || []).filter((p) => p.id !== initialData?.id));
    } catch (err) {
      console.error('Failed to load blog metadata', err);
    }
  };

  // Slug Auto-generation
  const handleTitleChange = (val: string) => {
    const updated: Partial<BlogPost> = { title: val };
    if (!isEditing || !formData.slug) {
      updated.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await mediaService.uploadImage(file);
      const uploadedUrl = res.data?.url;
      if (res.success && uploadedUrl) {
        setFormData((prev) => ({ ...prev, featured_image: uploadedUrl }));
        setMessage({ type: 'success', text: 'Featured image uploaded successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSecondaryKeyword = () => {
    if (secondaryKeywordInput.trim()) {
      const kw = secondaryKeywordInput.trim();
      const currentKws = formData.secondary_keywords || [];
      if (!currentKws.includes(kw)) {
        setFormData((prev) => ({ ...prev, secondary_keywords: [...currentKws, kw] }));
      }
      setSecondaryKeywordInput('');
    }
  };

  const handleRemoveSecondaryKeyword = (kw: string) => {
    setFormData((prev) => ({
      ...prev,
      secondary_keywords: (prev.secondary_keywords || []).filter((k) => k !== kw),
    }));
  };

  const handleCreateNewTag = async () => {
    if (!newTagInput.trim()) return;
    try {
      const res = await blogAdminService.createTag({ name: newTagInput.trim() });
      if (res.success && res.data) {
        const newTag = res.data;
        setTags((prev) => [...prev, newTag]);
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        setNewTagInput('');
      }
    } catch {
      // Ignore
    }
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', val: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') => {
    if (!formData.title?.trim()) {
      setMessage({ type: 'error', text: 'Blog title is required.' });
      return;
    }

    if (!formData.content?.trim()) {
      setMessage({ type: 'error', text: 'Blog article content is required.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      status: targetStatus,
      tag_ids: selectedTagIds,
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      related_product_ids: selectedProductIds,
      related_post_ids: selectedRelatedPostIds,
    };

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await blogAdminService.updatePost(initialData.id, payload);
      } else {
        res = await blogAdminService.createPost(payload);
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: isEditing ? 'Blog post updated successfully!' : 'Blog post published successfully!',
        });
        setTimeout(() => {
          router.push('/dashboard/blog');
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to save blog post.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Computed SEO Checklist
  const currentSeoTitle = formData.seo_title || (formData.title ? `${formData.title} | Arilha` : '');
  const currentMetaDesc = formData.meta_description || (formData.excerpt ? formData.excerpt : '');
  const currentSlug = formData.slug || '';
  const wordCount = formData.content ? formData.content.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length : 0;
  const hasH2 = Boolean(formData.content && formData.content.includes('<h2'));

  const checklist = [
    { label: 'Blog title added', pass: Boolean(formData.title?.trim()) },
    { label: 'SEO Title configured', pass: Boolean(currentSeoTitle.trim()) },
    { label: 'Meta description added', pass: Boolean(currentMetaDesc.trim()) },
    { label: 'Clean, unique URL slug', pass: Boolean(currentSlug.trim()) },
    { label: 'Featured image added', pass: Boolean(formData.featured_image?.trim()), warn: !formData.featured_image },
    { label: 'Featured image Alt text added', pass: Boolean(formData.featured_image_alt?.trim()), warn: Boolean(formData.featured_image && !formData.featured_image_alt) },
    { label: 'Primary topic / focus keyword set', pass: Boolean(formData.focus_keyword?.trim()) },
    { label: 'Category assigned', pass: Boolean(formData.category_id) },
    { label: 'Substantial article length (>300 words)', pass: wordCount >= 300, warn: wordCount > 0 && wordCount < 300 },
    { label: 'Structured headings (H2/H3)', pass: hasH2, warn: !hasH2 },
    { label: 'Related internal products linked', pass: selectedProductIds.length > 0 },
    { label: 'Canonical URL generated', pass: true },
    { label: 'Article JSON-LD Schema ready', pass: true },
    { label: 'Sitemap inclusion ready', pass: true },
    { label: 'RSS Feed inclusion ready', pass: true },
  ];

  const passedCount = checklist.filter((c) => c.pass).length;
  const totalCount = checklist.length;
  const scorePercent = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 font-serif">
            {isEditing ? 'Edit Blog Article' : 'Create New Blog Article'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Craft SEO-first jewellery styling guides, care tips, and heritage stories for Arilha.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2 text-neutral-600" />
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSaving}
            className="bg-[#B38548] hover:bg-[#966C32] text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            {isSaving ? 'Publishing...' : 'Publish Article'}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editor Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION A: BASIC INFORMATION */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#B38548]" />
              <span>Section A — Basic Article Information</span>
            </h2>

            <div className="space-y-5">
              {/* Title Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Main Blog Title *
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {formData.title?.length || 0} chars (Recommended: 50–60 chars)
                  </span>
                </div>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to Care for Gold-Plated Jewellery & Prevent Tarnishing"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Write a clear and descriptive title that accurately explains what the article is about.
                </p>
              </div>

              {/* URL Slug Field */}
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-400 font-mono select-none">
                    arilha.com/blog/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      }))
                    }
                    placeholder="how-to-care-for-gold-plated-jewellery"
                    className="font-mono text-xs"
                  />
                </div>
                {isEditing && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    Changing a published URL slug will automatically create a 301 301 Permanent Redirect rule from old URL to new URL.
                  </p>
                )}
              </div>

              {/* Short Description / Excerpt */}
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Short Description / Excerpt *
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Write a concise summary explaining what the reader will learn from this article."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30 focus:border-[#B38548]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Write for people first. Do not keyword stuff.
                </p>
              </div>
            </div>
          </Card>

          {/* SECTION E: ARTICLE CONTENT */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B38548]" />
              <span>Section E — Article Content & Editor</span>
            </h2>

            {/* Optional Content Framework Guide */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 mb-5 text-xs text-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#B38548]">
                <Info className="w-4 h-4" />
                <span>Editorial Quality & Structure Guidance:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                <li><strong>Introduction:</strong> Explain what the article is about and what the reader will learn.</li>
                <li><strong>Main Sections (H2):</strong> What is [Topic]?, Why does [Problem] happen?, How to [Solve Problem].</li>
                <li><strong>Subheadings (H3):</strong> Detailed steps and tips.</li>
                <li><strong>Editorial Rule:</strong> Write for people first. Do not make unsupported claims or fake statistics.</li>
              </ul>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                Article Body Content (HTML / Rich Text) *
              </label>
              <textarea
                rows={16}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write or paste your article content here in rich text / HTML (supports <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>, etc.)..."
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30 focus:border-[#B38548] leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-1">
                <span>Supports H2, H3, lists, blockquotes, bold, italic.</span>
                <span>Total Words: <strong>{wordCount}</strong></span>
              </div>
            </div>
          </Card>

          {/* SECTION B & C: SEO SETTINGS & GOOGLE PREVIEW */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-5 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#B38548]" />
              <span>Section B &amp; C — SEO Settings &amp; Google Search Preview</span>
            </h2>

            <div className="space-y-6">
              {/* SECTION C: GOOGLE SEARCH PREVIEW */}
              <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                  Google Search Result Live Preview
                </span>
                <div className="space-y-1">
                  <div className="text-xs text-[#202124] font-sans truncate flex items-center gap-1">
                    <span>https://arilha.com</span>
                    <span className="text-neutral-400">›</span>
                    <span>blog</span>
                    <span className="text-neutral-400">›</span>
                    <span className="text-neutral-600 font-medium">{currentSlug || 'article-slug'}</span>
                  </div>
                  <h3 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                    {currentSeoTitle}
                  </h3>
                  <p className="text-xs text-[#4d5156] line-clamp-2 leading-normal">
                    {currentMetaDesc || 'Provide a compelling meta description summarizing what readers will discover in this guide.'}
                  </p>
                </div>

                {/* Inline Preview Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-neutral-200/80 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${currentSeoTitle.length >= 40 && currentSeoTitle.length <= 65 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {currentSeoTitle.length >= 40 && currentSeoTitle.length <= 65 ? '✓ Title Length Optimal' : '⚠ Title Length: ' + currentSeoTitle.length + ' chars'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${currentMetaDesc.length >= 120 && currentMetaDesc.length <= 165 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {currentMetaDesc.length >= 120 && currentMetaDesc.length <= 165 ? '✓ Meta Desc Optimal' : '⚠ Meta Desc Length: ' + currentMetaDesc.length + ' chars'}
                  </span>
                </div>
              </div>

              {/* SEO Title Override */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    SEO Title (Meta Title)
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {currentSeoTitle.length} chars (Target: 50–60)
                  </span>
                </div>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                  placeholder={formData.title ? `${formData.title} | Arilha` : 'SEO Title'}
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Meta Description
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {currentMetaDesc.length} chars (Target: 140–160)
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Discover how to care for gold-plated jewellery, prevent tarnishing and keep your favourite pieces looking beautiful for longer."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30 focus:border-[#B38548]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Note: Google dynamically selects search snippets based on user queries.
                </p>
              </div>

              {/* Primary & Secondary Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    Primary Search Topic / Focus Keyword
                  </label>
                  <Input
                    value={formData.focus_keyword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, focus_keyword: e.target.value }))}
                    placeholder="e.g. gold plated jewellery care"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    Secondary Topics / Phrases
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={secondaryKeywordInput}
                      onChange={(e) => setSecondaryKeywordInput(e.target.value)}
                      placeholder="e.g. prevent anti-tarnish wear"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSecondaryKeyword();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSecondaryKeyword} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(formData.secondary_keywords || []).map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center space-x-1 bg-neutral-100 text-neutral-800 text-[11px] px-2.5 py-1 rounded-md border border-neutral-200"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryKeyword(kw)}
                          className="hover:text-rose-600 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#B38548] shrink-0" />
                <span>
                  <strong>Editorial Note:</strong> Use related phrases naturally. Write for people first rather than repeating keywords.
                </span>
              </div>
            </div>
          </Card>

          {/* SECTION F: FAQ BUILDER */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B38548]" />
                <span>FAQ Builder (Structured Data FAQPage)</span>
              </h2>
              <Button type="button" onClick={handleAddFaq} size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add FAQ
              </Button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4 italic">
                No FAQs added yet. Add FAQs to automatically generate Google FAQPage JSON-LD structured data.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#B38548] uppercase tracking-wider">
                        FAQ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-neutral-400 hover:text-rose-600 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <Input
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                        placeholder="Question (e.g. Can gold-plated jewellery be worn in water?)"
                        className="text-xs font-bold"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                        placeholder="Detailed, helpful answer..."
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SECTION F: INTERNAL LINKING */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#B38548]" />
              <span>Section F — Internal Linking (Related Products &amp; Articles)</span>
            </h2>

            <div className="space-y-5">
              {/* Related Products Picker */}
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-2">
                  Select Related Arilha Products
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-xl">
                  {productsList.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() =>
                          setSelectedProductIds((prev) =>
                            isSelected ? prev.filter((id) => id !== prod.id) : [...prev, prod.id]
                          )
                        }
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#B38548] bg-amber-50/60 text-[#B38548] font-bold'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                        }`}
                      >
                        <span className="truncate">{prod.name}</span>
                        <span className="font-mono text-[11px]">₹{prod.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Related Blog Posts Picker */}
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-2">
                  Select Related Blog Articles
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-xl">
                  {postsList.map((p) => {
                    const isSelected = selectedRelatedPostIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          setSelectedRelatedPostIds((prev) =>
                            isSelected ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          )
                        }
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#B38548] bg-amber-50/60 text-[#B38548] font-bold'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                        }`}
                      >
                        <span className="truncate">{p.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Column (1 Col) */}
        <div className="space-y-8">
          
          {/* SECTION D: FEATURED IMAGE */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#B38548]" />
              <span>Featured Image</span>
            </h2>

            <div className="space-y-4">
              {formData.featured_image ? (
                <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-neutral-200 group">
                  <img src={formData.featured_image} alt="Featured" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-[#B38548] transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-600 font-medium">Upload Hero Featured Image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="featured-image-file"
                  />
                  <label
                    htmlFor="featured-image-file"
                    className="inline-block mt-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#B38548]"
                  >
                    {isUploading ? 'Uploading...' : 'Browse File'}
                  </label>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Image Alt Text *
                </label>
                <Input
                  value={formData.featured_image_alt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_alt: e.target.value }))}
                  placeholder="Describe what is actually visible in the image"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Describe what is actually visible. Do not fill alt text with keywords.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Image Caption
                </label>
                <Input
                  value={formData.featured_image_caption}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_caption: e.target.value }))}
                  placeholder="Optional image caption text"
                />
              </div>
            </div>
          </Card>

          {/* SECTION H: CATEGORY & TAGS */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#B38548]" />
              <span>Category &amp; Tags</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30"
                >
                  <option value="">Select Blog Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 max-h-36 overflow-y-auto p-2 border border-neutral-200 rounded-xl">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() =>
                          setSelectedTagIds((prev) =>
                            isSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }
                        className={`text-[11px] px-2.5 py-1 rounded-full transition-colors border ${
                          isSelected
                            ? 'bg-[#B38548] text-white border-[#B38548] font-bold'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Create new tag..."
                    className="text-xs"
                  />
                  <Button type="button" onClick={handleCreateNewTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION I: SOCIAL SEO (OPEN GRAPH & TWITTER) */}
          <Card className="p-6">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#B38548]" />
              <span>Social SEO (OpenGraph &amp; Twitter)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  OG Title (Facebook &amp; WhatsApp)
                </label>
                <Input
                  value={formData.og_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, og_title: e.target.value }))}
                  placeholder={currentSeoTitle}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  OG Description
                </label>
                <textarea
                  rows={2}
                  value={formData.og_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, og_description: e.target.value }))}
                  placeholder={currentMetaDesc}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* SECTION K: SEO & CONTENT READINESS CHECKLIST */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B38548]" />
                <span>SEO &amp; Content Readiness</span>
              </h2>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#B38548]">
                {scorePercent}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-neutral-100 last:border-0">
                  <span className={item.pass ? 'text-neutral-700' : 'text-neutral-400'}>
                    {item.label}
                  </span>
                  {item.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : item.warn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <span className="text-neutral-300 font-mono text-[10px]">Pending</span>
                  )}
                </div>
              ))}
            </div>

            {/* Google Discover Note */}
            <div className="mt-5 p-3 rounded-xl bg-neutral-900 text-white text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Google Discover &amp; Crawling Note:</span>
              </div>
              <p className="text-neutral-300">
                Publishing an article makes it technically available for crawling and eligible for search/discovery systems. Search engines independently decide whether, when and where content appears.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
