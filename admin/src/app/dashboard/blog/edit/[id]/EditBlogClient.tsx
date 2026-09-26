'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BlogForm } from '@/components/blog/BlogForm';
import { blogAdminService, BlogPost } from '@/services/blogAdminService';

export default function EditBlogClient() {
  const params = useParams();
  const id = Number(params?.id);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      blogAdminService
        .getPost(id)
        .then((res) => {
          if (res.success && res.data) {
            setPost(res.data);
          } else {
            setError('Blog post not found.');
          }
          setIsLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch blog post details.');
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-neutral-400">Loading blog article editor...</div>;
  }

  if (error || !post) {
    return <div className="py-20 text-center text-sm text-rose-600 font-bold">{error || 'Article not found.'}</div>;
  }

  return <BlogForm initialData={post} isEditing={true} />;
}
