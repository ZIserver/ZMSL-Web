'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Form, Input, InputNumber, Button, Radio, Space, message,
  Row, Col, Divider, theme, Spin, Result, Avatar, List, Tag
} from 'antd';
import {
  HeartFilled, AlipayCircleOutlined, WechatOutlined,
  QqOutlined, UserOutlined, CheckCircleOutlined, GiftOutlined
} from '@ant-design/icons';
import { fetchApi } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

interface Donor {
  id: number;
  name: string;
  amount?: number;
  message: string;
  qq: string;
  type: 'MONEY' | 'ITEM';
  itemName?: string;
}

interface PaymentResult {
  outTradeNo: string;
  payUrl: string;
}

export default function DonateClient() {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [showOnWall, setShowOnWall] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [currentOutTradeNo, setCurrentOutTradeNo] = useState<string | null>(null);

  useEffect(() => {
    fetchDonors();
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const outTradeNo = urlParams.get('out_trade_no');
    if (success === 'true' && outTradeNo) {
      setCurrentOutTradeNo(outTradeNo);
      checkPaymentStatus(outTradeNo);
    }
  }, []);

  const fetchDonors = async () => {
    try {
      const res = await fetchApi('/about/donors');
      if (res.success) {
        setDonors(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setDonorsLoading(false);
    }
  };

  const checkPaymentStatus = async (outTradeNo: string) => {
    setCheckingPayment(true);
    try {
      const res = await fetchApi(`/donation/status/${outTradeNo}`);
      if (res.success && res.data.status === 'SUCCESS') {
        setPaymentSuccess(true);
        message.success('支付成功！感谢您的赞助！');
        fetchDonors();
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (showOnWall && (!values.donorName || !values.donorQq)) {
      message.error('请填写您的名称和QQ号');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/donation/create', {
        method: 'POST',
        body: JSON.stringify({
          amount: values.amount,
          payType: values.payType,
          showOnWall: showOnWall,
          donorName: values.donorName,
          donorQq: values.donorQq,
          donorMessage: values.donorMessage,
          returnUrl: `${window.location.origin}/donate`,
        }),
      });

      if (res.success) {
        const data: PaymentResult = res.data;
        setCurrentOutTradeNo(data.outTradeNo);
        window.location.href = data.payUrl;
      } else {
        message.error(res.message || '创建支付失败');
      }
    } catch (error: any) {
      message.error(error.message || '创建支付失败');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (qq?: string) => {
    if (qq && qq.trim()) {
      return `https://q.qlogo.cn/headimg_dl?dst_uin=${qq.trim()}&spec=640&img_type=jpg`;
    }
    return undefined;
  };

  const sortedDonors = [...donors].sort((a, b) => {
    if (a.type !== 'ITEM' && b.type === 'ITEM') return -1;
    if (a.type === 'ITEM' && b.type !== 'ITEM') return 1;
    if (a.type !== 'ITEM' && b.type !== 'ITEM') {
      return (b.amount || 0) - (a.amount || 0);
    }
    return 0;
  });

  if (checkingPayment) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="正在确认支付状态..." />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        <Result
          status="success"
          title="支付成功"
          subTitle="感谢您的赞助支持！您的支持是我们前进的动力！"
          extra={[
            <Button type="primary" key="again" onClick={() => {
              setPaymentSuccess(false);
              setCurrentOutTradeNo(null);
              form.resetFields();
              window.history.replaceState({}, '', '/donate');
            }}>
              再次赞助
            </Button>,
            <Button key="view" onClick={() => window.location.href = '/about'}>
              查看赞助墙
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{
        background: `linear-gradient(135deg, ${token.colorPrimary}15, ${token.colorError}15)`,
        padding: '60px 24px',
        borderRadius: 16,
        textAlign: 'center',
        marginBottom: 48
      }}>
        <HeartFilled style={{ fontSize: 48, color: '#eb2f96', marginBottom: 16 }} />
        <Title level={1} style={{ marginBottom: 16 }}>支持我们</Title>
        <Paragraph style={{ fontSize: 18, color: token.colorTextSecondary, maxWidth: 600, margin: '0 auto' }}>
          ZMSL 是一个开源免费项目，您的赞助将帮助我们持续改进和维护项目。
          每一份支持都是对我们工作的认可和鼓励！
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Title level={4} style={{ margin: 0 }}>赞助支持</Title>} bordered={false}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ amount: 10, payType: 'alipay' }}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="amount"
                label="赞助金额"
                rules={[{ required: true, message: '请输入赞助金额' }]}
              >
                <InputNumber
                  prefix="¥"
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="请输入赞助金额"
                />
              </Form.Item>

              <Form.Item
                name="payType"
                label="支付方式"
                rules={[{ required: true, message: '请选择支付方式' }]}
              >
                <Radio.Group>
                  <Radio.Button value="alipay">
                    <AlipayCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                    支付宝
                  </Radio.Button>
                  <Radio.Button value="wxpay">
                    <WechatOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    微信支付
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Divider />

              <Form.Item label="是否显示在赞助墙">
                <Radio.Group onChange={(e) => setShowOnWall(e.target.value)} value={showOnWall}>
                  <Radio value={true}>是，我想展示在赞助墙</Radio>
                  <Radio value={false}>否，我想匿名赞助</Radio>
                </Radio.Group>
              </Form.Item>

              {showOnWall && (
                <>
                  <Form.Item
                    name="donorName"
                    label="您的名称"
                    rules={[{ required: showOnWall, message: '请输入您的名称' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="请输入您的名称" maxLength={50} />
                  </Form.Item>

                  <Form.Item
                    name="donorQq"
                    label="QQ号"
                    rules={[
                      { required: showOnWall, message: '请输入您的QQ号' },
                      { pattern: /^\d+$/, message: '请输入有效的QQ号' }
                    ]}
                  >
                    <Input prefix={<QqOutlined />} placeholder="请输入您的QQ号（用于显示头像）" maxLength={20} />
                  </Form.Item>

                  <Form.Item name="donorMessage" label="留言（选填）">
                    <Input.TextArea
                      placeholder="写一句想说的话..."
                      maxLength={200}
                      showCount
                      rows={3}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<HeartFilled />}
                  style={{ background: '#eb2f96', borderColor: '#eb2f96' }}
                >
                  立即赞助
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                <HeartFilled style={{ color: '#eb2f96', marginRight: 8 }} />
                赞助墙
              </Title>
            }
            bordered={false}
            extra={<Tag color="gold">共 {donors.length} 位赞助者</Tag>}
          >
            {donorsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
              </div>
            ) : donors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
                暂无赞助者，成为第一位赞助者吧！
              </div>
            ) : (
              <List
                dataSource={sortedDonors.slice(0, 10)}
                renderItem={(donor) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={48}
                          src={getAvatarUrl(donor.qq)}
                          icon={<HeartFilled style={{ color: '#eb2f96' }} />}
                          style={{ backgroundColor: token.colorBgContainer }}
                          {...({ referrerPolicy: 'no-referrer' } as any)}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{donor.name}</Text>
                          {donor.type === 'ITEM' ? (
                            <Tag color="purple" icon={<GiftOutlined />}>物品</Tag>
                          ) : (
                            <Tag color="gold">¥{donor.amount}</Tag>
                          )}
                        </Space>
                      }
                      description={donor.message || '感谢支持！'}
                    />
                  </List.Item>
                )}
              />
            )}
            {donors.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => window.location.href = '/about'}>
                  查看全部赞助者
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} bordered={false}>
        <Title level={5}>赞助说明</Title>
        <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, margin: 0 }}>
          <li>赞助金额将用于服务器维护、域名续费等项目运营成本</li>
          <li>选择显示在赞助墙后，您的名称和QQ头像将展示在关于页面</li>
          <li>匿名赞助不会记录任何个人信息到数据库</li>
          <li>如有疑问，请联系我们</li>
        </ul>
      </Card>
    </div>
  );
}
