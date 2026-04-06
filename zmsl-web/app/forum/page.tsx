'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Typography, Card, Row, Col, List, Avatar, Tag, Space, Button, Spin, Empty, Breadcrumb, Pagination, Modal, Form, Input, Select, message, theme } from 'antd';
import { TeamOutlined, MessageOutlined, EyeOutlined, LikeOutlined, LikeFilled, StarOutlined, StarFilled, EditOutlined, SendOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';

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

interface ForumPost {
  id: number;
  categoryId: number;
  categoryName: string;
  userId: number;
  username: string;
  avatarUrl: string;
  title: string;
  content: string;
  contentHtml: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isLocked: boolean;
  status: string;
  createdAt: string;
  isLiked: boolean;
  isFavorited: boolean;
}

interface ForumComment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  avatarUrl: string;
  parentId: number;
  rootId: number;
  replyToUserId: number;
  replyToUsername: string;
  depth: number;
  content: string;
  contentHtml: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: string;
  isLiked: boolean;
  replies: ForumComment[];
}

interface CreateCommentRequest {
  postId: number;
  content: string;
  parentId?: number;
}

const getAvatarSrc = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_HOST || 'https://msl.v2.zhsdev.top'}${url}`;
};

function ForumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('post');
  const categoryIdParam = searchParams.get('category');
  const { token } = theme.useToken();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [createCommentModalOpen, setCreateCommentModalOpen] = useState(false);
  const [replyToComment, setReplyToComment] = useState<ForumComment | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [quickCommentContent, setQuickCommentContent] = useState('');
  const [inlineReplyContent, setInlineReplyContent] = useState('');
  const [inlineReplyTo, setInlineReplyTo] = useState<ForumComment | null>(null);
  const [createCommentForm] = Form.useForm<CreateCommentRequest>();
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!postId) {
      loadCategories();
      loadPosts();
    }
  }, [postId, categoryIdParam]);

  useEffect(() => {
    if (postId) {
      loadPost(postId);
      loadComments(postId);
    }
  }, [postId]);

  const loadCategories = async () => {
    try {
      const data = await fetchApi('/forum/categories');
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPosts = async (page = 1) => {
    setLoading(true);
    try {
      const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined;
      const endpoint = categoryId ? `/forum/posts?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}` : `/forum/posts?page=${page}&pageSize=${pageSize}`;
      const data = await fetchApi(endpoint);
      if (data.success) {
        setPosts(data.data.items || []);
        setTotalPosts(data.data.totalCount);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async (id: string) => {
    setPostLoading(true);
    try {
      const data = await fetchApi(`/forum/posts/${id}`);
      if (data.success) {
        setCurrentPost(data.data);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setPostLoading(false);
    }
  };

  const loadComments = async (postId: string, page = 1) => {
    try {
      const data = await fetchApi(`/forum/posts/${postId}/comments?page=${page}&pageSize=50`);
      if (data.success) {
        setComments(data.data.items || []);
        setTotalComments(data.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleCreateComment = async (isQuickComment = false, isInlineReply = false) => {
    if (!user) {
      message.warning('请先登录');
      router.push('/dashboard/login');
      return;
    }

    const content = isQuickComment ? quickCommentContent : (isInlineReply ? inlineReplyContent : commentContent);
    if (!content || content.trim() === '') {
      message.error('请输入评论内容');
      return;
    }

    try {
      setSubmitting(true);
      const request: CreateCommentRequest = {
        postId: currentPost!.id,
        content: content,
      };
      if (replyToComment && !isQuickComment && !isInlineReply) {
        request.parentId = replyToComment.id;
      }
      if (inlineReplyTo && isInlineReply) {
        request.parentId = inlineReplyTo.id;
      }
      const data = await fetchApi('/forum/comments', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (data.success) {
        message.success('评论发布成功');
        if (isQuickComment) {
          setQuickCommentContent('');
        } else if (isInlineReply) {
          setInlineReplyContent('');
          setInlineReplyTo(null);
        } else {
          setCreateCommentModalOpen(false);
          setReplyToComment(null);
          setCommentContent('');
          createCommentForm.resetFields();
        }
        loadComments(currentPost!.id.toString());
      }
    } catch (error: any) {
      message.error(error.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      const data = await fetchApi(`/forum/posts/${postId}/like`, { method: 'POST' });
      if (data.success) {
        setCurrentPost(prev => prev ? { ...prev, isLiked: data.data.isLiked, likeCount: data.data.isLiked ? prev.likeCount + 1 : prev.likeCount - 1 } : null);
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleFavoritePost = async (postId: number) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      const data = await fetchApi(`/forum/posts/${postId}/favorite`, { method: 'POST' });
      if (data.success) {
        setCurrentPost(prev => prev ? { ...prev, isFavorited: data.data.isFavorited, favoriteCount: data.data.isFavorited ? prev.favoriteCount + 1 : prev.favoriteCount - 1 } : null);
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      const data = await fetchApi(`/forum/comments/${commentId}/like`, { method: 'POST' });
      if (data.success) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLiked: data.data.isLiked, likeCount: data.data.isLiked ? c.likeCount + 1 : c.likeCount - 1 } : c));
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (postId) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        <Breadcrumb
          items={[
            { title: <Link href="/forum">论坛</Link> },
            { title: currentPost?.categoryName || '帖子' },
            { title: currentPost?.title || '加载中...' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {postLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : currentPost ? (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar size={40} src={getAvatarSrc(currentPost.avatarUrl)} icon={<UserOutlined />} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    <Text strong>{currentPost.username}</Text>
                    {currentPost.isPinned && <Tag color="red" style={{ fontSize: 12 }}>置顶</Tag>}
                    {currentPost.isFeatured && <Tag color="gold" style={{ fontSize: 12 }}>精华</Tag>}
                    {currentPost.isLocked && <Tag color="default" style={{ fontSize: 12 }}>锁定</Tag>}
                  </div>
                  <Title level={4} ellipsis={{ rows: 2 }} style={{ marginBottom: 12, fontSize: 18 }}>{currentPost.title}</Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: token.colorTextSecondary, fontSize: 13, marginBottom: 12 }}>
                    <span><TeamOutlined /> {currentPost.categoryName}</span>
                    <span><EyeOutlined /> {currentPost.viewCount}</span>
                    <span><MessageOutlined /> {currentPost.commentCount}</span>
                    <span>{formatDate(currentPost.createdAt)}</span>
                  </div>
                  <Card
                    style={{
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      marginBottom: 16
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div className="markdown-body" style={{ maxHeight: 500, overflow: 'auto' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentPost.content}</ReactMarkdown>
                    </div>
                  </Card>
                  <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${token.colorBorderSecondary}`, flexWrap: 'wrap' }}>
                    <Button
                      type={currentPost.isLiked ? 'primary' : 'default'}
                      icon={currentPost.isLiked ? <LikeFilled /> : <LikeOutlined />}
                      onClick={() => handleLikePost(currentPost.id)}
                      size="small"
                    >
                      {currentPost.likeCount}
                    </Button>
                    <Button
                      type={currentPost.isFavorited ? 'primary' : 'default'}
                      icon={currentPost.isFavorited ? <StarFilled /> : <StarOutlined />}
                      onClick={() => handleFavoritePost(currentPost.id)}
                      size="small"
                    >
                      {currentPost.favoriteCount}
                    </Button>
                    
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title={`评论 (${totalComments})`}
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                <TextArea
                  value={quickCommentContent}
                  onChange={(e) => setQuickCommentContent(e.target.value)}
                  placeholder="写下你的评论..."
                  rows={2}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{ resize: 'none', marginBottom: 12 }}
                  onPressEnter={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      handleCreateComment(true);
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {quickCommentContent.length} 字
                  </Text>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={() => handleCreateComment(true)}
                    loading={submitting}
                    disabled={!quickCommentContent.trim()}
                    size="small"
                  >
                    发送
                  </Button>
                </div>
              </div>
              {comments.length > 0 ? (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <>
                      <List.Item
                        key={comment.id}
                        style={{ 
                          padding: '16px',
                          borderBottom: `1px dashed ${token.colorBorderSecondary}`
                        }}
                        actions={[
                          <Button
                            key="like"
                            type="text"
                            size="small"
                            icon={comment.isLiked ? <LikeFilled /> : <LikeOutlined />}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            {comment.likeCount}
                          </Button>,
                          <Button
                            key="reply"
                            type="text"
                            size="small"
                            onClick={() => {
                              if (!user) {
                                message.warning('请先登录');
                                router.push('/dashboard/login');
                                return;
                              }
                              if (inlineReplyTo?.id === comment.id) {
                                setInlineReplyTo(null);
                                setInlineReplyContent('');
                              } else {
                                setInlineReplyTo(comment);
                                setInlineReplyContent('');
                              }
                            }}
                          >
                            回复
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={getAvatarSrc(comment.avatarUrl)} icon={<UserOutlined />} />}
                          title={
                            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                                <Text strong>{comment.username}</Text>
                                {comment.replyToUsername && <Text type="secondary" style={{ fontSize: 12 }}>回复 @{comment.replyToUsername}</Text>}
                                <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(comment.createdAt)}</Text>
                              </div>
                            </Space>
                          }
                          description={
                            <>
                              <div style={{ marginTop: 8, color: token.colorText, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {DOMPurify.sanitize(comment.content)}
                              </div>
                              {inlineReplyTo?.id === comment.id && (
                                <div style={{ marginTop: 12, padding: 12, background: token.colorBgContainer, borderRadius: 8, border: `1px solid ${token.colorBorderSecondary}` }}>
                                  <TextArea
                                    value={inlineReplyContent}
                                    onChange={(e) => setInlineReplyContent(e.target.value)}
                                    placeholder={`回复 @${comment.username}...`}
                                    rows={2}
                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                    style={{ resize: 'none', marginBottom: 8 }}
                                    autoFocus
                                    onPressEnter={(e) => {
                                      if (e.ctrlKey || e.metaKey) {
                                        e.preventDefault();
                                        handleCreateComment(false, true);
                                      }
                                    }}
                                  />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {inlineReplyContent.length} 字
                                    </Text>
                                    <Space size="small">
                                      <Button 
                                        size="small"
                                        onClick={() => {
                                          setInlineReplyTo(null);
                                          setInlineReplyContent('');
                                        }}
                                      >
                                        取消
                                      </Button>
                                      <Button 
                                        type="primary" 
                                        size="small"
                                        icon={<SendOutlined />} 
                                        onClick={() => handleCreateComment(false, true)}
                                        loading={submitting}
                                        disabled={!inlineReplyContent.trim()}
                                      >
                                        发送
                                      </Button>
                                    </Space>
                                  </div>
                                </div>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ paddingLeft: '16vw', paddingBottom: 12 }}>
                          {comment.replies.map((reply) => (
                            <List.Item
                              key={reply.id}
                              style={{ 
                                padding: '12px 0',
                                borderBottom: `1px dashed ${token.colorBorderSecondary}`
                              }}
                              actions={[
                                <Button
                                  key="like"
                                  type="text"
                                  size="small"
                                  icon={reply.isLiked ? <LikeFilled /> : <LikeOutlined />}
                                  onClick={() => handleLikeComment(reply.id)}
                                >
                                  {reply.likeCount}
                                </Button>,
                                <Button
                                  key="reply"
                                  type="text"
                                  size="small"
                                  onClick={() => {
                                    if (!user) {
                                      message.warning('请先登录');
                                      router.push('/dashboard/login');
                                      return;
                                    }
                                    if (inlineReplyTo?.id === reply.id) {
                                      setInlineReplyTo(null);
                                      setInlineReplyContent('');
                                    } else {
                                      setInlineReplyTo(reply);
                                      setInlineReplyContent('');
                                    }
                                  }}
                                >
                                  回复
                                </Button>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={<Avatar size={32} src={getAvatarSrc(reply.avatarUrl)} icon={<UserOutlined />} />}
                                title={
                                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                                      <Text strong>{reply.username}</Text>
                                      {reply.replyToUsername && <Text type="secondary" style={{ fontSize: 12 }}>回复 @{reply.replyToUsername}</Text>}
                                      <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(reply.createdAt)}</Text>
                                    </div>
                                  </Space>
                                }
                                description={
                                  <>
                                    <div style={{ marginTop: 6, color: token.colorText, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
                                      {DOMPurify.sanitize(reply.content)}
                                    </div>
                                    {inlineReplyTo?.id === reply.id && (
                                      <div style={{ marginTop: 10, padding: 10, background: token.colorBgContainer, borderRadius: 6, border: `1px solid ${token.colorBorderSecondary}` }}>
                                        <TextArea
                                          value={inlineReplyContent}
                                          onChange={(e) => setInlineReplyContent(e.target.value)}
                                          placeholder={`回复 @${reply.username}...`}
                                          rows={2}
                                          autoSize={{ minRows: 2, maxRows: 6 }}
                                          style={{ resize: 'none', marginBottom: 8 }}
                                          autoFocus
                                          onPressEnter={(e) => {
                                            if (e.ctrlKey || e.metaKey) {
                                              e.preventDefault();
                                              handleCreateComment(false, true);
                                            }
                                          }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Text type="secondary" style={{ fontSize: 11 }}>
                                            {inlineReplyContent.length} 字
                                          </Text>
                                          <Space size="small">
                                            <Button 
                                              size="small"
                                              onClick={() => {
                                                setInlineReplyTo(null);
                                                setInlineReplyContent('');
                                              }}
                                            >
                                              取消
                                            </Button>
                                            <Button 
                                              type="primary" 
                                              size="small"
                                              icon={<SendOutlined />} 
                                              onClick={() => handleCreateComment(false, true)}
                                              loading={submitting}
                                              disabled={!inlineReplyContent.trim()}
                                            >
                                              发送
                                            </Button>
                                          </Space>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                }
                              />
                            </List.Item>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                />
              ) : (
                <Empty description="暂无评论，来抢沙发吧！" style={{ padding: 40 }} />
              )}
            </Card>
          </div>
        ) : (
          <Empty description="帖子不存在" />
        )}

        <Modal
          title={replyToComment ? `回复 @${replyToComment.username}` : '发表评论'}
          open={createCommentModalOpen}
          onCancel={() => {
            setCreateCommentModalOpen(false);
            setReplyToComment(null);
            setCommentContent('');
            createCommentForm.resetFields();
          }}
          footer={null}
        >
          <Form form={createCommentForm} layout="vertical">
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入评论内容' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入评论内容"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                style={{ resize: 'none' }}
                onPressEnter={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    handleCreateComment(false);
                  }
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setCreateCommentModalOpen(false);
                  setReplyToComment(null);
                  setCommentContent('');
                  createCommentForm.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" onClick={() => handleCreateComment(false)} loading={submitting} icon={<SendOutlined />}>
                  发布评论
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <Title level={4} style={{ margin: 0, fontSize: 20 }}>社区论坛</Title>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => {
            if (!user) {
              message.warning('请先登录');
              router.push('/dashboard/login');
              return;
            }
            router.push('/forum/create');
          }}
          size="small"
        >
          发帖
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Card title="论坛分区" style={{ marginBottom: 16 }}>
            <List
              dataSource={[{ id: null, name: '全部', description: '查看所有帖子', postCount: totalPosts }, ...categories]}
              renderItem={(category) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '10px 0' }}
                  onClick={() => {
                    if (category.id === null) {
                      router.push('/forum');
                    } else {
                      router.push(`/forum?category=${category.id}`);
                    }
                  }}
                >
                  <List.Item.Meta
                    title={<Text strong={categoryIdParam === category.id?.toString()}>{category.name}</Text>}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {category.description} · {category.id === null ? totalPosts : category.postCount} 帖
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : posts.length > 0 ? (
            <Card>
              <List
                dataSource={posts}
                renderItem={(post) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '16px 0' }}
                    onClick={() => router.push(`/forum?post=${post.id}`)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar size={40} src={getAvatarSrc(post.avatarUrl)} icon={<UserOutlined />} />}
                      title={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                            <Text strong ellipsis style={{ fontSize: 15, maxWidth: '100%' }}>{post.title}</Text>
                            {post.isPinned && <Tag color="red" style={{ fontSize: 11 }}>置顶</Tag>}
                            {post.isFeatured && <Tag color="gold" style={{ fontSize: 11 }}>精华</Tag>}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
                            <Tag style={{ fontSize: 11 }}>{post.categoryName}</Tag>
                            <Text type="secondary">{post.username}</Text>
                            <Text type="secondary">{formatDate(post.createdAt)}</Text>
                            <Text type="secondary"><EyeOutlined /> {post.viewCount}</Text>
                            <Text type="secondary"><MessageOutlined /> {post.commentCount}</Text>
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: 'center', marginTop: 16, overflowX: 'auto' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalPosts}
                  onChange={loadPosts}
                  showSizeChanger={false}
                  responsive
                />
              </div>
            </Card>
          ) : (
            <Empty description="暂无帖子" />
          )}
        </Col>
      </Row>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    }>
      <ForumContent />
    </Suspense>
  );
}