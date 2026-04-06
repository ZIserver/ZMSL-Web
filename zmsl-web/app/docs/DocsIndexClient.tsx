'use client';

import React from 'react';
import { Typography, theme } from 'antd';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function DocsIndexClient() {
  const { token } = theme.useToken();
  
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <Title level={1}>ZMSL 文档中心</Title>
      <Paragraph style={{ fontSize: 18, color: token.colorTextSecondary, maxWidth: 600, margin: '0 auto 40px' }}>
        欢迎查阅 ZMSL 官方文档。这里包含了从入门安装到高级配置的所有指南。
      </Paragraph>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'left' }}>
        <div style={{ padding: 24, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 12, background: token.colorFillAlter }}>
          <Title level={4}>🚀 快速开始</Title>
          <Paragraph>了解如何下载、安装并启动您的第一个 Minecraft 服务器。</Paragraph>
          <Link href="/docs/getting-started">查看指南 &rarr;</Link>
        </div>
        
        <div style={{ padding: 24, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 12, background: token.colorFillAlter }}>
          <Title level={4}>🌐 内网穿透</Title>
          <Paragraph>配置 FRP 隧道，邀请好友加入您的本地世界。</Paragraph>
          <Link href="/docs/frp-guide">查看指南 &rarr;</Link>
        </div>

        <div style={{ padding: 24, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 12, background: token.colorFillAlter }}>
          <Title level={4}>🔧 进阶配置</Title>
          <Paragraph>服务器参数优化、插件管理与常见问题排查。</Paragraph>
          <Link href="/docs/advanced-config">查看指南 &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
