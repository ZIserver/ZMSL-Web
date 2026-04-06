import { Metadata } from 'next';
import DocsIndexClient from './DocsIndexClient';

export const metadata: Metadata = {
  title: '文档中心 - ZMSL',
  description: 'ZMSL 官方文档中心，提供详细的使用指南和配置说明，帮助您快速搭建和管理 Minecraft 服务器。',
  openGraph: {
    title: 'ZMSL 文档中心',
    description: 'ZMSL 官方文档中心，提供详细的使用指南和配置说明。',
    type: 'website',
  },
};

export default function DocsIndexPage() {
  return <DocsIndexClient />;
}
