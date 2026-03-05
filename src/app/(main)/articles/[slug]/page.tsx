import { redirect } from 'next/navigation';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // No articles published yet
  return [];
}

/**
 * Article detail placeholder.
 * Redirects to /articles until individual articles are published.
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  // Await params per Next.js App Router requirement
  await params;
  redirect('/articles');
}
