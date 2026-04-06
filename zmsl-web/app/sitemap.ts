import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/api';

interface DocNode {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
}

interface DocCategory {
  id: number;
  name: string;
  sortOrder: number;
  documents: DocNode[];
}

async function getDocs(): Promise<DocNode[]> {
  try {
    // Force dynamic fetch to get latest docs
    const res = await fetch(`${API_BASE_URL}/docs/nav`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];
    
    const docs: DocNode[] = [];
    json.data.forEach((cat: DocCategory) => {
      if (cat.documents) {
        cat.documents.forEach((doc: DocNode) => {
          docs.push(doc);
        });
      }
    });
    return docs;
  } catch (e) {
    console.error('Failed to fetch docs for sitemap:', e);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await getDocs();
  const baseUrl = 'https://msl.zhsdev.top';

  const docUrls = docs.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...docUrls,
  ];
}
