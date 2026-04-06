'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Button, Space, Card, Row, Col, Statistic, Steps, Divider, theme, Tag, Avatar, List, Badge, Tabs, Grid, Carousel } from 'antd';
import { 
  CloudDownloadOutlined, 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  PlayCircleFilled,
  CodeOutlined,
  CheckCircleFilled,
  SettingFilled,
  PlusOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

interface Testimonial {
  id: number;
  name: string;
  qq: string;
  content: string;
  subtitle?: string;
  sortOrder: number;
  isActive: boolean;
}

// --- Mock UI Components for Visuals ---

const MockConsoleWindow = () => {
  const { token } = theme.useToken();
  return (
    <div style={{ background: '#1e1e1e', borderRadius: token.borderRadiusLG, padding: 16, fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', height: '100%', boxShadow: token.boxShadow }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div><span style={{ color: '#569cd6' }}>[10:23:41 INFO]</span> Starting minecraft server version 1.20.4</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:41 INFO]</span> Loading properties</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:41 INFO]</span> Default game type: SURVIVAL</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:41 INFO]</span> Generating keypair</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:42 INFO]</span> Starting Minecraft server on *:25565</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:42 INFO]</span> Using default channel type</div>
        <div><span style={{ color: '#da70d6' }}>[10:23:44 WARN]</span> Can't keep up! Is the server overloaded?</div>
        <div><span style={{ color: '#569cd6' }}>[10:23:45 INFO]</span> Done (4.2s)! For help, type "help"</div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4ec9b0' }}>admin@zmsl</span>:<span style={{ color: '#ce9178' }}>~</span>$ <span className="cursor-blink">|</span>
        </div>
      </div>
    </div>
  );
};

const MockServerCard = ({ name, version, status, players }: any) => {
  const { token } = theme.useToken();
  return (
    <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 16, marginBottom: 12, border: `1px solid ${token.colorBorderSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: token.boxShadowTertiary }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar shape="square" size={48} style={{ backgroundColor: token.colorPrimary }} icon={<RocketOutlined />} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: token.colorText }}>{name}</div>
          <Space size={4}>
            <Tag style={{ margin: 0 }} bordered={false}>{version}</Tag>
            <Tag color={status === 'running' ? 'success' : 'default'} style={{ margin: 0 }} bordered={false}>
              {status === 'running' ? 'Running' : 'Stopped'}
            </Tag>
          </Space>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, color: token.colorTextSecondary }}>Players</div>
        <div style={{ fontWeight: 600, color: token.colorText }}>{players}</div>
      </div>
    </div>
  );
};

const MockStatsCard = () => {
  const { token } = theme.useToken();
  return (
    <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 20, boxShadow: token.boxShadow, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, color: token.colorText }}>流量监控</span>
        <Tag color="blue">实时</Tag>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 100, gap: 8, paddingBottom: 10 }}>
        {[30, 45, 35, 60, 50, 70, 55, 80, 65, 90, 40, 50].map((h, i) => (
          <div key={i} style={{ flex: 1, background: i === 9 ? token.colorPrimary : token.colorFillSecondary, height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: token.colorTextSecondary }}>
        <div>
          <div>上行速率</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: token.colorText }}>2.4 MB/s</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>下行速率</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: token.colorText }}>5.1 MB/s</div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Home() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/testimonials`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTestimonials(data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  // 循环轮播逻辑
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1;
        if (next >= testimonials.length) {
          return 0;
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const maxSlide = testimonials.length - 1;

  const handlePrev = () => {
    if (currentSlide === 0) {
      setCurrentSlide(testimonials.length - 1);
    } else {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide >= maxSlide) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleDotClick = (index: number) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  const features = [
    {
      title: '极速体验',
      desc: '采用 .NET 10 与 WinUI 3 原生开发，毫秒级启动，资源占用极低。',
      icon: <RocketOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    },
    {
      title: '内网穿透',
      desc: '内置高性能 FRP 客户端，一键映射本地服务器到公网。',
      icon: <GlobalOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    },
    {
      title: '安全稳定',
      desc: '多重加密传输，保障数据安全。99.9% 节点在线率。',
      icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    },
    {
      title: '多核心支持',
      desc: '完美支持 Vanilla, Paper, Forge, Fabric 等主流核心。',
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    },
    {
      title: '环境管理',
      desc: '全自动检测与下载 Java 运行环境 (JDK 8/17/21)。',
      icon: <ToolOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    },
    {
      title: '社区驱动',
      desc: '活跃的玩家社区，丰富的插件资源。',
      icon: <TeamOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
    }
  ];

  return (
    <div style={{ background: token.colorBgContainer, minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section - Split Layout */}
      <div style={{ 
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`, 
        padding: screens.md ? '120px 0 80px' : '60px 0 40px',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: screens.md ? 600 : 300, height: screens.md ? 600 : 300, background: `radial-gradient(circle, ${token.colorPrimaryBg} 0%, rgba(255,255,255,0) 70%)`, borderRadius: '50%' }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={11}>
              <Tag color="blue" style={{ marginBottom: 16, padding: '4px 12px', borderRadius: 20 }}>v1.0.0 正式发布</Tag>
              <Title level={1} style={{ fontSize: screens.md ? 56 : 36, marginBottom: 24, fontWeight: 800, lineHeight: 1.1 }}>
                让开服变得<br/>
                <span style={{ color: token.colorPrimary }}>前所未有的简单</span>
              </Title>
              <Paragraph style={{ fontSize: screens.md ? 18 : 16, color: token.colorTextSecondary, marginBottom: 40, lineHeight: 1.8 }}>
                ZMSL 是一款集成了服务器管理、环境配置、内网穿透于一体的现代化 Minecraft 开服工具。
                无论你是新手还是专家，都能在这里找到极致的体验。
              </Paragraph>
              <Space size="middle" wrap>
                <Link href="/download">
                  <Button type="primary" size="large" icon={<CloudDownloadOutlined />} style={{ height: 52, padding: '0 32px', fontSize: 16, borderRadius: 8 }}>
                    立即免费下载
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="large" icon={<PlayCircleFilled />} style={{ height: 52, padding: '0 32px', fontSize: 16, borderRadius: 8 }}>
                    快速开始
                  </Button>
                </Link>
              </Space>
              <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorText }}>10k+</div>
                  <div style={{ color: token.colorTextSecondary }}>累计下载</div>
                </div>
                <div style={{ width: 1, background: token.colorSplit }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorText }}>500+</div>
                  <div style={{ color: token.colorTextSecondary }}>在线服务器</div>
                </div>
                <div style={{ width: 1, background: token.colorSplit }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorText }}>99.9%</div>
                  <div style={{ color: token.colorTextSecondary }}>稳定性</div>
                </div>
              </div>
            </Col>
            
            {/* Visual Composition */}
            <Col xs={24} lg={13} style={{ position: 'relative', display: screens.md ? 'block' : 'none' }}>
               <div style={{ position: 'relative', height: 500 }}>
                 {/* Back Layer - Console */}
                 <div style={{ position: 'absolute', top: 0, right: 0, width: '90%', height: 380, zIndex: 1, transform: 'translate(10px, -10px)' }}>
                   <MockConsoleWindow />
                 </div>
                 
                 {/* Middle Layer - Stats */}
                 <div style={{ position: 'absolute', bottom: 40, left: 0, width: 260, zIndex: 3 }}>
                   <MockStatsCard />
                 </div>

                 {/* Front Layer - Server List */}
                 <div style={{ position: 'absolute', top: 120, right: 40, width: 340, zIndex: 2 }}>
                    <div style={{ background: token.colorBgContainer, opacity: 0.95, backdropFilter: 'blur(10px)', padding: 16, borderRadius: 12, boxShadow: token.boxShadowSecondary, border: `1px solid ${token.colorBorderSecondary}` }}>
                      <Title level={5} style={{ marginBottom: 16 }}>我的服务器</Title>
                      <MockServerCard name="Survival World" version="1.20.4" status="running" players="12/20" />
                      <MockServerCard name="Creative Plot" version="1.19.2" status="stopped" players="0/50" />
                      <Button type="primary" block icon={<PlusOutlined />}>创建新服务器</Button>
                    </div>
                 </div>
               </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Feature Deep Dive Section - Zig Zag */}
      <div style={{ padding: screens.md ? '100px 0' : '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          
          {/* Feature 1 */}
          <Row gutter={[64, 48]} align="middle" style={{ marginBottom: screens.md ? 120 : 60 }}>
            <Col xs={24} md={12}>
               <div style={{ padding: 24, background: token.colorFillQuaternary, borderRadius: 24 }}>
                 <MockConsoleWindow />
               </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ paddingLeft: screens.md ? 20 : 0 }}>
                <Tag color="orange" style={{ marginBottom: 12 }} variant="filled">可视化管理</Tag>
                <Title level={2} style={{ marginBottom: 16, fontSize: screens.md ? 38 : 28 }}>全能控制台，<br/>尽在掌握</Title>
                <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary, lineHeight: 1.8 }}>
                  告别枯燥的黑框命令行。ZMSL 提供现代化、高颜值的可视化控制台。
                  实时监控服务器日志，支持语法高亮、命令自动补全。
                  同时集成 CPU 与内存占用监控，让您对服务器状态了如指掌。
                </Paragraph>
                <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleFilled style={{ color: token.colorPrimary }} /> <span>彩色日志输出，支持正则表达式过滤</span></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleFilled style={{ color: token.colorPrimary }} /> <span>实时性能图表监控</span></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleFilled style={{ color: token.colorPrimary }} /> <span>快捷指令预设，一键执行</span></li>
                </ul>
              </div>
            </Col>
          </Row>

          {/* Feature 2 */}
          <Row gutter={[64, 48]} align="middle" style={{ marginBottom: screens.md ? 120 : 60, flexDirection: screens.md ? 'row-reverse' : 'row' }}>
            <Col xs={24} md={12}>
               <div style={{ position: 'relative', padding: 40, background: token.colorPrimaryBg, borderRadius: 24, display: 'flex', justifyContent: 'center' }}>
                 <div style={{ width: '80%' }}>
                    <MockStatsCard />
                 </div>
                 <div style={{ position: 'absolute', bottom: -20, right: 40, background: token.colorBgContainer, padding: '12px 24px', borderRadius: 50, boxShadow: token.boxShadow, fontWeight: 'bold', color: token.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <GlobalOutlined /> 公网 IP 已连接
                 </div>
               </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ paddingRight: screens.md ? 20 : 0 }}>
                <Tag color="cyan" style={{ marginBottom: 12 }} variant="filled">内网穿透</Tag>
                <Title level={2} style={{ marginBottom: 16, fontSize: screens.md ? 38 : 28 }}>无需公网 IP，<br/>一键联机</Title>
                <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary, lineHeight: 1.8 }}>
                  内置高性能 FRP 客户端，完美解决家庭宽带无公网 IP 的痛点。
                  只需选择一个节点，即可生成专属连接地址，邀请好友加入游戏。
                  支持 TCP/UDP 协议，适配 Java 版与基岩版服务器。
                </Paragraph>
                <Button type="default" size="large" icon={<ArrowRightOutlined />}>查看节点列表</Button>
              </div>
            </Col>
          </Row>

           {/* Feature 3 */}
           <Row gutter={[64, 48]} align="middle">
            <Col xs={24} md={12}>
               <Card variant="borderless" style={{ background: token.colorErrorBg, borderRadius: 24, overflow: 'hidden' }}>
                 <Tabs 
                   defaultActiveKey="1" 
                   centered
                   items={[
                     { label: 'Paper', key: '1', children: <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><ThunderboltOutlined style={{ fontSize: 48, color: token.colorError, marginBottom: 16 }} /><Text strong>高性能优化核心</Text></div> },
                     { label: 'Fabric', key: '2', children: <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><CodeOutlined style={{ fontSize: 48, color: token.colorWarning, marginBottom: 16 }} /><Text strong>轻量级模组加载器</Text></div> },
                     { label: 'Forge', key: '3', children: <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><SettingFilled style={{ fontSize: 48, color: token.colorText, marginBottom: 16 }} /><Text strong>经典模组平台</Text></div> },
                   ]}
                 />
               </Card>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ paddingLeft: screens.md ? 20 : 0 }}>
                <Tag color="purple" style={{ marginBottom: 12 }} variant="filled">核心管理</Tag>
                <Title level={2} style={{ marginBottom: 16, fontSize: screens.md ? 38 : 28 }}>全版本核心支持，<br/>自动依赖补全</Title>
                <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary, lineHeight: 1.8 }}>
                  ZMSL 拥有强大的核心库，涵盖 Vanilla, Paper, Spigot, Forge, Fabric, NeoForge 等主流服务端核心。
                  支持从 1.7.10 到最新的 1.21+ 版本。选择核心后，系统会自动下载所需的 Java 环境（JDK 8/17/21）和运行库，真正做到开箱即用。
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Grid Features */}
      <div style={{ background: token.colorBgLayout, padding: screens.md ? '80px 0' : '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: screens.md ? 38 : 28 }}>更多实用功能</Title>
            <Text type="secondary">不仅仅是启动器，更是您的全能管家</Text>
          </div>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  hoverable 
                  style={{ height: '100%', borderRadius: 12, border: 'none' }}
                  styles={{ body: { padding: 32 } }}
                >
                  <div style={{ marginBottom: 20 }}>{feature.icon}</div>
                  <Title level={4} style={{ marginBottom: 12 }}>{feature.title}</Title>
                  <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 0 }}>{feature.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Workflow Section */}
      <div style={{ background: token.colorBgContainer, padding: screens.md ? '100px 0' : '60px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <Title level={2} style={{ fontSize: screens.md ? 36 : 28, marginBottom: 16 }}>三步开启您的服务器</Title>
            <Paragraph style={{ fontSize: 18, color: token.colorTextSecondary }}>无需专业知识，只需简单的三个步骤</Paragraph>
          </div>

          <Steps
            current={-1}
            type="default"
            items={[
              {
                title: '下载客户端',
                description: '获取最新版本的 ZMSL Windows 客户端并安装',
                icon: <CloudDownloadOutlined style={{ fontSize: 24 }} />,
              },
              {
                title: '创建服务器',
                description: '选择游戏版本和核心，一键下载并配置',
                icon: <ThunderboltOutlined style={{ fontSize: 24 }} />,
              },
              {
                title: '启动与联机',
                description: '点击启动，并通过 FRP 分享链接给好友',
                icon: <RocketOutlined style={{ fontSize: 24 }} />,
              },
            ]}
            style={{ marginBottom: 60 }}
          />
        </div>
      </div>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <div style={{ padding: '100px 0', background: token.colorBgContainer }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ fontSize: screens.md ? 36 : 28, marginBottom: 16, color: token.colorPrimary, fontWeight: 600, textAlign: 'center' }}>
              听听服主们怎么说
            </Title>
            <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary, maxWidth: 700, margin: '0 auto 60px', textAlign: 'center' }}>
              来自 ZMSL 社区的真实反馈，无论是公开服还是三五好友的联机游玩，ZMSL 都能完美胜任。
            </Paragraph>
            
            <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto' }}>
              {/* Carousel Container */}
              <div style={{ overflow: 'hidden', padding: '20px 0' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px',
                    transform: `translateX(calc(50% - ${(currentSlide + 1) * (400 + 40)}px - 200px))`,
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* 第一张卡片（最后一张的克隆，用于循环） */}
                  <div
                    style={{
                      width: '400px',
                      flexShrink: 0,
                      opacity: currentSlide === 0 ? 0.5 : 0,
                      transform: currentSlide === 0 ? 'scale(0.9)' : 'scale(0.8)',
                      filter: currentSlide === 0 ? 'blur(1px)' : 'blur(4px)',
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Card
                      style={{
                        borderRadius: 20,
                        border: '2px solid transparent',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        background: token.colorBgContainer,
                      }}
                      bodyStyle={{ padding: '32px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                        <Avatar
                          src={`https://q1.qlogo.cn/g?b=qq&nk=${testimonials[testimonials.length - 1]?.qq}&s=640`}
                          size={80}
                          style={{ border: `4px solid ${token.colorBgContainer}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <Text strong style={{ fontSize: 18, color: token.colorText, display: 'block', marginBottom: 6 }}>
                            {testimonials[testimonials.length - 1]?.name}
                          </Text>
                          <Text style={{ fontSize: 13, color: token.colorTextSecondary, display: 'block', marginBottom: 16 }}>
                            {testimonials[testimonials.length - 1]?.subtitle || 'Minecraft 服主'}
                          </Text>
                          <Paragraph style={{ fontSize: 14, color: token.colorTextSecondary, margin: 0, lineHeight: 1.8, textAlign: 'left' }}>
                            {testimonials[testimonials.length - 1]?.content}
                          </Paragraph>
                        </div>
                        <div style={{ fontSize: '60px', color: token.colorPrimaryBg, lineHeight: 0, fontFamily: 'Georgia, serif', alignSelf: 'flex-end', marginRight: '8px' }}>"</div>
                      </div>
                    </Card>
                  </div>
                  
                  {/* 中间的卡片 */}
                  {testimonials.map((item, index) => {
                    const isActive = index === currentSlide;
                    const offset = Math.abs(index - currentSlide);
                    const isHidden = offset > 1;
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          width: '400px',
                          flexShrink: 0,
                          opacity: isHidden ? 0 : (isActive ? 1 : 0.5),
                          transform: isHidden ? 'scale(0.8)' : (isActive ? 'scale(1)' : 'scale(0.9)'),
                          filter: isActive ? 'none' : (isHidden ? 'blur(4px)' : 'blur(1px)'),
                          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                      >
                        <Card
                          style={{
                            borderRadius: 20,
                            border: isActive ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
                            boxShadow: isActive 
                              ? `0 20px 60px ${token.colorPrimaryBgHover}` 
                              : '0 4px 12px rgba(0, 0, 0, 0.05)',
                            background: token.colorBgContainer,
                            overflow: 'visible',
                          }}
                          bodyStyle={{ padding: '32px' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                            <div style={{ position: 'relative' }}>
                              <Avatar
                                src={`https://q1.qlogo.cn/g?b=qq&nk=${item.qq}&s=640`}
                                size={80}
                                style={{ 
                                  border: `4px solid ${token.colorBgContainer}`,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                              />
                              {isActive && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: -4,
                                    left: -4,
                                    right: -4,
                                    bottom: -4,
                                    borderRadius: '50%',
                                    border: `2px solid ${token.colorPrimary}`,
                                  }}
                                />
                              )}
                            </div>
                            
                            <div style={{ textAlign: 'center', width: '100%' }}>
                              <Text strong style={{ fontSize: 18, color: token.colorText, display: 'block', marginBottom: 6 }}>
                                {item.name}
                              </Text>
                              <Text style={{ fontSize: 13, color: token.colorTextSecondary, display: 'block', marginBottom: 16 }}>
                                {item.subtitle || 'Minecraft 服主'}
                              </Text>
                              <Paragraph style={{ 
                                fontSize: 14, 
                                color: token.colorTextSecondary, 
                                margin: 0, 
                                lineHeight: 1.8,
                                textAlign: 'left',
                              }}>
                                {item.content}
                              </Paragraph>
                            </div>
                            
                            <div style={{ 
                              fontSize: '60px', 
                              color: token.colorPrimaryBg, 
                              lineHeight: 0,
                              fontFamily: 'Georgia, serif',
                              alignSelf: 'flex-end',
                              marginRight: '8px',
                            }}>
                              "
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                  
                  {/* 最后一张卡片（第一张的克隆，用于循环） */}
                  <div
                    style={{
                      width: '400px',
                      flexShrink: 0,
                      opacity: currentSlide === testimonials.length - 1 ? 0.5 : 0,
                      transform: currentSlide === testimonials.length - 1 ? 'scale(0.9)' : 'scale(0.8)',
                      filter: currentSlide === testimonials.length - 1 ? 'blur(1px)' : 'blur(4px)',
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Card
                      style={{
                        borderRadius: 20,
                        border: '2px solid transparent',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        background: token.colorBgContainer,
                      }}
                      bodyStyle={{ padding: '32px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                        <Avatar
                          src={`https://q1.qlogo.cn/g?b=qq&nk=${testimonials[0]?.qq}&s=640`}
                          size={80}
                          style={{ border: `4px solid ${token.colorBgContainer}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <Text strong style={{ fontSize: 18, color: token.colorText, display: 'block', marginBottom: 6 }}>
                            {testimonials[0]?.name}
                          </Text>
                          <Text style={{ fontSize: 13, color: token.colorTextSecondary, display: 'block', marginBottom: 16 }}>
                            {testimonials[0]?.subtitle || 'Minecraft 服主'}
                          </Text>
                          <Paragraph style={{ fontSize: 14, color: token.colorTextSecondary, margin: 0, lineHeight: 1.8, textAlign: 'left' }}>
                            {testimonials[0]?.content}
                          </Paragraph>
                        </div>
                        <div style={{ fontSize: '60px', color: token.colorPrimaryBg, lineHeight: 0, fontFamily: 'Georgia, serif', alignSelf: 'flex-end', marginRight: '8px' }}>"</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                <button
                  onClick={handlePrev}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: token.colorBgContainer,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: token.colorTextSecondary,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = token.colorPrimary;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = token.colorBgContainer;
                    e.currentTarget.style.color = token.colorTextSecondary;
                  }}
                >
                  ‹
                </button>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => handleDotClick(index)}
                      style={{
                        width: index === currentSlide ? '32px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: index === currentSlide ? token.colorPrimary : token.colorBorderSecondary,
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
                
                <button
                  onClick={handleNext}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: token.colorBgContainer,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: token.colorTextSecondary,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = token.colorPrimary;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = token.colorBgContainer;
                    e.currentTarget.style.color = token.colorTextSecondary;
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component
const PlusOutlinedIcon = () => <span style={{ marginRight: 8 }}>+</span>;
