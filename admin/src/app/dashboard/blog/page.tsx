'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Globe,
  FileText,
  Search,
  FolderTree,
  Tag as TagIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { blogAdminService, BlogPost } from '@/services/blogAdminService';

export default function BlogAdminListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPosts();
  }, [search, selectedStatus]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await blogAdminService.getPosts({
        search: search || undefined,
        status: selectedStatus || undefined,
      });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the blog post "${title}"?`)) return;

    try {
      const res = await blogAdminService.deletePost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: 'success', text: 'Blog post deleted successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete blog post.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-serif flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#B38548]" />
            <span>SEO Blog CMS Manager</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create, edit, and publish SEO-first jewellery guides, Kundan heritage articles, and anti-tarnish care tips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/blog/categories">
            <Button variant="outline" size="sm">
              <FolderTree className="w-4 h-4 mr-1.5" />
              Categories
            </Button>
          </Link>
          <Link href="/dashboard/blog/tags">
            <Button variant="outline" size="sm">
              <TagIcon className="w-4 h-4 mr-1.5" />
              Tags
            </Button>
          </Link>
          <Link href="/dashboard/blog/create">
            <Button className="bg-[#B38548] hover:bg-[#966C32] text-white" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Article
            </Button>
          </Link>
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

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blog articles by title, excerpt or keyword..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B38548]/30"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Blog Posts Data Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4">SEO Readiness</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Loading blog posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No blog posts found matching your criteria.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const isSeoReady = Boolean(post.seo_title && post.meta_description && post.featured_image);
                  return (
                    <tr key={post.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Title & Featured Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3 max-w-md">
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                            {post.featured_image ? (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-neutral-900 line-clamp-1">{post.title}</h3>
                              {post.is_featured && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono block mt-0.5 truncate">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                          {post.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 font-medium text-neutral-700">
                        {post.author?.name || 'Admin'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : post.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {post.status === 'PUBLISHED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{post.status}</span>
                        </span>
                      </td>

                      {/* Published Date */}
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* SEO Readiness */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isSeoReady ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isSeoReady ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ready</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Needs Info</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <a
                          href={`https://arilha.com/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Preview Article"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/dashboard/blog/edit/${post.id}`}
                          className="inline-block p-1.5 text-neutral-400 hover:text-[#B38548] rounded-lg hover:bg-amber-50 transition-colors"
                          title="Edit Article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
