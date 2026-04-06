import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api';
import DocClient from './DocClient';
import { notFound } from 'next/navigation';

interface DocData {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

async function getDoc(slug: string): Promise<DocData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/docs/${slug}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data;
  } catch (e) {
    console.error('Failed to fetch doc:', e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc(slug);
  
  if (!doc) {
    return {
      title: '文档未找到 - ZMSL',
    };
  }

  // Create a description from the content (first 150 chars, removing markdown)
  const description = doc.content
    ? doc.content.replace(/[#*`\[\]()]/g, '').substring(0, 150).trim() + '...'
    : `ZMSL文档: ${doc.title}`;

  return {
    title: doc.title,
    description: description,
    openGraph: {
      title: `${doc.title} - ZMSL 文档`,
      description: description,
      type: 'article',
      publishedTime: doc.createdAt,
      modifiedTime: doc.updatedAt,
      url: `https://zmsl.zhsdev.top/docs/${doc.slug}`,
    },
    twitter: {
      card: 'summary',
      title: doc.title,
      description: description,
    },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDoc(slug);

  if (!doc) {
    notFound();
  }

  return <DocClient doc={doc} />;
}
