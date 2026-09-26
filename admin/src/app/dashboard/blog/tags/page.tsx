'use client';

import React, { useEffect, useState } from 'react';
import { Tag as TagIcon, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { blogAdminService, BlogTag } from '@/services/blogAdminService';

export default function BlogTagsAdminPage() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const res = await blogAdminService.getTags();
      if (res.success && res.data) {
        setTags(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await blogAdminService.createTag({ name: name.trim() });
      if (res.success && res.data) {
        const newTag = res.data;
        setTags((prev) => [...prev, newTag]);
        setName('');
        setMessage({ type: 'success', text: 'Tag created successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create tag.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <h1 className="text-2xl font-bold text-neutral-900 font-serif flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-[#B38548]" />
          <span>Blog Tags Manager</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage relational blog tags for fine-grained topic indexing and cross-linking.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">
            Add New Tag
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                Tag Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anti Tarnish Jewellery"
                required
              />
            </div>

            <Button type="submit" disabled={isSaving} className="bg-[#B38548] hover:bg-[#966C32] text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              {isSaving ? 'Creating...' : 'Create Tag'}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-4 mb-4">
            All Relational Tags ({tags.length})
          </h2>

          {isLoading ? (
            <p className="text-xs text-neutral-400 py-8 text-center">Loading tags...</p>
          ) : tags.length === 0 ? (
            <p className="text-xs text-neutral-400 py-8 text-center">No tags created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 flex items-center space-x-2"
                >
                  <TagIcon className="w-3 h-3 text-[#B38548]" />
                  <span>{tag.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({tag.posts_count || 0})</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
