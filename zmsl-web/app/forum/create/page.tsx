'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Form, Input, Select, Button, Spin, message, Breadcrumb, Divider, theme } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MdEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  postCount: number;
  sortOrder: number;
}

interface CreatePostRequest {
  categoryId: number;
  title: string;
  content: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { token } = theme.useToken();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CreatePostRequest>();
  const [content, setContent] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    if (!storedToken) {
      message.warning('请先登录');
      router.push('/dashboard/login');
      return;
    }
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchApi('/forum/categories');
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!content || content.trim() === '') {
        message.error('请输入帖子内容');
        return;
      }
      setSubmitting(true);
      const request = {
        categoryId: values.categoryId,
        title: values.title,
        content: content,
      };
      const data = await fetchApi('/forum/posts', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (data.success) {
        message.success('帖子发布成功');
        router.push(`/forum?post=${data.data.id}`);
      }
    } catch (error: any) {
      message.error(error.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <Breadcrumb
        items={[
          { title: <Link href="/forum">论坛</Link> },
          { title: '发布帖子' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Card style={{ background: token.colorBgContainer }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Link href="/forum">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              返回
            </Button>
          </Link>
          <Title level={3} style={{ margin: 0 }}>发布新帖子</Title>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="categoryId"
                label="选择分区"
                rules={[{ required: true, message: '请选择分区' }]}
              >
                <Select placeholder="请选择分区" size="large">
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="帖子标题"
                rules={[{ required: true, message: '请输入标题' }, { max: 100, message: '标题最多100字' }]}
              >
                <Input placeholder="请输入帖子标题" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ marginBottom: 8 }}>
            <Text strong>帖子内容</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>（支持 Markdown 语法）</Text>
          </div>
          <div data-color-mode={token.colorBgContainer === '#141414' ? 'dark' : 'light'}>
            <MdEditor
              value={content}
              onChange={(value) => setContent(value || '')}
              height={400}
              style={{ borderRadius: 8 }}
            />
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/forum">
              <Button style={{ marginRight: 12 }}>取消</Button>
            </Link>
            <Button type="primary" onClick={handleSubmit} loading={submitting} icon={<SendOutlined />} size="large">
              发布帖子
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}