'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, theme, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const { Title } = Typography;

export default function LoginPage() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          rememberMe: values.remember,
        }),
      });

      if (data.success) {
        message.success('登录成功');
        localStorage.setItem('token', data.token);
        // Optionally store user info
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (err: any) {
      message.error(err.message || '登录请求失败');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return null; // Prevent flash of login form
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 400, boxShadow: token.boxShadow }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>用户登录</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>保持登录状态</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            没有账号？ <Link href="/dashboard/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
