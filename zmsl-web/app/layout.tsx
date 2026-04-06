import React from 'react';
import AntdRegistry from '@/lib/AntdRegistry';
import MainLayout from '@/components/MainLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://msl.zhsdev.top'), // 请替换为实际域名
  title: {
    template: '%s | ZMSL - 智穗MC开服器',
    default: 'ZMSL - 智穗MC开服器 | 专业、稳定、高效的服务器管理解决方案',
  },
  description: 'ZMSL（智穗MC开服器）提供专业、稳定、高效的 Minecraft 服务器管理与内网穿透解决方案。支持一键开服、版本管理、插件配置等功能。',
  keywords: ['Minecraft开服', 'MC服务器', '我的世界开服器', '内网穿透', 'FRP', 'ZMSL', '智穗'],
  authors: [{ name: 'ZMSL Team' }],
  creator: 'ZMSL Team',
  publisher: 'ZMSL Team',
  openGraph: {
    title: 'ZMSL - 智穗MC开服器',
    description: '专业、稳定、高效的 Minecraft 服务器管理与内网穿透解决方案',
    url: 'https://msl.zhsdev.top',
    siteName: 'ZMSL - 智穗MC开服器',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZMSL - 智穗MC开服器',
    description: '专业、稳定、高效的 Minecraft 服务器管理与内网穿透解决方案',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
