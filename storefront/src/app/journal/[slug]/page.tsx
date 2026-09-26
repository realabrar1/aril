import { redirect, RedirectType } from 'next/navigation';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function JournalDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  redirect(`/blog/${slug}`, RedirectType.replace);
}
