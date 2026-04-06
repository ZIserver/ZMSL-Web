'use client';

import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  InputNumber,
  Avatar,
  Dropdown,
  Alert,
  Tooltip,
  QRCode,
  Upload,
  Grid,
  Drawer,
  FloatButton,
  theme
} from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  WalletOutlined,
  WifiOutlined,
  CopyOutlined,
  GlobalOutlined,
  PayCircleOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  TeamOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BgColorsOutlined,
  EditOutlined,
  LoadingOutlined,
  MenuOutlined,
  UploadOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import BetaClient from './beta/BetaClient';
import { useRouter } from 'next/navigation';
import { fetchApi, API_BASE_URL } from '@/lib/api';
import type { MenuProps, UploadProps, TableProps } from 'antd';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const API_HOST = API_BASE_URL.replace(/\/api$/, '');

const getAvatarSrc = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_HOST}${url}`;
};


interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  trafficQuota: number;
  trafficUsed: number;
  role: string;
  lastLoginAt?: string;
  nickname?: string;
  avatarUrl?: string;
}

interface Node {
  id: number;
  name: string;
  host: string;
  port: number;
  region: string;
  isOnline: boolean;
  isPremium: boolean;
  nodeGroup: string;
  domain?: string;
}

interface Tunnel {
  id: number;
  name: string;
  nodeName: string;
  nodeHost: string;
  nodeDomain?: string;
  protocol: string;
  localPort: number;
  remotePort: number;
  connectAddress: string;
  isActive: boolean;
}

interface DnsRecord {
  id?: number;
  domainName: string;
  rr: string;
  subDomain?: string;
  value?: string;
  tunnelId?: number;
  recordId: string;
}

interface Domain {
  id: number;
  domainName: string;
  remark?: string;
}

interface LotteryPrize {
  name: string;
  imageUrl: string;
  count: number;
}

interface Lottery {
  id: number;
  title: string;
  description: string;
  prizeName: string;
  prizeImageUrl: string;
  winnerCount: number;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'DRAWN' | 'ENDED' | 'PENDING';
  hasJoined: boolean;
  joinCode?: string;
  isProtected: boolean;
  prizes?: LotteryPrize[];
}

interface LotteryWinner {
  userId: number;
  username: string;
  prize: string;
}

interface TrafficDailyUsage {
    date: string;
    trafficIn: number;
    trafficOut: number;
    total: number;
  }

  export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('1');
    const [user, setUser] = useState<User | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [lotteries, setLotteries] = useState<Lottery[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState<number>(10); // GB
    const [paymentMethod, setPaymentMethod] = useState<string>('alipay');
    const [trafficPrice, setTrafficPrice] = useState<number>(1.00); // Default price per GB
  
    const [form] = Form.useForm();
    const [dnsForm] = Form.useForm();
    const [createLoading, setCreateLoading] = useState(false);
    const [dnsLoading, setDnsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
    
    // Lottery State
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
    const [currentLottery, setCurrentLottery] = useState<Lottery | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [winners, setWinners] = useState<LotteryWinner[]>([]);
    const [lotteryActionLoading, setLotteryActionLoading] = useState(false);
  
    // KYC State
    const [kycVerified, setKycVerified] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [kycLoading, setKycLoading] = useState(false);
    const [kycModalVisible, setKycModalVisible] = useState(false);
    const [kycUrl, setKycUrl] = useState('');
  
    // Theme State
    const { token } = theme.useToken();
    const [themeColor, setThemeColor] = useState(token.colorPrimary);
    // const [isThemeModalOpen, setIsThemeModalOpen] = useState(false); // Removed per user request
  
    // Edit Profile State
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editProfileLoading, setEditProfileLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
  
    // Payment State
    const [payModalVisible, setPayModalVisible] = useState(false);
    const [payQrcode, setPayQrcode] = useState('');
    const [currentPayOrderNo, setCurrentPayOrderNo] = useState('');
  
    const screens = useBreakpoint();
    const [mobileDashboardMenuOpen, setMobileDashboardMenuOpen] = useState(false);
  
    // Traffic Monitor State
    const [trafficHistory, setTrafficHistory] = useState<TrafficDailyUsage[]>([]);
    const [totalTrafficIn30Days, setTotalTrafficIn30Days] = useState(0);
    const [totalTrafficOut30Days, setTotalTrafficOut30Days] = useState(0);

  useEffect(() => {
    // const savedTheme = localStorage.getItem('themeColor');
    // if (savedTheme) {
    //   setThemeColor(savedTheme);
    // }
  }, []);

  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file as File);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data.success) {
        message.success('头像上传成功');
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data)); // Sync to localStorage
        onSuccess?.(data);
      } else {
        message.error(data.message || '上传失败');
        onError?.(new Error(data.message));
      }
    } catch (error: any) {
      message.error('上传出错: ' + error.message);
      onError?.(error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    setEditProfileLoading(true);
    try {
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(values)
      });
      if (res.success) {
        message.success('个人资料更新成功');
        setUser(res.data); // Update local user state
        localStorage.setItem('user', JSON.stringify(res.data)); // Sync to localStorage
        setIsEditProfileModalOpen(false);
      } else {
        message.error(res.message || '更新失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求失败');
    } finally {
      setEditProfileLoading(false);
    }
  };

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [userData, nodesData, tunnelsData, lotteriesData, priceData, kycData, trafficData, dnsData, domainData] = await Promise.all([
        fetchApi('/auth/me'),
        fetchApi('/frp/nodes'),
        fetchApi('/frp/tunnels'),
        fetchApi('/lotteries'),
        fetchApi('/payment/traffic-price').catch(() => ({ success: false })),
        fetchApi('/kyc/status').catch(() => ({ success: false })),
        fetchApi('/user/traffic-history?days=30').catch(() => ({ success: false, data: [] })),
        fetchApi('/dns/my-records').catch(() => ({ success: false, data: [] })),
        fetchApi('/dns/domains').catch(() => ({ success: false, data: [] })),
      ]);

      if (userData.success) setUser(userData.data);
      if (nodesData.success) setNodes(nodesData.data);
      if (tunnelsData.success) setTunnels(tunnelsData.data);
      if (lotteriesData.success) setLotteries(lotteriesData.data);
      if (dnsData.success) setDnsRecords(dnsData.data);
      if (domainData.success) setDomains(domainData.data);
      if (priceData.success && priceData.data) {
        setTrafficPrice(priceData.data.price);
      }
      if (kycData.success) {
        setKycVerified(kycData.data);
      }
      if (trafficData.success && Array.isArray(trafficData.data)) {
        // Process traffic data to ensure last 30 days are covered
        const rawData: TrafficDailyUsage[] = trafficData.data;
        const processedData: TrafficDailyUsage[] = [];
        const today = new Date();
        let totalIn = 0;
        let totalOut = 0;

        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          // Format as YYYY-MM-DD using local time to match backend LocalDate
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const found = rawData.find(item => item.date === dateStr);
          if (found) {
            processedData.push(found);
            totalIn += found.trafficIn || 0;
            totalOut += found.trafficOut || 0;
          } else {
            processedData.push({ date: dateStr, trafficIn: 0, trafficOut: 0, total: 0 });
          }
        }
        setTrafficHistory(processedData);
        setTotalTrafficIn30Days(totalIn);
        setTotalTrafficOut30Days(totalOut);
      }
    } catch (err: any) {
      if (err.message.includes('401')) {
        router.push('/dashboard/login');
      } else {
        message.error('加载数据失败: ' + err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/dashboard/login');
      return;
    }
    loadData();
  }, []);

  // Polling for KYC status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kycModalVisible && !kycVerified) {
      interval = setInterval(async () => {
        try {
          const res = await fetchApi('/kyc/status');
          if (res.success && res.data) {
            message.success('实名认证成功！');
            setKycVerified(true);
            setKycModalVisible(false);
            loadData(); // Refresh all data
          }
        } catch (e) {
          // ignore error during polling
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [kycModalVisible, kycVerified]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/dashboard/login');
  };

  const handleCreateTunnel = async (values: any) => {
    setCreateLoading(true);
    try {
      const res = await fetchApi('/frp/tunnels', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (res.success) {
        message.success('隧道创建成功');
        setIsModalOpen(false);
        form.resetFields();
        loadData(); // Refresh list
      } else {
        message.error(res.message || '创建失败');
      }
    } catch (err: any) {
      message.error(err.message || '创建请求失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddDnsRecord = async (values: any) => {
    setDnsLoading(true);
    try {
      const res = await fetchApi('/dns/records', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (res.success) {
        message.success('解析记录添加成功');
        setIsDnsModalOpen(false);
        dnsForm.resetFields();
        loadData();
      } else {
        message.error(res.message || '添加失败');
      }
    } catch (err: any) {
      message.error(err.message || '请求失败');
    } finally {
      setDnsLoading(false);
    }
  };

  const handleDeleteDnsRecord = async (record: DnsRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除域名解析 ${record.rr} 吗？`,
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        try {
          // Pass rr and domainName as query params
          const params = new URLSearchParams({
            rr: record.rr,
            domainName: record.domainName
          });
          const res = await fetchApi(`/dns/records?${params.toString()}`, {
            method: 'DELETE',
          });
          if (res.success) {
            message.success('删除成功');
            loadData();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (err: any) {
          message.error(err.message || '删除请求失败');
        }
      },
    });
  };

  const handleDeleteTunnel = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个隧道吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetchApi(`/frp/tunnels/${id}`, {
            method: 'DELETE',
          });
          if (res.success) {
            message.success('删除成功');
            setTunnels(tunnels.filter((t) => t.id !== id));
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (err: any) {
          message.error(err.message || '删除请求失败');
        }
      },
    });
  };

  const handleJoinLottery = async () => {
    if (!currentLottery) return;
    
    setLotteryActionLoading(true);
    try {
      const body = currentLottery.isProtected ? { code: joinCode } : {};
      const res = await fetchApi(`/lotteries/${currentLottery.id}/join`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      if (res.success) {
        message.success('参与抽奖成功！');
        setIsJoinModalOpen(false);
        setJoinCode('');
        // Refresh lotteries
        const data = await fetchApi('/lotteries');
        if (data.success) setLotteries(data.data);
      } else {
        message.error(res.message || '参与失败');
      }
    } catch (err: any) {
      message.error(err.message || '请求失败');
    } finally {
      setLotteryActionLoading(false);
    }
  };

  const handleViewWinners = async (lottery: Lottery) => {
    setCurrentLottery(lottery);
    setLotteryActionLoading(true);
    try {
      const res = await fetchApi(`/lotteries/${lottery.id}/winners`);
      if (res.success) {
        setWinners(res.data);
        setIsWinnersModalOpen(true);
      } else {
        message.error(res.message || '获取名单失败');
      }
    } catch (err: any) {
      message.error(err.message || '请求失败');
    } finally {
      setLotteryActionLoading(false);
    }
  };

  const handleRechargeTraffic = async () => {
    if (rechargeAmount <= 0) {
      message.error('请输入有效的流量数值');
      return;
    }

    setCreateLoading(true);
    try {
      const totalAmount = (rechargeAmount * trafficPrice).toFixed(2);
      const orderNo = `ZMSL${Date.now()}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
      
      const res = await fetchApi('/payment/create-traffic', {
        method: 'POST',
        body: JSON.stringify({ 
          amountGb: rechargeAmount,
          payType: paymentMethod,
          returnUrl: window.location.href
        })
      });
      
      if (res.success) {
        setCurrentPayOrderNo(res.data.outTradeNo || orderNo);
        
        if (res.data.qrcode) {
          setPayQrcode(res.data.qrcode);
          setPayModalVisible(true);
        } else if (res.data.payUrl) {
          setPayQrcode(res.data.payUrl);
          setPayModalVisible(true);
        } else if (res.data.urlscheme || res.data.urlScheme) {
          window.location.href = res.data.urlscheme || res.data.urlScheme;
        } else {
          message.error(res.message || '获取支付信息失败');
        }
      } else {
        message.error(res.message || '创建订单失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatTraffic = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenJoin = (lottery: Lottery) => {
    setCurrentLottery(lottery);
    if (lottery.isProtected) {
      setJoinCode('');
      setIsJoinModalOpen(true);
    } else {
      // Direct join
      Modal.confirm({
        title: '确认参与',
        content: `确定要参与抽奖"${lottery.title}"吗？`,
        onOk: async () => {
          try {
            const res = await fetchApi(`/lotteries/${lottery.id}/join`, { method: 'POST', body: JSON.stringify({}) });
            if (res.success) {
              message.success('参与成功！');
              const data = await fetchApi('/lotteries');
              if (data.success) setLotteries(data.data);
            } else {
              message.error(res.message);
            }
          } catch (e: any) {
            message.error(e.message);
          }
        }
      });
    }
  };

  const handleJoinWithCode = async () => {
    if (!currentLottery) return;
    try {
      const res = await fetchApi(`/lotteries/${currentLottery.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ code: joinCode })
      });
      if (res.success) {
        message.success('参与成功');
        setIsJoinModalOpen(false);
        setJoinCode('');
        const data = await fetchApi('/lotteries');
        if (data.success) setLotteries(data.data);
      } else {
        message.error(res.message);
      }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleInitiateKyc = async (values: any) => {
    setKycLoading(true);
    try {
      const res = await fetchApi('/kyc/initiate', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (res.success && res.data.url) {
        setKycUrl(res.data.url);
        setKycModalVisible(true);
        message.success('请使用手机扫描二维码完成认证');
      } else {
        message.error(res.message || '发起认证失败');
      }
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setKycLoading(false);
    }
  };

  const userMenuProps: MenuProps = {
    items: [
      {
        key: 'profile',
        label: '用户中心',
        icon: <UserOutlined />,
        onClick: () => setActiveTab('6'),
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const columns: TableProps<Tunnel>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
      fixed: screens.md ? false : ('left' as any),
      width: 120,
    },
    {
      title: '节点信息',
      key: 'nodeInfo',
      render: (_: any, record: Tunnel) => (
        <Space orientation="vertical" size={0}>
          <Tag color="blue">{record.nodeName}</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.nodeHost}</Text>
        </Space>
      ),
      responsive: ['md'],
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (text: string) => <Tag color={text === 'tcp' ? 'cyan' : 'purple'}>{text.toUpperCase()}</Tag>,
      width: 80,
    },
    {
      title: '本地端口',
      dataIndex: 'localPort',
      key: 'localPort',
      width: 100,
      responsive: ['sm'],
    },
    {
      title: '公网连接',
      key: 'connectAddress',
      render: (_: any, record: Tunnel) => {
        // Find linked DNS record
        const linkedDns = dnsRecords.find(d => d.tunnelId === record.id);
        
        return (
          <Space direction="vertical" size={2}>
            {linkedDns ? (
               <Text strong copyable={{ text: `${linkedDns.rr.replace('_minecraft._tcp.', '')}.${linkedDns.domainName}` }}>
                 <Tag color="green">域名</Tag>
                 {linkedDns.rr.replace('_minecraft._tcp.', '')}.{linkedDns.domainName}
               </Text>
            ) : null}
            
            {record.nodeDomain && !linkedDns && (
              <Text strong copyable={{ text: `${record.nodeDomain}:${record.remotePort}` }}>
                {record.nodeDomain}:{record.remotePort}
              </Text>
            )}
            
            <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: `${record.nodeHost}:${record.remotePort}` }}>
               IP: {record.nodeHost}:{record.remotePort}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'} icon={active ? <WifiOutlined /> : <DisconnectOutlined />}>
          {active ? '在线' : '离线'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: screens.md ? false : ('right' as any),
      render: (_: any, record: Tunnel) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteTunnel(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // Helper icon for status (DisconnectOutlined is not imported, let's just use generic Close)
  const DisconnectOutlined = () => <span style={{ marginRight: 4 }}>×</span>;

  const dashboardMenuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: '概览',
    },
    {
      key: '2',
      icon: <CloudServerOutlined />,
      label: '我的隧道',
    },
    {
      key: '3',
      icon: <ThunderboltOutlined />,
      label: '节点列表',
    },
    {
      key: 'dns',
      icon: <GlobalOutlined />,
      label: '二级域名',
    },
    {
      key: '4',
      icon: <PayCircleOutlined />,
      label: '充值中心',
    },
    {
      key: '5',
      icon: <GiftOutlined />,
      label: '抽奖活动',
    },
    {
      key: 'beta',
      icon: <ExperimentOutlined />,
      label: '内测申请',
    },
    {
      key: '6',
      icon: <UserOutlined />,
      label: '用户中心',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Space orientation="vertical" align="center">
          <div className="ant-spin ant-spin-spinning ant-spin-lg">
             <span className="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>
          </div>
          <Text type="secondary">正在加载控制台...</Text>
        </Space>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Layout style={{ minHeight: '80vh', background: token.colorBgLayout }}>
      <style jsx global>{`
        .dashboard-card {
          transition: all 0.3s;
          border: 1px solid ${token.colorBorderSecondary};
        }
        .dashboard-card:hover {
          box-shadow: ${token.boxShadow} !important;
          transform: translateY(-2px);
        }
        .lottery-card {
          transition: all 0.3s;
        }
        .lottery-card:hover {
          transform: translateY(-4px);
          box-shadow: ${token.boxShadow} !important;
        }
      `}</style>
      
      {!screens.md && (
        <>
          <FloatButton 
            icon={<MenuOutlined />} 
            type="primary" 
            style={{ bottom: 24, right: 24 }} 
            onClick={() => setMobileDashboardMenuOpen(true)}
          />
          <Drawer
            title="控制台菜单"
            placement="left"
            onClose={() => setMobileDashboardMenuOpen(false)}
            open={mobileDashboardMenuOpen}
            styles={{ body: { padding: 0 }, wrapper: { width: 240 } }}
          >
             <div style={{ padding: '24px', textAlign: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
               <Avatar size={64} src={getAvatarSrc(user.avatarUrl)} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary, marginBottom: 16 }} />
               <Title level={4} style={{ marginBottom: 4 }}>{user.nickname || user.username}</Title>
               <Tag color="blue">{user.role === 'Admin' ? '管理员' : '普通用户'}</Tag>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              style={{ borderRight: 0, marginTop: 16 }}
              onClick={(e) => {
                setActiveTab(e.key);
                setMobileDashboardMenuOpen(false);
              }}
              items={dashboardMenuItems}
            />
             <div style={{ padding: '0 24px', marginTop: 24 }}>
              <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
            </div>
          </Drawer>
        </>
      )}

      {screens.md && (
        <Sider 
          width={240} 
          style={{ 
            background: token.colorBgContainer, 
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            position: 'fixed',
            left: 0,
            top: 64,
            bottom: 0,
            zIndex: 99
          }}
        >
          <div style={{ padding: '24px', textAlign: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
             <Avatar size={64} src={getAvatarSrc(user.avatarUrl)} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary, marginBottom: 16 }} />
             <Title level={4} style={{ marginBottom: 4 }}>{user.nickname || user.username}</Title>
             <Tag color="blue">{user.role === 'Admin' ? '管理员' : '普通用户'}</Tag>
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            selectedKeys={[activeTab]}
            style={{ borderRight: 0, marginTop: 16 }}
            onClick={(e) => setActiveTab(e.key)}
            items={dashboardMenuItems}
          />
          <div style={{ position: 'absolute', bottom: 24, width: '100%', padding: '0 24px' }}>
            <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </div>
        </Sider>
      )}

      <Layout style={{ marginLeft: screens.md ? 240 : 0, padding: screens.md ? '24px' : '16px', width: '100%' }}>
        <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          
          {activeTab === '1' && (
            <>
              {/* Welcome Banner */}
              <Card 
                style={{ 
                  marginBottom: 24, 
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}dd 100%)`,
                  border: 'none',
                  borderRadius: 12
                }}
                styles={{ body: { padding: 32 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>欢迎回来, {user.nickname || user.username} 👋</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.85)', margin: '8px 0 0 0' }}>
                      这里是您的个人控制中心，您可以管理隧道、查看用量和充值。
                    </Paragraph>
                  </div>
                  <Button icon={<ReloadOutlined />} onClick={loadData} loading={refreshing} ghost>刷新数据</Button>
                </div>
              </Card>

              {/* KYC Reminder */}
              {!kycVerified && (
                <Card 
                  style={{ 
                    marginBottom: 24, 
                    border: `2px solid ${token.colorWarning}`,
                    borderRadius: 12,
                    background: token.colorWarningBg
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: token.colorWarning, marginRight: 12 }} />
                        <Title level={4} style={{ margin: 0, color: token.colorText }}>实名认证提醒</Title>
                      </div>
                      <Paragraph style={{ marginBottom: 16 }}>
                        完成实名认证后，您将获得以下特权：
                      </Paragraph>
                      <ul style={{ marginBottom: 24, paddingLeft: 20 }}>
                        <li style={{ marginBottom: 8 }}>✅ 访问国内节点，享受更低延迟</li>
                        <li style={{ marginBottom: 8 }}>✅ 解锁高级功能，提升使用体验</li>
                        <li>✅ 账号安全性增强，保障服务稳定</li>
                      </ul>
                    </div>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<SafetyCertificateOutlined />}
                      onClick={() => setActiveTab('6')}
                      style={{ height: 48, padding: '0 32px' }}
                    >
                      立即实名
                    </Button>
                  </div>
                </Card>
              )}

              {/* User Stats Grid */}
              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                  <Card className="dashboard-card" style={{ borderRadius: 16, height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ padding: 8, background: token.colorPrimaryBg, borderRadius: 8, marginRight: 12 }}>
                        <WalletOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                      </div>
                      <Text type="secondary">账户余额</Text>
                    </div>
                    <Title level={2} style={{ margin: '0 0 16px 0' }}>
                      ¥ {user.balance?.toFixed(2) || '0.00'}
                    </Title>
                    <Button type="primary" ghost onClick={() => setActiveTab('4')} style={{ color: token.colorPrimary, borderColor: token.colorPrimary }}>
                      购买流量
                    </Button>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="dashboard-card" style={{ borderRadius: 16, height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ padding: 8, background: token.colorSuccessBg, borderRadius: 8, marginRight: 12 }}>
                        <GlobalOutlined style={{ fontSize: 24, color: token.colorSuccess }} />
                      </div>
                      <Text type="secondary">流量使用情况</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 24 }}>{formatTraffic(user.trafficUsed)}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>/ {formatTraffic(user.trafficQuota)}</Text>
                    </div>
                    <div style={{ height: 6, background: token.colorFillSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min((user.trafficUsed / (user.trafficQuota || 1)) * 100, 100)}%`,
                          background: token.colorSuccess,
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      剩余: {formatTraffic(user.trafficQuota - user.trafficUsed)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="dashboard-card" style={{ borderRadius: 16, height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ padding: 8, background: token.colorWarningBg, borderRadius: 8, marginRight: 12 }}>
                        <CloudServerOutlined style={{ fontSize: 24, color: token.colorWarning }} />
                      </div>
                      <Text type="secondary">活跃隧道</Text>
                    </div>
                    <Title level={2} style={{ margin: '0 0 16px 0' }}>
                      {tunnels.length} <span style={{ fontSize: 14, color: token.colorTextSecondary, fontWeight: 'normal' }}>/ 5</span>
                    </Title>
                    <Button onClick={() => setActiveTab('2')} type="link" style={{ paddingLeft: 0 }}>
                      管理隧道 &gt;
                    </Button>
                  </Card>
                </Col>
              </Row>

              {/* Traffic Monitor Chart */}
              <Card 
                className="dashboard-card" 
                style={{ 
                  borderRadius: 16, 
                  marginBottom: 24, 
                  border: 'none',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>流量监控</Text>
                  <Tag color="blue" style={{ margin: 0 }}>近30天</Tag>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 4, marginBottom: 24 }}>
                  {trafficHistory.map((item, idx) => {
                    // Find max value to scale
                    const max = Math.max(...trafficHistory.map(i => i.total), 1024 * 1024); // at least 1MB to avoid div by zero
                    const heightPercent = Math.max((item.total / max) * 100, 5); // min 5% height
                    
                    return (
                      <Tooltip key={idx} title={`${item.date}: ${formatTraffic(item.total)} (上传: ${formatTraffic(item.trafficOut)}, 下载: ${formatTraffic(item.trafficIn)})`}>
                        <div 
                          style={{ 
                            flex: 1, 
                            background: idx === trafficHistory.length - 1 ? token.colorPrimary : token.colorFill,
                            height: `${heightPercent}%`,
                            borderRadius: 2,
                            transition: 'height 0.5s ease',
                            cursor: 'pointer'
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>近30天总上传 (Out)</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorText }}>{formatTraffic(totalTrafficOut30Days)}</div>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>近30天总下载 (In)</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorText }}>{formatTraffic(totalTrafficIn30Days)}</div>
                  </Col>
                </Row>
              </Card>

              {/* Recent Tunnels (Simplified) */}
              <Card
                title={<Title level={4} style={{ margin: 0 }}>最近使用的隧道</Title>}
                extra={
                  <Button type="link" onClick={() => setActiveTab('2')}>查看全部</Button>
                }
                style={{ borderRadius: 12, boxShadow: token.boxShadow }}
                className="dashboard-card"
              >
                 {tunnels.length === 0 ? (
                  <Alert 
                    message="暂无隧道" 
                    description="您还没有创建任何隧道，点击下方按钮开始创建。" 
                    type="info" 
                    showIcon 
                    action={
                      <Button size="small" type="primary" onClick={() => setIsModalOpen(true)}>
                        立即创建
                      </Button>
                    }
                  />
                ) : (
                  <Table
                    dataSource={tunnels.slice(0, 3)}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 800 }}
                  />
                )}
              </Card>
            </>
          )}

          {activeTab === '2' && (
            <Card
              title={<Title level={4} style={{ margin: 0 }}>我的隧道列表</Title>}
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size={screens.md ? "large" : "middle"}>
                  新建隧道
                </Button>
              }
              style={{ borderRadius: 12, boxShadow: token.boxShadow }}
              className="dashboard-card"
            >
              {tunnels.length === 0 ? (
                <Alert 
                  message="暂无隧道" 
                  description="您还没有创建任何隧道，点击右上角按钮开始创建。" 
                  type="info" 
                  showIcon 
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Table
                  dataSource={tunnels}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          )}

          {activeTab === '3' && (
            <Card
              title={<Title level={4} style={{ margin: 0 }}>可用节点列表</Title>}
              style={{ borderRadius: 12, boxShadow: token.boxShadow }}
              className="dashboard-card"
            >
              <Row gutter={[16, 16]}>
                {nodes.map(node => (
                  <Col xs={24} sm={12} md={8} key={node.id}>
                    <Card 
                      hoverable 
                      title={
                        <Space>
                          {node.isPremium && <Tag color="gold">付费</Tag>}
                          {node.name}
                        </Space>
                      }
                      extra={node.isOnline ? <Tag color="success">在线</Tag> : <Tag color="error">离线</Tag>}
                      actions={[
                        <Button type="link" key="create" onClick={() => {
                          setIsModalOpen(true);
                          form.setFieldsValue({ nodeId: node.id });
                        }}>在此节点创建隧道</Button>
                      ]}
                    >
                      <Space orientation="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">区域:</Text>
                          <Text>{node.region}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">域名:</Text>
                          <Text copyable>{node.domain || '-'}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">地址:</Text>
                          <Text copyable>{node.host}</Text>
                        </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">端口:</Text>
                          <Text>{node.port}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {activeTab === 'dns' && (
            <Card
              title={<Title level={4} style={{ margin: 0 }}>二级域名管理</Title>}
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDnsModalOpen(true)}>
                  添加解析
                </Button>
              }
              style={{ borderRadius: 12, boxShadow: token.boxShadow }}
              className="dashboard-card"
            >
              <Alert 
                message="SRV 解析说明" 
                description="添加二级域名后，您可以使用自定义的域名（如 mc.example.com）直接连接到您的服务器，无需输入端口号。删除隧道时会自动删除关联的解析记录。" 
                type="info" 
                showIcon 
                style={{ marginBottom: 24 }} 
              />
              
              <Table
                dataSource={dnsRecords}
                rowKey="id"
                columns={[
                  {
                    title: '主机记录 (RR)',
                    dataIndex: 'rr',
                    key: 'rr',
                    render: (text) => <Text strong>{text.replace('_minecraft._tcp.', '')}</Text>
                  },
                  {
                    title: '完整域名',
                    key: 'fullDomain',
                    render: (_, record) => (
                      <Text copyable>{record.rr.replace('_minecraft._tcp.', '')}.{record.domainName}</Text>
                    )
                  },
                  {
                    title: '关联隧道',
                    key: 'tunnel',
                    render: (_, record) => {
                      const tunnel = tunnels.find(t => t.id === record.tunnelId);
                      return tunnel ? <Tag color="blue">{tunnel.name}</Tag> : <Text type="secondary">-</Text>;
                    }
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, record) => (
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteDnsRecord(record)}>删除</Button>
                    )
                  }
                ]}
              />
            </Card>
          )}

          {activeTab === '4' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ color: token.colorPrimary, marginBottom: 8 }}>
                  <ThunderboltOutlined /> 流量加油站
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 16 }}>
                  高速流量包，即充即用，永久有效，不随月度清零。
                </Paragraph>
              </div>

              <Row gutter={[24, 24]}>
                <Col xs={24} md={14}>
                  <Card 
                    title="选择充值额度" 
                    bordered={false}
                    style={{ borderRadius: 16, boxShadow: token.boxShadow, height: '100%' }}
                  >
                    <Row gutter={[12, 12]}>
                      {[10, 20, 50, 100, 200, 500].map(amount => (
                        <Col span={8} key={amount}>
                          <div
                            onClick={() => setRechargeAmount(amount)}
                            style={{
                              border: rechargeAmount === amount ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                              borderRadius: 8,
                              padding: '16px 0',
                              textAlign: 'center',
                              cursor: 'pointer',
                              background: rechargeAmount === amount ? `${themeColor}1a` : '#fff',
                              transition: 'all 0.3s',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: rechargeAmount === amount ? themeColor : '#333' }}>
                              {amount} GB
                            </div>
                            {amount >= 100 && (
                              <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                right: 0, 
                                background: '#ff4d4f', 
                                color: '#fff', 
                                fontSize: 10, 
                                padding: '2px 6px',
                                borderBottomLeftRadius: 8
                              }}>
                                热销
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                    
                    <div style={{ marginTop: 24 }}>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>自定义数量</Text>
                      <InputNumber 
                        min={1} 
                        max={10000} 
                        value={rechargeAmount} 
                        onChange={(val) => setRechargeAmount(val || 1)} 
                        style={{ width: '100%' }} 
                        size="large"
                        addonAfter="GB"
                        controls={false}
                      />
                    </div>

                    <div style={{ marginTop: 32 }}>
                      <Text strong style={{ marginBottom: 12, display: 'block' }}>支付方式</Text>
                      <Row gutter={[12, 12]}>
                        <Col span={12}>
                          <div
                            onClick={() => setPaymentMethod('alipay')}
                            style={{
                              border: paymentMethod === 'alipay' ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                              borderRadius: 8,
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              gap: 8,
                              background: paymentMethod === 'alipay' ? token.colorPrimaryBg : token.colorBgContainer,
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ color: token.colorPrimary, fontSize: 20 }}><PayCircleOutlined /></div>
                            <span style={{ fontWeight: 500 }}>支付宝</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div
                            onClick={() => setPaymentMethod('wxpay')}
                            style={{
                              border: paymentMethod === 'wxpay' ? '2px solid #52c41a' : `1px solid ${token.colorBorderSecondary}`,
                              borderRadius: 8,
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              gap: 8,
                              background: paymentMethod === 'wxpay' ? token.colorSuccessBg : token.colorBgContainer,
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ color: '#52c41a', fontSize: 20 }}><PayCircleOutlined /></div>
                            <span style={{ fontWeight: 500 }}>微信支付</span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={10}>
                  <Card 
                    title="订单详情" 
                    variant="borderless"
                    style={{ borderRadius: 16, boxShadow: token.boxShadow, height: '100%', background: token.colorFillAlter }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <Text type="secondary">充值流量</Text>
                          <Text strong>{rechargeAmount} GB</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <Text type="secondary">当前单价</Text>
                          <Text>¥ {Number(trafficPrice).toFixed(2)} / GB</Text>
                        </div>
                        <div style={{ borderTop: `1px dashed ${token.colorBorder}`, margin: '16px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 16 }}>总计应付</Text>
                          <Text style={{ fontSize: 28, color: token.colorError, fontWeight: 'bold' }}>
                            ¥ {(rechargeAmount * trafficPrice).toFixed(2)}
                          </Text>
                        </div>
                      </div>

                      <Button 
                        type="primary" 
                        block 
                        size="large" 
                        style={{ 
                          height: 56, 
                          fontSize: 18, 
                          borderRadius: 28, 
                          background: `linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorPrimary}dd 100%)`,
                          border: 'none',
                          boxShadow: `0 4px 15px ${token.colorPrimary}66`,
                          marginTop: 24
                        }}
                        onClick={handleRechargeTraffic}
                        loading={createLoading}
                        icon={<ThunderboltOutlined />}
                      >
                        立即充值
                      </Button>
                      
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <LockOutlined /> 安全加密支付
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === '5' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
                 <Title level={2} style={{ color: token.colorPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <GiftOutlined /> 幸运抽奖
                 </Title>
                 <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary }}>
                   免费参与抽奖活动，每次抽奖都有机会，赢取丰厚流量包、余额红包及 VIP 特权！
                 </Paragraph>
              </div>

              {lotteries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                   <div style={{ fontSize: 64, color: token.colorFillSecondary, marginBottom: 24 }}>📭</div>
                   <Title level={4} type="secondary">暂无正在进行的抽奖活动</Title>
                   <Text type="secondary">请稍后再来查看，更多福利准备中...</Text>
                </div>
              ) : (
                <Row gutter={[24, 24]}>
                  {lotteries.map(lottery => {
                    const isActive = lottery.status === 'ACTIVE';
                    const isEnded = lottery.status === 'ENDED' || lottery.status === 'DRAWN';
                    
                    // Card Theme Colors
                    const headerBg = isActive 
                      ? 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)' 
                      : 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)';
                    
                    return (
                      <Col xs={24} key={lottery.id}>
                        <Card 
                          hoverable
                          className="lottery-card"
                          style={{ 
                            borderRadius: 16, 
                            overflow: 'hidden', 
                            border: 'none',
                            boxShadow: token.boxShadow
                          }}
                          styles={{ body: { padding: 0 } }}
                        >
                           {/* Header */}
                           <div style={{ 
                             background: headerBg, 
                             padding: '24px 32px',
                             color: '#fff',
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center'
                           }}>
                             <div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                  <Title level={3} style={{ color: '#fff', margin: 0 }}>{lottery.title}</Title>
                                  <Tag color={isActive ? '#f50' : '#666'} style={{ border: 'none', padding: '2px 10px', fontSize: 12 }}>
                                    {isActive ? '进行中 🔥' : (lottery.status === 'DRAWN' ? '已开奖 ✨' : '已结束')}
                                  </Tag>
                               </div>
                               <Space size="middle" style={{ opacity: 0.9 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CalendarOutlined /> {new Date(lottery.startTime).toLocaleDateString()} - {new Date(lottery.endTime).toLocaleDateString()}
                                  </span>
                                  {isActive && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <ClockCircleOutlined /> 截止: {new Date(lottery.endTime).toLocaleTimeString()}
                                    </span>
                                  )}
                               </Space>
                             </div>
                             <div style={{ textAlign: 'right', opacity: 0.8 }}>
                               <div style={{ fontSize: 12 }}>获奖人数</div>
                               <div style={{ fontSize: 24, fontWeight: 'bold' }}>{lottery.winnerCount}</div>
                             </div>
                           </div>

                           {/* Body */}
                           <div style={{ padding: '32px' }}>
                             <Row gutter={[48, 24]}>
                               <Col xs={24} md={14}>
                                  <Title level={5} style={{ marginBottom: 16 }}>活动详情</Title>
                                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: token.colorText, marginBottom: 24 }}>
                                    {lottery.description}
                                  </Paragraph>
                                  
                                  <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <TrophyOutlined style={{ color: '#faad14' }} /> 奖品列表
                                  </Title>
                                  
                                  {lottery.prizes && lottery.prizes.length > 0 ? (
                                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                       {lottery.prizes.map((p, idx) => (
                                         <div key={idx} style={{ 
                                           background: token.colorBgContainer, 
                                           border: `1px solid ${token.colorBorderSecondary}`, 
                                           borderRadius: 8, 
                                           padding: '12px 20px',
                                           display: 'flex',
                                           alignItems: 'center',
                                           gap: 12,
                                           minWidth: 160,
                                           boxShadow: token.boxShadowTertiary
                                         }}>
                                            <div style={{ fontSize: 24 }}>🎁</div>
                                            <div>
                                              <div style={{ fontWeight: 600, color: token.colorText }}>{p.name}</div>
                                              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>x {p.count} 份</div>
                                            </div>
                                         </div>
                                       ))}
                                     </div>
                                  ) : (
                                     <div style={{ 
                                        background: token.colorBgContainer, 
                                        border: `1px solid ${token.colorBorderSecondary}`, 
                                        borderRadius: 8, 
                                        padding: '16px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 12
                                     }}>
                                        <div style={{ fontSize: 28 }}>🏆</div>
                                        <div>
                                          <div style={{ fontWeight: 600, fontSize: 16 }}>{lottery.prizeName}</div>
                                          <div style={{ color: token.colorTextSecondary }}>共 {lottery.winnerCount} 个名额</div>
                                        </div>
                                     </div>
                                  )}
                               </Col>
                               
                               <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: `1px solid ${token.colorBorderSecondary}` }}>
                                  {isActive ? (
                                     <div style={{ textAlign: 'center', width: '100%' }}>
                                        {lottery.hasJoined ? (
                                          <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }}>✅</div>
                                            <Title level={4} style={{ color: '#52c41a' }}>已成功参与</Title>
                                            <Text type="secondary">静候佳音，祝您好运！</Text>
                                          </div>
                                        ) : (
                                          <div style={{ textAlign: 'center', width: '100%', padding: '20px 0' }}>
                                            <div style={{ marginBottom: 24 }}>
                                              <TeamOutlined style={{ fontSize: 48, color: '#722ed1', opacity: 0.5 }} />
                                              <div style={{ marginTop: 8, color: token.colorTextSecondary }}>等待您的参与</div>
                                            </div>
                                            <Button 
                                              type="primary" 
                                              size="large" 
                                              shape="round"
                                              style={{ 
                                                height: 56, 
                                                padding: '0 48px', 
                                                fontSize: 20, 
                                                background: 'linear-gradient(90deg, #722ed1 0%, #b37feb 100%)',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(114, 46, 209, 0.4)'
                                              }}
                                              onClick={() => handleOpenJoin(lottery)}
                                              loading={lotteryActionLoading && currentLottery?.id === lottery.id}
                                            >
                                              立即参与
                                            </Button>
                                            <div style={{ marginTop: 16, fontSize: 12, color: token.colorTextSecondary }}>
                                              {lottery.isProtected ? '🔒 需要参与口令' : '🔓 点击即可参与'}
                                            </div>
                                          </div>
                                        )}
                                     </div>
                                  ) : (
                                     <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ fontSize: 48, color: token.colorTextQuaternary, marginBottom: 16 }}>🏁</div>
                                        <Title level={4} style={{ color: token.colorTextSecondary }}>活动已结束</Title>
                                        {lottery.status === 'DRAWN' && (
                                          <Button 
                                            size="large" 
                                            icon={<TrophyOutlined />}
                                            onClick={() => handleViewWinners(lottery)}
                                            style={{ marginTop: 16 }}
                                          >
                                            查看中奖名单
                                          </Button>
                                        )}
                                     </div>
                                  )}
                               </Col>
                             </Row>
                           </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* Join Modal */}
              <Modal
                title="🔐 输入参与口令"
                open={isJoinModalOpen}
                onCancel={() => setIsJoinModalOpen(false)}
                onOk={handleJoinWithCode}
                okText="确认参与"
                cancelText="取消"
                centered
              >
                <div style={{ padding: '20px 0' }}>
                  <Alert message="该抽奖活动受到保护，请输入获取到的口令以继续。" type="info" showIcon style={{ marginBottom: 24 }} />
                  <Input 
                    placeholder="请输入活动口令" 
                    size="large"
                    prefix={<LockOutlined />}
                    value={joinCode} 
                    onChange={e => setJoinCode(e.target.value)} 
                    onPressEnter={handleJoinWithCode}
                  />
                </div>
              </Modal>

              {/* Winners Modal */}
              <Modal
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrophyOutlined style={{ color: '#faad14', fontSize: 24 }} />
                    <span>中奖名单公示</span>
                  </div>
                }
                open={isWinnersModalOpen}
                onCancel={() => setIsWinnersModalOpen(false)}
                footer={null}
                width={600}
                centered
              >
                <div style={{ padding: '16px 0' }}>
                  {winners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                      暂无中奖数据
                    </div>
                  ) : (
                    <Table
                      dataSource={winners}
                      rowKey="userId"
                      pagination={false}
                      columns={[
                        { 
                          title: '幸运用户', 
                          dataIndex: 'username', 
                          key: 'username',
                          render: (text) => (
                            <Space>
                              <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} size="small" />
                              <Text strong>{text}</Text>
                            </Space>
                          )
                        },
                        { 
                          title: '获得奖品', 
                          dataIndex: 'prize', 
                          key: 'prize',
                          render: (text) => <Tag color="gold">{text}</Tag>
                        },
                      ]}
                    />
                  )}
                  <div style={{ marginTop: 24, textAlign: 'center', color: token.colorTextSecondary, fontSize: 12 }}>
                    * 系统自动开奖，结果公平公正
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {activeTab === 'beta' && (
            <BetaClient />
          )}

          {activeTab === '6' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
                 <Title level={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <UserOutlined /> 用户中心
                 </Title>
                 <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary }}>
                   管理您的个人资料和实名认证状态
                 </Paragraph>
              </div>

              <Row gutter={[24, 24]}>
                {/* 基础信息卡片 */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserOutlined /> 基础信息</div>}
                    style={{ borderRadius: 16, boxShadow: token.boxShadow, height: '100%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                      <Avatar size={64} src={getAvatarSrc(user.avatarUrl)} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary, marginRight: 16 }} />
                      <div>
                        <Title level={4} style={{ margin: '0 0 4px 0' }}>{user.nickname || user.username}</Title>
                        <Text type="secondary">{user.email}</Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text type="secondary">用户角色</Text>
                        <Tag color="blue">{user.role === 'Admin' ? '管理员' : '普通用户'}</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary">用户ID</Text>
                        <Tag color="green">{user.id}</Tag>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />} 
                      onClick={() => setIsEditProfileModalOpen(true)}
                      style={{ width: '100%' }}
                    >
                      编辑资料
                    </Button>
                  </Card>
                </Col>

                {/* 实名认证卡片 */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SafetyCertificateOutlined /> 实名认证</div>}
                    style={{ borderRadius: 16, boxShadow: token.boxShadow, height: '100%' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: kycVerified ? 0 : 24 }}>
                      <Space>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: kycVerified ? '#52c41a' : '#faad14' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>{kycVerified ? '实名认证已完成' : '实名认证未完成'}</div>
                          <div style={{ fontSize: 14, color: token.colorTextSecondary }}>
                            {kycVerified ? '您可以畅享所有节点服务及高级功能' : '为了保障服务安全，部分节点需要实名认证才可使用'}
                          </div>
                        </div>
                      </Space>
                      <Tag color={kycVerified ? 'success' : 'warning'} style={{ fontSize: 14, padding: '4px 12px' }}>
                        {kycVerified ? '已认证' : '未认证'}
                      </Tag>
                    </div>
                    
                    {!kycVerified && (
                      <div style={{ borderTop: `1px dashed ${token.colorBorder}`, paddingTop: 24 }}>
                        <Form layout="vertical" onFinish={handleInitiateKyc}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item label="真实姓名" name="name" rules={[{ required: true, message: '请输入真实姓名' }]}>
                                <Input placeholder="请输入您的真实姓名" size="large" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="身份证号" name="idCard" rules={[{ required: true, message: '请输入身份证号' }]}>
                                <Input placeholder="请输入您的身份证号" size="large" />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            loading={kycLoading} 
                            icon={<SafetyCertificateOutlined />}
                            style={{ width: '100%', marginTop: 8 }}
                          >
                            立即前往认证
                          </Button>
                          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: token.colorTextSecondary }}>
                            <SafetyCertificateOutlined /> 您的信息仅用于实名校验，系统将严格加密存储
                          </div>
                        </Form>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* Create Tunnel Modal */}
          <Modal
            title="创建新隧道"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateTunnel}
              initialValues={{ protocol: 'tcp', localPort: 25565 }}
            >
              <Alert message="注意：请确保您选择的本地端口与实际服务端口一致" type="warning" showIcon style={{ marginBottom: 24 }} />
              
              <Form.Item
                name="name"
                label="隧道名称"
                rules={[{ required: true, message: '请输入隧道名称' }]}
              >
                <Input placeholder="例如: 我的MC服务器" prefix={<CloudServerOutlined />} />
              </Form.Item>

              <Form.Item
                name="nodeId"
                label="选择节点"
                rules={[{ required: true, message: '请选择一个节点' }]}
              >
                <Select placeholder="选择可用节点" listHeight={300}>
                  {nodes.map((node) => (
                    <Option key={node.id} value={node.id} disabled={!node.isOnline}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <span style={{ fontWeight: 500 }}>{node.name}</span>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{node.region}</Text>
                        </span>
                        <Space size="small">
                           {node.isPremium && <Tag color="gold">付费</Tag>}
                           {!node.isOnline && <Tag color="error">离线</Tag>}
                        </Space>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="protocol"
                label="协议类型"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="tcp">TCP (Minecraft Java版推荐)</Option>
                  <Option value="udp">UDP (Minecraft 基岩版推荐)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="localPort"
                label="本地端口"
                tooltip="您本地服务的端口，FRP 客户端连接时使用"
                rules={[{ required: true, type: 'number', min: 1, max: 65535 }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={65535} prefix={<ThunderboltOutlined />} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={() => setIsModalOpen(false)}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={createLoading}>
                    立即创建
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Add DNS Record Modal */}
          <Modal
            title="添加二级域名解析"
            open={isDnsModalOpen}
            onCancel={() => setIsDnsModalOpen(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={dnsForm}
              layout="vertical"
              onFinish={handleAddDnsRecord}
              initialValues={{ method: 'tunnel' }}
            >
              <Form.Item label="添加方式" name="method">
                <Select disabled>
                   <Option value="tunnel">绑定隧道 (推荐)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="tunnelId"
                label="选择隧道"
                rules={[{ required: true, message: '请选择一个隧道' }]}
              >
                <Select placeholder="请选择您的隧道">
                  {tunnels.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name} ({t.nodeName})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="域名设置" required style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Form.Item
                    name="subDomain"
                    rules={[{ required: true, message: '请输入前缀' }]}
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="前缀，如 mc" />
                  </Form.Item>
                  <span style={{ paddingBottom: 24 }}>.</span>
                  <Form.Item
                    name="domainName"
                    rules={[{ required: true, message: '请选择域名' }]}
                    style={{ width: 150 }}
                  >
                    <Select placeholder="选择后缀">
                      {domains.map(d => (
                        <Option key={d.id} value={d.domainName}>{d.domainName}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Form.Item>

              <Alert message="将会自动创建 SRV 记录指向该隧道的远程端口。" type="info" style={{ marginBottom: 24 }} />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={() => setIsDnsModalOpen(false)}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={dnsLoading}>
                    立即添加
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Profile Modal - REMOVED, replaced by Sidebar User Center */}

          {/* KYC QR Code Modal */}
          <Modal
            title="扫码实名认证"
            open={kycModalVisible}
            onCancel={() => setKycModalVisible(false)}
            footer={null}
            width={400}
            centered
          >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ marginBottom: 24, background: token.colorFillSecondary, padding: 24, borderRadius: 8, display: 'inline-block' }}>
                <QRCode value={kycUrl} size={200} />
              </div>
              <Title level={5}>请使用手机扫一扫</Title>
              <Text type="secondary">扫描上方二维码完成实名认证</Text>
              <div style={{ marginTop: 24 }}>
                <Button type="primary" onClick={() => {
                  setKycModalVisible(false);
                  loadData(); // Refresh status
                }}>
                  我已完成认证
                </Button>
              </div>
            </div>
          </Modal>

          {/* Payment QR Code Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PayCircleOutlined style={{ color: token.colorPrimary }} />
                <span>扫码支付</span>
              </div>
            }
            open={payModalVisible}
            onCancel={() => setPayModalVisible(false)}
            footer={null}
            width={420}
            centered
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ marginBottom: 20, background: token.colorFillSecondary, padding: 20, borderRadius: 12, display: 'inline-block' }}>
                <QRCode value={payQrcode} size={220} />
              </div>
              <Title level={5} style={{ marginBottom: 8 }}>请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫一扫</Title>
              <Text type="secondary">订单号：{currentPayOrderNo}</Text>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">
                  支付金额：<span style={{ color: token.colorError, fontSize: 18, fontWeight: 'bold' }}>¥{(rechargeAmount * trafficPrice).toFixed(2)}</span>
                </Text>
              </div>
              
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${token.colorBorder}` }}>
                <Space>
                  <Button onClick={() => {
                    setPayModalVisible(false);
                    loadData();
                  }}>
                    我已完成支付
                  </Button>
                  <Button danger onClick={() => setPayModalVisible(false)}>
                    取消
                  </Button>
                </Space>
              </div>
            </div>
          </Modal>

          {/* Edit Profile Modal */}
          <Modal
            title="编辑个人资料"
            open={isEditProfileModalOpen}
            onCancel={() => setIsEditProfileModalOpen(false)}
            footer={null}
            centered
          >
            <Form 
              layout="vertical" 
              onFinish={handleUpdateProfile}
              initialValues={{
                nickname: user?.nickname
              }}
            >
              <Form.Item label="头像" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader"
                    showUploadList={false}
                    customRequest={handleAvatarUpload}
                    accept="image/*"
                  >
                    {user?.avatarUrl && !avatarLoading ? (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={getAvatarSrc(user.avatarUrl)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="avatar-hover-mask" style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}>
                          <EditOutlined style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>{avatarLoading ? '上传中' : '上传'}</div>
                      </div>
                    )}
                  </Upload>
                </div>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>点击头像可更换，支持 JPG/PNG</div>
              </Form.Item>
              <Form.Item label="昵称" name="nickname">
                <Input placeholder="给自己起个好听的名字" prefix={<EditOutlined />} maxLength={20} />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <Button onClick={() => setIsEditProfileModalOpen(false)}>取消</Button>
                <Button type="primary" htmlType="submit" loading={editProfileLoading}>保存昵称</Button>
              </div>
            </Form>
          </Modal>
        </Content>
      </Layout>
      <style jsx>{`
        :global(.avatar-uploader .ant-upload) {
          overflow: hidden;
          border-radius: 50%;
        }
        :global(.avatar-uploader:hover .avatar-hover-mask) {
          opacity: 1 !important;
        }
      `}</style>
    </Layout>
  );
}
