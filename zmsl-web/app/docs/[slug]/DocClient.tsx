'use client';

import React from 'react';
import { Typography, theme } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'github-markdown-css/github-markdown.css';

const { Text } = Typography;

interface DocClientProps {
  doc: {
    title: string;
    content: string;
    updatedAt: string;
    [key: string]: any;
  };
}

export default function DocClient({ doc }: DocClientProps) {
  const { token } = theme.useToken();
  return (
    <div className="markdown-body" style={{ background: 'transparent' }}>
      <h1 style={{ borderBottom: `1px solid ${token.colorBorderSecondary}`, paddingBottom: '0.3em', marginBottom: 16 }}>{doc.title}</h1>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        最后更新: {new Date(doc.updatedAt).toLocaleDateString()}
      </Text>
      
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={{
           // Customize link rendering if needed
           a: ({node, ...props}) => <a {...props} style={{ color: token.colorPrimary }} />
        }}
      >
        {doc.content}
      </ReactMarkdown>
      
      <div style={{ marginTop: 60, paddingTop: 20, borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between' }}>
        {/* Navigation logic can be added here (Next/Prev) */}
      </div>
    </div>
  );
}
