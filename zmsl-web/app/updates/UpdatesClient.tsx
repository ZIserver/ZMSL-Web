'use client';

import React from 'react';
import { Typography, Timeline, Card, Alert, Tag, Empty, theme } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Version {
  id: number;
  version: string;
  changelog: string;
  releasedAt: string;
  isLatest: boolean;
}

interface UpdatesClientProps {
  versions: Version[];
}

export default function UpdatesClient({ versions }: UpdatesClientProps) {
  const { token } = theme.useToken();
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
        更新日志
      </Title>

      {versions.length === 0 ? (
        <Empty description="暂无更新记录" />
      ) : (
        <Timeline
          mode="left"
          items={versions.map((version) => ({
            label: new Date(version.releasedAt).toLocaleDateString(),
            dot: version.isLatest ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined,
            color: version.isLatest ? 'blue' : 'gray',
            children: (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>v{version.version}</span>
                    {version.isLatest && <Tag color="blue">Latest</Tag>}
                  </div>
                }
                variant="borderless"
                style={{ boxShadow: token.boxShadow }}
              >
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                  {version.changelog}
                </pre>
              </Card>
            ),
          }))}
        />
      )}
    </div>
  );
}
