'use client';

import React from 'react';
import { Typography, Button, Card, Alert, Descriptions, theme } from 'antd';
import { CloudDownloadOutlined, WindowsOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Version {
  id: number;
  version: string;
  changelog: string;
  downloadUrl: string;
  releasedAt: string;
  fileSize?: number;
  fileHash?: string;
}

interface DownloadClientProps {
  version: Version | null;
}

export default function DownloadClient({ version }: DownloadClientProps) {
  const { token } = theme.useToken();

  if (!version) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
          下载 ZMSL 客户端
        </Title>
        <Alert message="暂无可用版本" type="info" showIcon />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
        下载 ZMSL 客户端
      </Title>

      <Card variant="borderless" style={{ boxShadow: token.boxShadow }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <WindowsOutlined style={{ fontSize: 64, color: token.colorPrimary, marginBottom: 16 }} />
          <Title level={3}>ZMSL Windows 客户端</Title>
          <Text type="secondary">版本 {version.version} | 发布于 {new Date(version.releasedAt).toLocaleDateString()}</Text>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Button
            type="primary"
            size="large"
            icon={<CloudDownloadOutlined />}
            href={version.downloadUrl}
            target="_blank"
            style={{ height: 50, padding: '0 40px', fontSize: 18 }}
          >
            立即下载 Windows 版
          </Button>
          {version.fileSize && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">文件大小: {(version.fileSize / 1024 / 1024).toFixed(2)} MB</Text>
            </div>
          )}
        </div>

        <Descriptions title="版本信息" bordered column={1}>
          <Descriptions.Item label="版本号">{version.version}</Descriptions.Item>
          <Descriptions.Item label="更新日志">
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
              {version.changelog}
            </pre>
          </Descriptions.Item>
          {version.fileHash && (
            <Descriptions.Item label="SHA256 Checksum">
              <Text code copyable>{version.fileHash}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}
