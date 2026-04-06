'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin, Breadcrumb, Button, Drawer, theme } from 'antd';
import { MenuOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface DocNode {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
}

interface DocCategory {
  id: number;
  name: string;
  sortOrder: number;
  documents: DocNode[];
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchApi('/docs/nav')
      .then(res => {
        if (res.success) {
          setCategories(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Determine selected keys based on current path
  const currentSlug = pathname?.split('/').pop() || '';
  
  // Find current doc title for breadcrumb
  let currentDocTitle = '';
  let currentCategoryName = '';
  
  categories.forEach(cat => {
    cat.documents.forEach(doc => {
      if (doc.slug === currentSlug) {
        currentDocTitle = doc.title;
        currentCategoryName = cat.name;
      }
    });
  });

  const menuItems = categories.map(cat => ({
    key: `cat-${cat.id}`,
    label: cat.name,
    type: 'group' as const,
    children: cat.documents.map(doc => ({
      key: doc.slug,
      label: <Link href={`/docs/${doc.slug}`}>{doc.title}</Link>,
    })),
  }));

  const SidebarContent = () => (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 0' }}>
       <Menu
        mode="inline"
        selectedKeys={[currentSlug]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)', background: token.colorBgContainer }}>
      {/* Desktop Sidebar */}
      <Sider
        width={280}
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          // console.log(broken);
        }}
        trigger={null}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          position: 'fixed',
          left: 0,
          top: 64, // Below header
          bottom: 0,
          zIndex: 10,
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          // display: { xs: 'none', lg: 'block' } // Removed invalid style property
        }}
        className="docs-sider"
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Menu Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ header: { display: 'none' }, body: { padding: 0 }, wrapper: { width: 280 } }}
      >
        <SidebarContent />
      </Drawer>

      <Layout style={{ marginLeft: 280, transition: 'all 0.2s' }} className="docs-content-layout">
        <Content style={{ padding: '24px 48px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
          
          {/* Mobile Menu Trigger */}
          <div className="docs-mobile-trigger" style={{ marginBottom: 16, display: 'none' }}>
             <Button icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)}>
               目录
             </Button>
          </div>

          <style jsx global>{`
            @media (max-width: 992px) {
              .docs-sider {
                display: none !important;
              }
              .docs-content-layout {
                margin-left: 0 !important;
              }
              .docs-mobile-trigger {
                display: block !important;
              }
            }
          `}</style>

          {currentDocTitle && (
            <Breadcrumb 
              items={[
                { title: '文档' },
                { title: currentCategoryName },
                { title: currentDocTitle },
              ]}
              style={{ marginBottom: 24 }}
            />
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ minHeight: 400 }}>
              {children}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
