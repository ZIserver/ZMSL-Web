'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Input, Typography, Alert, message, Result, Spin, theme } from 'antd';
import { ExperimentOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchApi } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function BetaClient() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const [latestVersion, setLatestVersion] = useState<any>(null);

  useEffect(() => {
    loadStatus();
    loadVersion();
  }, []);

  const loadVersion = async () => {
    try {
      const res = await fetchApi('/beta/latest');
      if (res.success) {
        setLatestVersion(res.data);
      }
    } catch (e) {}
  };

  const loadStatus = async () => {
    try {
      const res = await fetchApi('/beta/status');
      if (res.success && res.data) {
        let data = res.data;
        
        // 前端自动检测是否到期
        const now = new Date();
        const expiresAt = data.expiresAt || data.expireTime || data.expirationDate;
        
        if (data.status === 'APPROVED' && data.keyStatus !== 'EXPIRED' && expiresAt) {
          const expireDate = new Date(expiresAt);
          if (expireDate < now) {
            data.keyStatus = 'EXPIRED';
          }
        }
        
        setApplication(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await fetchApi('/beta/apply', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (res.success) {
        message.success('Application submitted successfully');
        setApplication(res.data);
      } else {
        message.error(res.message || 'Failed to submit');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    if (application?.key) {
      navigator.clipboard.writeText(application.key);
      message.success('Key copied to clipboard');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card title={<><ExperimentOutlined /> 内测申请 (Beta Application)</>} bordered={false} style={{ borderRadius: 8, boxShadow: token.boxShadow }}>
        {!application ? (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Alert
              message="内测说明"
              description="内测版本包含最新功能，但也可能存在不稳定因素。申请通过后，您将获得唯一的内测激活码（卡密）。该卡密仅限本人使用，禁止分享。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item
              name="reason"
              label="申请理由"
              rules={[{ required: true, message: '请输入申请理由' }]}
            >
              <TextArea rows={4} placeholder="请简要说明您为何想要参与内测，以及您的设备环境..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                提交申请
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            {application.status === 'PENDING' && (
              <Result
                status="info"
                title="审核中"
                subTitle="您的内测申请正在审核中，请耐心等待。审核结果将在此页面显示。"
                extra={[
                   <Button key="refresh" onClick={loadStatus}>刷新状态</Button>
                ]}
              />
            )}
            {application.status === 'REJECTED' && (
              <Result
                status="error"
                title="申请未通过"
                subTitle="很抱歉，您的内测申请未通过审核。"
                extra={[
                  <Button key="retry" type="primary" onClick={() => setApplication(null)}>
                    重新申请
                  </Button>
                ]}
              />
            )}
            {application.status === 'APPROVED' && (
              application.keyStatus === 'BANNED' ? (
                <Result
                    status="error"
                    title="内测资格已被封禁"
                    subTitle="您的内测资格已被管理员封禁，如有疑问请联系管理员。"
                />
              ) : application.keyStatus === 'EXPIRED' ? (
                <Result
                    status="warning"
                    title="内测资格已到期"
                    subTitle="您的内测资格已到期，请重新申请。"
                    extra={[
                        <Button key="reapply" type="primary" onClick={() => setApplication(null)}>
                            重新申请
                        </Button>
                    ]}
                />
              ) : (
              <Result
                status="success"
                title="恭喜！您已获得内测资格"
                subTitle="请妥善保管您的内测激活码。"
                extra={[
                  <div key="key-box" style={{ background: token.colorFillSecondary, padding: 16, borderRadius: 8, marginBottom: 24, textAlign: 'center' }}>
                    <Text type="secondary">您的内测激活码 (Beta Key)</Text>
                    <div style={{ fontSize: 24, fontWeight: 'bold', margin: '8px 0', letterSpacing: 2 }}>
                      {application.key}
                    </div>
                    <Button type="link" icon={<CopyOutlined />} onClick={copyKey}>
                      复制激活码
                    </Button>
                  </div>,
                  <Button 
                    key="download" 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    size="large" 
                    href={latestVersion?.downloadUrl || '#'}
                    disabled={!latestVersion?.downloadUrl}
                    target="_blank"
                  >
                    下载内测版本 {latestVersion?.version ? `(${latestVersion.version})` : ''}
                  </Button>
                ]}
              />
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
