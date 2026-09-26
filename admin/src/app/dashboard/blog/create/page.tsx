'use client';

import React from 'react';
import { BlogForm } from '@/components/blog/BlogForm';

export default function CreateBlogPostPage() {
  return <BlogForm isEditing={false} />;
}
