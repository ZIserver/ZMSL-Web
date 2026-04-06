import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api';
import DownloadClient from './DownloadClient';

export const dynamic = 'force-dynamic';

async function getLatestVersion() {
  try {
    const res = await fetch(`${API_BASE_URL}/versions/latest`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (e) {
    console.error('Failed to fetch latest version:', e);
    return null;
  }
}

export const metadata: Metadata = {
  title: '下载客户端 - ZMSL',
  description: '下载最新版 ZMSL 客户端，开始您的 Minecraft 服务器管理之旅。',
  openGraph: {
    title: '下载 ZMSL 客户端',
    description: '下载最新版 ZMSL 客户端，开始您的 Minecraft 服务器管理之旅。',
    type: 'website',
  },
};

export default async function DownloadPage() {
  const version = await getLatestVersion();
  return <DownloadClient version={version} />;
}
