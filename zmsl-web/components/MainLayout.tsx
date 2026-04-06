'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, theme, Avatar, Dropdown, Typography, Grid, Drawer } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GithubOutlined, UserOutlined, LogoutOutlined, DashboardOutlined, MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { API_BASE_URL } from '@/lib/api';
import ThemeToggle from './ThemeToggle';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const API_HOST = API_BASE_URL.replace(/\/api$/, '');

const getAvatarSrc = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_HOST}${url}`;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();
  const [user, setUser] = useState<any>(null);
  const screens = useBreakpoint();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    } else {
      setUser(null);
    }
  }, [pathname]); // Re-check when route changes (e.g. after login/logout)

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/dashboard/login');
  };
  
  const getSelectedKey = () => {
    if (pathname === '/') return ['1'];
    if (pathname?.startsWith('/download')) return ['2'];
    if (pathname?.startsWith('/updates')) return ['3'];
    if (pathname?.startsWith('/docs')) return ['4'];
    if (pathname?.startsWith('/forum')) return ['6'];
    if (pathname?.startsWith('/donate')) return ['7'];
    if (pathname?.startsWith('/dashboard')) return ['5'];
    return ['1'];
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: <Link href="/dashboard">控制台</Link>,
      icon: <DashboardOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    { key: '1', label: <Link href="/">首页</Link> },
    { key: '2', label: <Link href="/download">下载</Link> },
    { key: '3', label: <Link href="/updates">更新日志</Link> },
    { key: '4', label: <Link href="/docs">文档</Link> },
    { key: '6', label: <Link href="/forum">论坛</Link> },
    { key: '7', label: <Link href="/donate">赞助</Link> },
    { key: '5', label: <Link href="/dashboard">用户中心</Link> },
  ];

  return (
    <Layout className="layout" style={{ minHeight: '100vh', background: token.colorBgContainer }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: token.colorBgContainer, 
        borderBottom: `1px solid ${token.colorBorderSecondary}`, 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%',
        height: 64,
        padding: screens.md ? '0 24px' : '0 16px',
        boxShadow: token.boxShadowTertiary
      }}>
        <div className="logo" style={{ fontSize: '22px', fontWeight: 800, color: token.colorPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="ZMSL" style={{ height: 32, width: 'auto' }} />
          </Link>
        </div>
        
        {screens.md ? (
          <>
            <div style={{ flex: 1, marginLeft: 40 }}>
               <Menu
                mode="horizontal"
                selectedKeys={getSelectedKey()}
                style={{ borderBottom: 'none', background: 'transparent', fontSize: 16 }}
                items={menuItems}
              />
            </div>
            <Space size="middle">
               <ThemeToggle />
               <Button type="text" icon={<GithubOutlined />} href="https://github.com" target="_blank" />
               
               {user ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, transition: 'all 0.3s' }} className="user-dropdown-trigger">
                    <Avatar style={{ backgroundColor: token.colorPrimary }} src={getAvatarSrc(user.avatarUrl)} icon={<UserOutlined />} size="small" />
                    <Text strong style={{ fontSize: 14 }}>{user.username}</Text>
                  </div>
                </Dropdown>
              ) : (
                 <Link href="/dashboard/login">
                   <Button type="primary" ghost>登录 / 注册</Button>
                 </Link>
               )}
            </Space>
          </>
        ) : (
          <>
            <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} size="large" />
            <Drawer
              title="菜单"
              placement="right"
              onClose={() => setMobileMenuOpen(false)}
              open={mobileMenuOpen}
              styles={{ body: { padding: 0 }, wrapper: { width: 280 } }}
            >
              <Menu
                mode="inline"
                selectedKeys={getSelectedKey()}
                items={menuItems}
                style={{ border: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <div style={{ padding: 16, borderTop: `1px solid ${token.colorBorderSecondary}`, marginTop: 16 }}>
                 {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar style={{ backgroundColor: token.colorPrimary }} src={getAvatarSrc(user.avatarUrl)} icon={<UserOutlined />} />
                        <div>
                          <Text strong style={{ display: 'block' }}>{user.username}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>已登录</Text>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button block icon={<DashboardOutlined />}>控制台</Button>
                      </Link>
                      <Button block danger icon={<LogoutOutlined />} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>退出登录</Button>
                    </div>
                  ) : (
                    <Link href="/dashboard/login" onClick={() => setMobileMenuOpen(false)}>
                       <Button type="primary" block size="large">登录 / 注册</Button>
                    </Link>
                  )}
              </div>
            </Drawer>
          </>
        )}
      </Header>
      
      <Content style={{ marginTop: 0 }}>
        <div style={{ minHeight: 380 }}>
          {children}
        </div>
      </Content>

      {!pathname?.startsWith('/dashboard') && (
      <Footer style={{ textAlign: 'center', background: token.colorBgLayout, padding: '60px 0', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 40 }}>
            <div style={{ maxWidth: 300, marginBottom: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: token.colorText }}>ZMSL</div>
              <div style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
                致力于为 Minecraft 玩家提供最优质的服务器管理与联机体验。
              </div>
            </div>
            <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: token.colorText }}>产品</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link href="/download" style={{ color: token.colorTextSecondary }}>客户端下载</Link>
                  <Link href="/updates" style={{ color: token.colorTextSecondary }}>更新日志</Link>
                  <Link href="/dashboard" style={{ color: token.colorTextSecondary }}>用户中心</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: token.colorText }}>资源</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link href="/docs" style={{ color: token.colorTextSecondary }}>文档中心</Link>
                  <Link href="/forum" style={{ color: token.colorTextSecondary }}>社区论坛</Link>
                  <Link href="https://github.com/ZIserver" target="_blank" style={{ color: token.colorTextSecondary }}>GitHub</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: token.colorText }}>关于</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link href="/about" style={{ color: token.colorTextSecondary }}>关于我们</Link>
                  <Link href="/contact" style={{ color: token.colorTextSecondary }}>联系方式</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 20, borderTop: `1px solid ${token.colorBorderSecondary}`, textAlign: 'center', color: token.colorTextTertiary }}>
            © {new Date().getFullYear()} ZMSL Team. All rights reserved.
          </div>
        </div>
      </Footer>
      )}
    </Layout>
  );
};

export default MainLayout;
