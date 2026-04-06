import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api';
import UpdatesClient from './UpdatesClient';

interface Version {
  id: number;
  version: string;
  changelog: string;
  releasedAt: string;
  isLatest: boolean;
}

export const dynamic = 'force-dynamic';

async function getVersions(): Promise<Version[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/versions`, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (e) {
    console.error('Failed to fetch versions:', e);
    return [];
  }
}

export const metadata: Metadata = {
  title: '更新日志 - ZMSL',
  description: 'ZMSL 客户端更新历史与版本说明。',
  openGraph: {
    title: '更新日志 - ZMSL',
    description: 'ZMSL 客户端更新历史与版本说明。',
    type: 'website',
  },
};

export default async function UpdatesPage() {
  const versions = await getVersions();
  return <UpdatesClient versions={versions} />;
}
