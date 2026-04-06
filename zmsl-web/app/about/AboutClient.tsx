'use client';

import React, { useEffect, useState } from 'react';
import { 
  Typography, Card, List, Avatar, Space, Row, Col, Spin, theme, Tag, Tabs, Button 
} from 'antd';
import { 
  GithubOutlined, HeartFilled, QqOutlined, UserOutlined, 
  RocketOutlined, GiftOutlined 
} from '@ant-design/icons';
import { fetchApi } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

interface Developer {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
  githubUrl: string;
  qq?: string;
}

interface Donor {
  id: number;
  name: string;
  amount?: number;
  message: string;
  qq: string;
  email?: string;
  type: 'MONEY' | 'ITEM';
  itemName?: string;
}

interface ContactInfo {
  email: string;
  qqGroup: string;
  discord: string;
  companyAddress: string;
}

const formatter = (value: number | string) => <span style={{ color: 'inherit' }}>{Number(value).toLocaleString()}</span>;

export default function AboutClient() {
  const { token } = theme.useToken();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devRes, donorRes, contactRes] = await Promise.all([
          fetchApi('/about/developers'),
          fetchApi('/about/donors'),
          fetchApi('/about/contact')
        ]);

        if (devRes.success) {
          setDevelopers(devRes.data);
        }
        if (donorRes.success) {
          setDonors(donorRes.data);
        }
        if (contactRes.success) {
          setContactInfo(contactRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const getAvatarUrl = (qq?: string, url?: string) => {
    // Prioritize QQ avatar if available
    if (qq && qq.trim()) return `https://q.qlogo.cn/headimg_dl?dst_uin=${qq.trim()}&spec=640&img_type=jpg`;
    
    if (url) {
      const trimmedUrl = url.trim();
      // If url is a pure number (QQ number), treat it as QQ avatar
      if (/^\d+$/.test(trimmedUrl)) {
        return `https://q.qlogo.cn/headimg_dl?dst_uin=${trimmedUrl}&spec=640&img_type=jpg`;
      }
      // Otherwise check for http/https
      if (trimmedUrl.startsWith('http')) return trimmedUrl;
    }
    
    return undefined;
  };

  const HeroSection = () => (
    <div style={{ 
      background: `linear-gradient(135deg, ${token.colorPrimary}15, ${token.colorInfo}15)`,
      padding: '80px 24px',
      borderRadius: 16,
      textAlign: 'center',
      marginBottom: 48 
    }}>
      <Title level={1} style={{ marginBottom: 16 }}>
        <RocketOutlined style={{ marginRight: 12, color: token.colorPrimary }} />
        关于我们
      </Title>
      <Paragraph style={{ fontSize: 18, color: token.colorTextSecondary, maxWidth: 800, margin: '0 auto' }}>
        智穗MC开服器 (ZMSL) 致力于为 Minecraft 腐竹提供专业、稳定、高效的服务器管理解决方案。
        我们需要您的支持来让项目走得更远！
      </Paragraph>
      <Space size="large" style={{ marginTop: 32 }}>
        <Button type="primary" size="large" icon={<GithubOutlined />} href="https://github.com/ZMSL-Dev" target="_blank">
          GitHub
        </Button>
        <Button size="large" icon={<QqOutlined />} href={contactInfo?.qqGroup ? `https://qm.qq.com/cgi-bin/qm/qr?k=${contactInfo.qqGroup}` : '#'} target="_blank">
          加入QQ群
        </Button>
      </Space>
    </div>
  );

  const DevelopersSection = () => (
    <div style={{ marginBottom: 64 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        <Space>
          <GithubOutlined />
          开发团队
        </Space>
      </Title>
      <Row gutter={[24, 24]} justify="center">
        {developers.map((dev) => (
          <Col key={dev.id} xs={24} sm={12} md={8} lg={6}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar 
                  size={100} 
                  src={getAvatarUrl(dev.qq, dev.avatarUrl)} 
                  icon={<UserOutlined />}
                  style={{ border: `4px solid ${token.colorBgContainer}`, boxShadow: token.boxShadow }} 
                  {...({ referrerPolicy: 'no-referrer' } as any)}
                />
                {dev.qq && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    background: '#1890ff', 
                    color: '#fff', 
                    borderRadius: '50%', 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `2px solid ${token.colorBgContainer}`
                  }}>
                    <QqOutlined style={{ fontSize: 14 }} />
                  </div>
                )}
              </div>
              <Title level={4} style={{ marginBottom: 4 }}>{dev.name}</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{dev.role}</Text>
              {dev.githubUrl && (
                <div style={{ marginTop: 12 }}>
                  <Button type="text" icon={<GithubOutlined />} href={dev.githubUrl} target="_blank">
                    GitHub
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const DonorsSection = () => {
    // Merge all donors and sort them
    // Sorting logic: 
    // 1. Money donors first, sorted by amount descending
    // 2. Then Item donors
    const sortedDonors = [...donors].sort((a, b) => {
      if (a.type !== 'ITEM' && b.type === 'ITEM') return -1;
      if (a.type === 'ITEM' && b.type !== 'ITEM') return 1;
      if (a.type !== 'ITEM' && b.type !== 'ITEM') {
        return (b.amount || 0) - (a.amount || 0);
      }
      return 0;
    });

    const DonorList = ({ list }: { list: Donor[] }) => (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={list}
        renderItem={(donor) => (
          <List.Item>
            <Card 
              size="small" 
              bordered={false} 
              hoverable 
              style={{ background: token.colorFillAlter, textAlign: 'center' }}
            >
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                <Avatar 
                  size={64}
                  src={getAvatarUrl(donor.qq)} 
                  icon={<HeartFilled style={{ color: '#eb2f96' }} />} 
                  style={{ 
                    backgroundColor: token.colorBgContainer,
                    border: `2px solid ${token.colorBgContainer}`,
                    boxShadow: token.boxShadow
                  }}
                  {...({ referrerPolicy: 'no-referrer' } as any)}
                />
                {donor.qq && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    background: '#1890ff', 
                    color: '#fff', 
                    borderRadius: '50%', 
                    width: 20, 
                    height: 20, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `2px solid ${token.colorBgContainer}`
                  }}>
                    <QqOutlined style={{ fontSize: 12 }} />
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16, display: 'block' }}>{donor.name}</Text>
                <div style={{ marginTop: 4 }}>
                  {donor.type === 'ITEM' ? (
                    <Tag color="purple" icon={<GiftOutlined />}>物品</Tag>
                  ) : (
                    <Tag color="gold">¥{donor.amount}</Tag>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {donor.type === 'ITEM' && (
                  <Text type="success">{donor.itemName}</Text>
                )}
                <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: donor.message }}>
                  {donor.message || '感谢支持！'}
                </Text>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );

    return (
      <div style={{ marginBottom: 64 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space>
            <HeartFilled style={{ color: '#eb2f96' }} />
            特别鸣谢
          </Space>
        </Title>
        <Card bordered={false} style={{ boxShadow: token.boxShadowTertiary }}>
          <DonorList list={sortedDonors} />
        </Card>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <HeroSection />
      <DevelopersSection />
      <DonorsSection />
    </div>
  );
}
