import { redirect } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // No individual project pages yet
  return [];
}

/**
 * Project detail placeholder.
 * Redirects to /work until individual project pages are built.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  // Await params per Next.js App Router requirement
  await params;
  redirect('/work');
}
