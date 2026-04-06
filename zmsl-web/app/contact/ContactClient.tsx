'use client';

import React, { useEffect, useState } from 'react';
import { 
  Typography, Card, Spin, theme, Row, Col, Button, message, Space, Tooltip, Divider 
} from 'antd';
import { 
  MailOutlined, QqOutlined, EnvironmentOutlined, GlobalOutlined,
  CopyOutlined, ArrowRightOutlined, SendOutlined, TeamOutlined, WechatOutlined
} from '@ant-design/icons';
import { fetchApi } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

interface ContactInfo {
  email: string;
  qqGroup: string;
  qqGroupLink?: string;
  discord: string;
  companyAddress: string;
}

export default function ContactClient() {
  const { token } = theme.useToken();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApi('/about/contact');
        if (response.success) {
          setContactInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      message.success(`已复制 ${label}`);
    }).catch(() => {
      message.error('复制失败');
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const HeroSection = () => (
    <div style={{ 
      background: `linear-gradient(135deg, ${token.colorPrimary}15, ${token.colorInfo}15)`,
      padding: '80px 24px',
      borderRadius: 16,
      textAlign: 'center',
      marginBottom: 48 
    }}>
      <Title level={1} style={{ marginBottom: 16 }}>
        <MailOutlined style={{ marginRight: 12, color: token.colorPrimary }} />
        联系我们
      </Title>
      <Paragraph style={{ fontSize: 18, color: token.colorTextSecondary, maxWidth: 600, margin: '0 auto' }}>
        无论是技术支持、商务合作还是意见反馈，我们都期待听到您的声音。
      </Paragraph>
    </div>
  );

  const ContactCards = () => (
    <Row gutter={[24, 24]} justify="center">
      {/* Email Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, margin: '0 auto 16px', 
            background: token.colorFillAlter, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MailOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>电子邮箱</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            {contactInfo?.email || '暂无'}
          </Text>
          <Space>
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              href={`mailto:${contactInfo?.email}`}
              disabled={!contactInfo?.email}
            >
              发送邮件
            </Button>
            <Tooltip title="复制邮箱">
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => handleCopy(contactInfo?.email || '', '邮箱')}
                disabled={!contactInfo?.email}
              />
            </Tooltip>
          </Space>
        </Card>
      </Col>

      {/* QQ Group Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, margin: '0 auto 16px', 
            background: token.colorFillAlter, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <QqOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>QQ 交流群</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            {contactInfo?.qqGroup || '暂无'}
          </Text>
          <Space>
            <Button 
              type="primary" 
              icon={<TeamOutlined />} 
              href={contactInfo?.qqGroupLink || '#'} 
              target="_blank"
              disabled={!contactInfo?.qqGroupLink}
            >
              加入群聊
            </Button>
            <Tooltip title="复制群号">
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => handleCopy(contactInfo?.qqGroup || '', 'QQ群号')}
                disabled={!contactInfo?.qqGroup}
              />
            </Tooltip>
          </Space>
        </Card>
      </Col>

      {/* Discord Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, margin: '0 auto 16px', 
            background: token.colorFillAlter, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GlobalOutlined style={{ fontSize: 32, color: '#5865F2' }} />
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>Discord</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            {contactInfo?.discord ? 'ZMSL Official' : '暂无'}
          </Text>
          <Button 
            block
            icon={<ArrowRightOutlined />} 
            href={contactInfo?.discord} 
            target="_blank"
            disabled={!contactInfo?.discord}
          >
            加入服务器
          </Button>
        </Card>
      </Col>

      {/* Address Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, margin: '0 auto 16px', 
            background: token.colorFillAlter, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <EnvironmentOutlined style={{ fontSize: 32, color: '#faad14' }} />
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>公司地址</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }} ellipsis={{ tooltip: contactInfo?.companyAddress }}>
            {contactInfo?.companyAddress || '暂无详细地址'}
          </Text>
          <Tooltip title="复制地址">
            <Button 
              block
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(contactInfo?.companyAddress || '', '地址')}
              disabled={!contactInfo?.companyAddress}
            >
              复制地址
            </Button>
          </Tooltip>
        </Card>
      </Col>
    </Row>
  );

  const MessageSection = () => (
    <div style={{ marginTop: 64, textAlign: 'center' }}>
      <Divider>
        <Text type="secondary">或者是</Text>
      </Divider>
      <Title level={3} style={{ marginTop: 32, marginBottom: 16 }}>
        需要即时帮助？
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 32 }}>
        我们的 QQ 群和 Discord 社区有众多热心的用户和开发者，
        <br />
        这通常是获取帮助最快的方式。
      </Paragraph>
      <Space size="large">
        <Button size="large" icon={<QqOutlined />} href={contactInfo?.qqGroupLink || '#'} target="_blank" disabled={!contactInfo?.qqGroupLink}>
          加入 QQ 群
        </Button>
        <Button size="large" icon={<GlobalOutlined />} href={contactInfo?.discord} target="_blank" disabled={!contactInfo?.discord}>
          加入 Discord
        </Button>
      </Space>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <HeroSection />
      <ContactCards />
      <MessageSection />
    </div>
  );
}
