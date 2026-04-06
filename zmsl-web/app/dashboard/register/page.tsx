'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, theme, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import GeetestCaptcha from '@/components/GeetestCaptcha';

const { Title } = Typography;

// 声明全局变量
declare global {
  interface Window {
    captchaObj?: any;
  }
}

export default function RegisterPage() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [geetestResult, setGeetestResult] = useState<any>(null);
  const [geetestId, setGeetestId] = useState<string>('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }

    // 加载Geetest脚本
    const script = document.createElement('script');
    script.src = 'https://static.geetest.com/v4/gt4.js';
    script.async = true;
    script.onload = () => {
      console.log('Geetest script loaded');
      loadGeetestConfig();
    };
    script.onerror = () => {
      message.error('人机验证脚本加载失败，请刷新页面重试');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadGeetestConfig = async () => {
    try {
      const data = await fetchApi('/auth/geetest-config', {
        method: 'GET',
      });
      if (data.success && data.data?.captchaId) {
        setGeetestId(data.data.captchaId);
      } else {
        // 使用默认测试ID
        setGeetestId('647f5ed2ed8acb4be36784e01556bb71');
      }
    } catch (error) {
      console.warn('获取Geetest配置失败，使用默认配置:', error);
      setGeetestId('647f5ed2ed8acb4be36784e01556bb71');
    }
  };

  const sendEmailCode = async (e?: React.MouseEvent) => {
    // 阻止事件冒泡，防止触发表单提交
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const email = form.getFieldValue('email');
    if (!email) {
      message.error('请先输入邮箱地址');
      return;
    }

    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(email)) {
      message.error('请输入有效的邮箱地址');
      return;
    }

    setSendingCode(true);
    try {
      const data = await fetchApi('/auth/send-email-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (data.success) {
        message.success('验证码已发送到您的邮箱，请查收');
        setCountdown(60);
      } else {
        message.error(data.message || '发送验证码失败');
      }
    } catch (err: any) {
      console.error('发送验证码错误:', err);
      message.error(err.message || '发送验证码失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  };

  const handleGeetestSuccess = (result: any) => {
    setGeetestResult(result);
    setShowCaptcha(false);
    message.success('人机验证完成');
  };

  const handleGeetestError = (error: any) => {
    message.error('人机验证失败，请重试');
    console.error('Geetest error:', error);
  };

  const showGeetestCaptcha = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!geetestId) {
      message.error('人机验证配置加载中，请稍候');
      return;
    }

    if (window.captchaObj) {
      window.captchaObj.showCaptcha();
    } else {
      setShowCaptcha(true);
    }
  };

  const onFinish = async (values: any) => {
    // 验证Geetest
    if (!geetestResult) {
      message.error('请先完成人机验证');
      if (window.captchaObj) {
        window.captchaObj.showCaptcha();
      } else {
        setShowCaptcha(true);
      }
      return;
    }

    setLoading(true);
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          emailCode: values.emailCode,
          lotNumber: geetestResult.lot_number,
          captchaOutput: geetestResult.captcha_output,
          passToken: geetestResult.pass_token,
          genTime: geetestResult.gen_time,
        }),
      });

      if (data.success) {
        message.success('注册成功，请登录');
        router.push('/dashboard/login');
      } else {
        message.error(data.message || '注册失败');
        // 重置Geetest
        setGeetestResult(null);
        if (window.captchaObj) {
          window.captchaObj.reset();
        }
      }
    } catch (err: any) {
      message.error(err.message || '注册请求失败');
      // 重置Geetest
      setGeetestResult(null);
      if (window.captchaObj) {
        window.captchaObj.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px 0' }}>
      <Card style={{ width: 450, boxShadow: token.boxShadow }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>注册账号</Title>
          <p style={{ color: token.colorTextSecondary, fontSize: 14 }}>
            双重验证保障账户安全
          </p>
        </div>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符!' },
              { max: 20, message: '用户名最多20个字符!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名 (3-20个字符)" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱地址" />
          </Form.Item>

          <Form.Item
            name="emailCode"
            rules={[{ required: true, message: '请输入邮箱验证码!' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                prefix={<SafetyOutlined />} 
                placeholder="邮箱验证码" 
                style={{ flex: 1 }}
              />
              <Button 
                onClick={sendEmailCode}
                loading={sendingCode}
                disabled={countdown > 0}
                style={{ width: 120 }}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码 (至少6个字符)" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item
            label=""
            required
            help={geetestResult ? '验证已完成' : '请点击按钮完成人机验证'}
            validateStatus={geetestResult ? 'success' : undefined}
          >
            <Button 
              type="default"
              onClick={showGeetestCaptcha}
              block
              icon={geetestResult ? <SafetyOutlined style={{ color: '#52c41a' }} /> : <SafetyOutlined />}
            >
              {geetestResult ? '✓ 人机验证已完成' : '点击按钮开始验证'}
            </Button>
          </Form.Item>

          {/* Geetest验证组件 */}
          {showCaptcha && geetestId && (
            <div style={{ marginBottom: 16 }}>
              <GeetestCaptcha
                captchaId={geetestId}
                onSuccess={handleGeetestSuccess}
                onError={handleGeetestError}
              />
            </div>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              disabled={!geetestResult}
            >
              注册
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link href="/dashboard/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
